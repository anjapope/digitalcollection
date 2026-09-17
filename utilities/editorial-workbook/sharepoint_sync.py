"""Read the shared workbook and referenced images into a disposable Pages checkout.

No SharePoint writes, repository commits, or deployment happen in this script.
Authentication uses GitHub OIDC, not a stored Microsoft password/client secret.
"""
import csv
import hashlib
import io
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from urllib.parse import quote, urlencode, urlsplit
from urllib.request import Request, urlopen, build_opener, HTTPRedirectHandler
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parents[2]
GRAPH = 'https://graph.microsoft.com/v1.0'
LIMIT = 25 * 1024 * 1024


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def request(url, *, token=None, data=None, limit=LIMIT):
    if urlsplit(url).scheme != 'https':
        raise ValueError('Only HTTPS endpoints are supported')
    headers = {'Authorization': 'Bearer ' + token} if token else {}
    if data is not None:
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
    # Never forward an authorization header to a redirected host.
    opener = build_opener(NoRedirect()) if token else build_opener()
    with opener.open(Request(url, data=data, headers=headers), timeout=60) as response:
        value = response.read(limit + 1)
    if len(value) > limit:
        raise ValueError('File exceeds the 25 MB import limit')
    return value


def required(name):
    value = os.environ.get(name, '').strip()
    if not value:
        raise ValueError('Missing repository variable: ' + name)
    return value


def graph_token():
    tenant, client = required('MS_TENANT_ID'), required('MS_CLIENT_ID')
    if not all(re.fullmatch(r'[0-9a-fA-F-]{36}', value) for value in (tenant, client)):
        raise ValueError('Microsoft tenant and client IDs must be UUIDs')
    endpoint = required('ACTIONS_ID_TOKEN_REQUEST_URL')
    endpoint += ('&' if '?' in endpoint else '?') + urlencode({'audience': 'api://AzureADTokenExchange'})
    assertion = json.loads(request(endpoint, token=required('ACTIONS_ID_TOKEN_REQUEST_TOKEN')))['value']
    payload = urlencode({'client_id': client, 'scope': 'https://graph.microsoft.com/.default',
                         'grant_type': 'client_credentials',
                         'client_assertion_type': 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                         'client_assertion': assertion}).encode()
    return json.loads(request(f'https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token', data=payload))['access_token']


class Source:
    def __init__(self, token, drive, folder):
        self.token = token
        self.base = f'{GRAPH}/drives/{quote(drive, safe="")}/items/{quote(folder, safe="")}'

    def item(self, relative):
        path = '/'.join(quote(part, safe='') for part in relative.split('/'))
        return json.loads(request(self.base + ':/' + path, token=self.token))

    def download(self, relative):
        before = self.item(relative)
        if 'file' not in before or before.get('size', LIMIT + 1) > LIMIT:
            raise ValueError('Missing file or file too large: ' + relative)
        # The preauthenticated URL receives NO Microsoft bearer header.
        value = request(before['@microsoft.graph.downloadUrl'])
        after = self.item(relative)
        if before.get('eTag') != after.get('eTag'):
            raise ValueError('File changed during import; retry after editing: ' + relative)
        return value


def image_name(value):
    """Bare filenames refer to Teams; existing site paths/HTTPS links stay intact."""
    if not value or value.startswith(('/', 'https://', 'objects/')):
        return None
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9 _().-]*\.(?:png|jpe?g)', value, re.I):
        raise ValueError('Use a simple PNG/JPG filename in Images: ' + value)
    return value


def verify_image(name, value):
    png = name.lower().endswith('.png')
    if not (value.startswith(b'\x89PNG\r\n\x1a\n') if png else value.startswith(b'\xff\xd8\xff')):
        raise ValueError('File does not match its PNG/JPG extension: ' + name)


def copy_images(source, root=ROOT):
    downloaded = {}
    for filename, columns in [('room_content.csv', ['image']),
                              ('demo-metadata.csv', ['object_location', 'image_small', 'image_thumb'])]:
        path = root / '_data' / filename
        with path.open(encoding='utf-8-sig', newline='') as stream:
            reader = csv.DictReader(stream)
            headers, records = reader.fieldnames, list(reader)
        for row in records:
            for column in columns:
                name = image_name(row.get(column, ''))
                if name is None:
                    continue
                if name not in downloaded:
                    value = source.download('Images/' + name)
                    verify_image(name, value)
                    asset = hashlib.sha256(value).hexdigest() + Path(name).suffix.lower()
                    target = root / 'assets' / 'img' / 'editorial' / asset
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(value)
                    downloaded[name] = '/assets/img/editorial/' + asset
                row[column] = downloaded[name]
        output = io.StringIO(newline='')
        writer = csv.DictWriter(output, fieldnames=headers, lineterminator='\n')
        writer.writeheader()
        writer.writerows(records)
        path.write_text(output.getvalue(), encoding='utf-8', newline='')
    return len(downloaded)


def main():
    # This guard prevents accidental local application to an editor's checkout.
    if os.environ.get('GITHUB_ACTIONS') != 'true':
        raise ValueError('Run through the GitHub validation workflow in a disposable checkout')
    source = Source(graph_token(), required('SP_DRIVE_ID'), required('SP_FOLDER_ID'))
    name = 'ArchIvory Editorial Workbook.xlsx'
    original = source.item(name)['eTag']
    with tempfile.TemporaryDirectory() as directory:
        path = Path(directory) / name
        path.write_bytes(source.download(name))
        # The unchanged repository baseline is checked against the workbook's Guide.
        # Each clean build imports afresh; generated CSVs are never committed back.
        subprocess.run([sys.executable, str(ROOT / 'utilities/editorial-workbook/workbook.py'),
                        'apply', str(path)], check=True)
    count = copy_images(source)
    if source.item(name)['eTag'] != original:
        raise ValueError('Workbook changed while images were fetched; retry after editing')
    print(f'Shared workbook validated; {count} referenced image files copied for this build.')


if __name__ == '__main__':
    try:
        main()
    except HTTPError as error:
        # HTTPError text can contain preauthenticated URLs. Do not log it.
        print(f'SharePoint import stopped (HTTP {error.code}). Check access and file configuration.', file=sys.stderr)
        sys.exit(1)
    except URLError:
        print('SharePoint import stopped: network connection failed. Retry the build.', file=sys.stderr)
        sys.exit(1)
    except Exception as error:
        print('SharePoint import stopped: ' + str(error), file=sys.stderr)
        sys.exit(1)
