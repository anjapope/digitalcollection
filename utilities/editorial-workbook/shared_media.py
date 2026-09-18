"""Validate and copy curator media from a locally synced shared folder."""
from dataclasses import dataclass
import hashlib
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import tempfile


MEDIA_ENV = "ARCHIVORY_SHARED_MEDIA"
MEDIA_FIELDS = {
    "Content": ("image",),
    "Collection": ("object_location", "image_small", "image_thumb"),
}
MEDIA_KEYS = {"Content": "content_id", "Collection": "objectid"}
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
DESTINATION = Path("assets") / "img" / "editorial"
SAFE_SEGMENT = re.compile(r"[A-Za-z0-9][A-Za-z0-9 _().-]*")
URI_SCHEME = re.compile(r"^[A-Za-z][A-Za-z0-9+.-]*:")
WINDOWS_RESERVED = {
    "CON", "PRN", "AUX", "NUL",
    *(f"COM{number}" for number in range(1, 10)),
    *(f"LPT{number}" for number in range(1, 10)),
}


@dataclass(frozen=True)
class MediaMapping:
    sheet: str
    record_id: str
    field: str
    expected: str
    replacement: str

    def manifest_entry(self):
        return {
            "sheet": self.sheet,
            "record_id": self.record_id,
            "field": self.field,
            "expected": self.expected,
            "replacement": self.replacement,
        }


@dataclass(frozen=True)
class MediaFile:
    reference: str
    source: Path
    destination: Path
    site_reference: str
    digest: str
    status: str


@dataclass(frozen=True)
class MediaPlan:
    files: tuple
    mappings: tuple
    orphans: tuple

    @property
    def copy_count(self):
        return sum(item.status == "copy" for item in self.files)

    @property
    def current_count(self):
        return sum(item.status == "current" for item in self.files)


class MediaValidationError(ValueError):
    pass


def configured_root(workbook_path, explicit=None):
    value = explicit or os.environ.get(MEDIA_ENV, "")
    if value and str(value).strip():
        return Path(str(value)).expanduser()
    return Path(workbook_path).expanduser().parent / "Images"


def validate_root(path):
    if not path.exists():
        raise FileNotFoundError(f"Shared media directory does not exist: {path}")
    if not path.is_dir():
        raise ValueError(f"Shared media path is not a directory: {path}")
    if not os.access(path, os.R_OK):
        raise PermissionError(f"Shared media directory is not readable: {path}")
    return path.resolve()


def safe_relative_reference(value):
    value = str(value).strip()
    if not value:
        raise ValueError("media reference is blank")
    if "\\" in value:
        raise ValueError("use forward slashes in media references")
    if URI_SCHEME.match(value):
        raise ValueError("URI and drive-letter schemes are not supported")
    if "//" in value:
        raise ValueError("empty path segments are not allowed")
    relative = PurePosixPath(value)
    if relative.is_absolute() or value.startswith(("/", "//")):
        raise ValueError("absolute paths are not allowed")
    if any(part in ("", ".", "..") for part in relative.parts):
        raise ValueError("path traversal and empty path segments are not allowed")
    if any(not SAFE_SEGMENT.fullmatch(part) for part in relative.parts):
        raise ValueError("media path contains unsupported characters")
    if any(part.endswith((" ", ".")) for part in relative.parts):
        raise ValueError("media path segments cannot end with a space or period")
    if any(part.split(".", 1)[0].upper() in WINDOWS_RESERVED for part in relative.parts):
        raise ValueError("media path uses a reserved Windows filename")
    extension = relative.suffix.lower()
    if extension not in SUPPORTED_EXTENSIONS:
        allowed = ", ".join(sorted(SUPPORTED_EXTENSIONS))
        raise ValueError(f"unsupported media type {extension or '(none)'}; allowed: {allowed}")
    return relative


def _digest_and_verify(path, extension):
    digest = hashlib.sha256()
    try:
        with path.open("rb") as stream:
            header = stream.read(16)
            digest.update(header)
            for block in iter(lambda: stream.read(1024 * 1024), b""):
                digest.update(block)
    except OSError as error:
        raise ValueError(f"file is not readable: {error}") from error
    signatures = {
        ".jpg": header.startswith(b"\xff\xd8\xff"),
        ".jpeg": header.startswith(b"\xff\xd8\xff"),
        ".png": header.startswith(b"\x89PNG\r\n\x1a\n"),
        ".gif": header.startswith((b"GIF87a", b"GIF89a")),
        ".webp": header.startswith(b"RIFF") and header[8:12] == b"WEBP",
    }
    if not signatures[extension]:
        raise ValueError(f"file content does not match its {extension} extension")
    return digest.hexdigest()


def _index(data):
    result = {}
    for sheet, key in MEDIA_KEYS.items():
        result[sheet] = {row.get(key, ""): row for row in data.get(sheet, [])}
    return result


def _destination(relative, digest, destination_root):
    filename = f"{relative.stem}-{digest[:12]}{relative.suffix.lower()}"
    destination_relative = DESTINATION.joinpath(*relative.parts[:-1], filename)
    destination = destination_root.joinpath(*relative.parts[:-1], filename).resolve()
    try:
        destination.relative_to(destination_root)
    except ValueError as error:
        raise ValueError("destination resolves outside the editorial media directory") from error
    site_reference = "/" + destination_relative.as_posix()
    return destination, site_reference


def plan_media(data, baseline, shared_root, repo_root):
    root = validate_root(Path(shared_root))
    repo_root = Path(repo_root).resolve()
    destination_root = (repo_root / DESTINATION).resolve()
    try:
        destination_root.relative_to(repo_root)
    except ValueError as error:
        raise MediaValidationError(
            "Editorial media destination resolves outside the repository"
        ) from error
    baseline_index = _index(baseline)
    errors = []
    files_by_source = {}
    destinations = {}
    mappings = []
    retained_destinations = set()

    for sheet, fields in MEDIA_FIELDS.items():
        key = MEDIA_KEYS[sheet]
        for row in data.get(sheet, []):
            record_id = row.get(key, "")
            baseline_row = baseline_index.get(sheet, {}).get(record_id, {})
            for field in fields:
                value = str(row.get(field, "")).strip()
                baseline_value = str(baseline_row.get(field, "")).strip()
                if value and value == baseline_value and value.startswith(
                    "/assets/img/editorial/"
                ):
                    retained = (repo_root / value.lstrip("/")).resolve()
                    try:
                        retained.relative_to(destination_root)
                    except ValueError:
                        pass
                    else:
                        retained_destinations.add(str(retained).casefold())
                if not value or value == baseline_value:
                    continue
                label = f"{sheet} record {record_id or '(missing ID)'} field {field}: {value}"
                try:
                    relative = safe_relative_reference(value)
                    candidate = root.joinpath(*relative.parts)
                    source = candidate.resolve(strict=True)
                    try:
                        source.relative_to(root)
                    except ValueError as error:
                        raise ValueError("resolved path is outside the shared media root") from error
                    if not source.is_file():
                        raise ValueError("referenced media is not a file")
                    digest = _digest_and_verify(source, relative.suffix.lower())
                    destination, site_reference = _destination(
                        relative, digest, destination_root
                    )
                    destination_key = str(destination).casefold()
                    previous = destinations.get(destination_key)
                    if previous and previous != digest:
                        raise ValueError(
                            f"destination collision with different media: {destination}"
                        )
                    destinations[destination_key] = digest
                    if destination.exists():
                        if not destination.is_file():
                            raise ValueError(f"destination is not a file: {destination}")
                        existing_digest = _digest_and_verify(
                            destination, destination.suffix.lower()
                        )
                        if existing_digest != digest:
                            raise ValueError(
                                f"destination exists with different content: {destination}"
                            )
                        status = "current"
                    else:
                        status = "copy"
                    source_key = str(source).casefold()
                    existing = files_by_source.get(source_key)
                    item = MediaFile(
                        value,
                        source,
                        destination,
                        site_reference,
                        digest,
                        status,
                    )
                    if existing and existing.destination != destination:
                        raise ValueError("one source resolved to multiple destinations")
                    files_by_source[source_key] = existing or item
                    mappings.append(
                        MediaMapping(
                            sheet, record_id, field, value, site_reference
                        )
                    )
                except (OSError, ValueError) as error:
                    errors.append(f"{label} ({error})")

    if errors:
        raise MediaValidationError(
            "Shared media validation failed:\n" + "\n".join(errors)
        )

    files = tuple(sorted(files_by_source.values(), key=lambda item: item.reference.casefold()))
    planned = {
        *(str(item.destination).casefold() for item in files),
        *retained_destinations,
    }
    orphans = ()
    if destination_root.is_dir():
        orphans = tuple(
            sorted(
                (
                    path
                    for path in destination_root.rglob("*")
                    if path.is_file() and str(path).casefold() not in planned
                ),
                key=lambda path: str(path).casefold(),
            )
        )
    return MediaPlan(files, tuple(mappings), orphans)


def copy_media(plan):
    pending = [item for item in plan.files if item.status == "copy"]
    if not pending:
        return 0
    with tempfile.TemporaryDirectory(prefix="archivory-media-") as staging:
        staging_root = Path(staging)
        staged = []
        for index, item in enumerate(pending):
            staged_path = staging_root / f"{index}{item.destination.suffix.lower()}"
            shutil.copy2(item.source, staged_path)
            if _digest_and_verify(staged_path, item.destination.suffix.lower()) != item.digest:
                raise RuntimeError(f"Copied media failed verification: {item.reference}")
            staged.append((item, staged_path))
        copied = 0
        for item, staged_path in staged:
            item.destination.parent.mkdir(parents=True, exist_ok=True)
            if item.destination.exists():
                existing = _digest_and_verify(
                    item.destination, item.destination.suffix.lower()
                )
                if existing != item.digest:
                    raise RuntimeError(
                        f"Destination changed during media copy: {item.destination}"
                    )
                continue
            shutil.move(str(staged_path), str(item.destination))
            copied += 1
    return copied
