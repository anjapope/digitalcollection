"""Prepare data and validate/import the team workbook. XLSX reading uses stdlib only."""
import argparse, csv, hashlib, io, json, math, shutil, subprocess, sys, tempfile, zipfile
from datetime import datetime
from pathlib import Path
import xml.etree.ElementTree as ET
import publication_model

ROOT = Path(__file__).resolve().parents[2]
TABLES = {'Placements':'placements', 'Content':'room_content', 'Events':'timeline_events',
          'Timelines':'room_timelines', 'Rooms':'rooms', 'Slots':'exhibit_slots', 'Collection':'demo-metadata'}
KEYS = {'Placements':'placement_id','Content':'content_id','Events':'id','Timelines':'timeline_id','Rooms':'room_id','Slots':'slot_id','Collection':'objectid'}
SYSTEM_SHEET = '_Publication System'

def apply_media_map(data, path):
    if not path:
        return []
    entries=json.loads(path.read_text(encoding='utf-8'))
    errors=[]
    known_fields={sheet:set(spec['headers']) for sheet,spec in sources().items()}
    for entry in entries:
        sheet=entry.get('sheet',''); key=KEYS.get(sheet)
        rows=data.get(sheet,[])
        field=entry.get('field','')
        if not key or field not in known_fields.get(sheet,set()):
            errors.append('Media map contains an unknown sheet or field'); continue
        replacement=entry.get('replacement','')
        if not replacement.startswith('/assets/img/editorial/') or '..' in Path(replacement).parts:
            errors.append('Media map contains an unsafe destination'); continue
        matches=[row for row in rows if row.get(key)==entry.get('record_id')]
        if len(matches)!=1:
            errors.append(f"Media map cannot find {sheet} record {entry.get('record_id','')}"); continue
        row=matches[0]
        if row.get(field,'')!=entry.get('expected',''):
            errors.append(f"Media map no longer matches {sheet} record {entry.get('record_id','')} field {field}"); continue
        row[field]=replacement
    return errors

def sources():
    result = {}
    for sheet, name in TABLES.items():
        path = ROOT / '_data' / (name+'.csv')
        with path.open(encoding='utf-8-sig', newline='') as f:
            reader=csv.DictReader(f)
            result[sheet]={'headers':reader.fieldnames,'rows':[{k:v or '' for k,v in row.items()} for row in reader],
                           'file':str(path.relative_to(ROOT)).replace('\\','/'),'hash':hashlib.sha256(path.read_bytes()).hexdigest()}
    return result

def snapshot(data):
    """Field-level baseline retained in the workbook, keyed by stable IDs."""
    return {
        sheet: {row[KEYS[sheet]]: row for row in rows}
        for sheet, rows in data.items()
    }

def snapshot_fingerprint(value):
    return hashlib.sha256(
        json.dumps(value, ensure_ascii=False, sort_keys=True,
                   separators=(',', ':')).encode('utf-8')
    ).hexdigest()

def system_snapshot(sheets):
    rows = sheets.get(SYSTEM_SHEET, [])
    if not rows or rows[0][:2] != ['key', 'value']:
        raise ValueError('Workbook is missing the _Publication System baseline sheet')
    values = {row[0]: row[1] for row in rows[1:] if len(row) > 1 and row[0]}
    if values.get('protocol') != 'unified-publication-model/v1':
        raise ValueError('Workbook does not use the unified publication protocol')
    try:
        baseline = json.loads(values['baseline'])
    except (KeyError, json.JSONDecodeError) as error:
        raise ValueError('Workbook has an invalid publication baseline') from error
    if values.get('baseline_fingerprint') != snapshot_fingerprint(baseline):
        raise ValueError('Workbook publication baseline fingerprint does not match')
    try:
        record_fingerprints = json.loads(values['record_fingerprints'])
    except (KeyError, json.JSONDecodeError) as error:
        raise ValueError('Workbook has invalid record revision fingerprints') from error
    expected = {
        sheet: {record_id: snapshot_fingerprint(row)
                for record_id, row in records.items()}
        for sheet, records in baseline.items()
    }
    if record_fingerprints != expected:
        raise ValueError('Workbook record revision fingerprints do not match')
    return baseline

def merge_workbook(current, edited, baseline):
    """Perform a three-way, field-level merge and return data plus audit rows."""
    merged, audit, conflicts = {}, [], []
    for sheet, spec in current.items():
        key = KEYS[sheet]
        current_rows = {row[key]: row for row in spec['rows']}
        edited_rows = {row[key]: row for row in edited[sheet]}
        base_rows = baseline.get(sheet, {})
        output = {}
        for record_id in sorted(set(current_rows) | set(edited_rows) | set(base_rows)):
            before, source, workbook_row = (base_rows.get(record_id),
                current_rows.get(record_id), edited_rows.get(record_id))
            if before is None:
                if workbook_row is not None:
                    output[record_id] = workbook_row
                    audit.append({'sheet':sheet,'record_id':record_id,'field':'*',
                                  'action':'added','status':'applied'})
                continue
            if workbook_row is None:
                workbook_row = {field: '' for field in spec['headers']}
            result = dict(source or before)
            deleted = not edited_rows.get(record_id)
            changed = False
            for field in spec['headers']:
                base_value = before.get(field, '')
                source_value = (source or {}).get(field, '')
                workbook_value = workbook_row.get(field, '')
                editor_changed = workbook_value != base_value
                source_changed = source_value != base_value
                if editor_changed and source_changed and workbook_value != source_value:
                    conflicts.append({'sheet':sheet,'record_id':record_id,'field':field,
                                      'baseline':base_value,'source':source_value,
                                      'workbook':workbook_value})
                    continue
                if editor_changed:
                    result[field] = workbook_value
                    changed = True
                    audit.append({'sheet':sheet,'record_id':record_id,'field':field,
                                  'action':'delete' if deleted else 'update',
                                  'status':'applied'})
            if result.get(key):
                output[record_id] = result
            elif source is not None:
                output[record_id] = source
        merged[sheet] = [output[row[key]] for row in spec['rows'] if row[key] in output]
        merged[sheet].extend(output[record_id] for record_id in sorted(output)
                             if record_id not in current_rows)
    return merged, audit, conflicts

def write_audit(path, *, dry_run, audit, conflicts, projection=None):
    document = {'protocol':'unified-publication-model/v1', 'dry_run':dry_run,
                'changes':audit, 'conflicts':conflicts, 'projection':projection or {}}
    path.write_text(json.dumps(document, ensure_ascii=False, indent=2)+'\n',
                    encoding='utf-8')
    return document

def refresh(root=ROOT, rebuild_workbook=True):
    """Refresh canonical projections and the authoring bundle from source data."""
    projection = publication_model.write_projection(root)
    source = {}
    for sheet, spec in sources().items():
        source[sheet] = spec
    source['system'] = {
        'protocol':'unified-publication-model/v1',
        'baseline':snapshot({sheet: spec['rows'] for sheet, spec in source.items()
                             if sheet != 'system'}),
    }
    source['system']['baseline_fingerprint'] = snapshot_fingerprint(source['system']['baseline'])
    source['system']['record_fingerprints'] = {
        sheet: {record_id: snapshot_fingerprint(row)
                for record_id, row in records.items()}
        for sheet, records in source['system']['baseline'].items()
    }
    output = root/'outputs/archivory-editorial/source.json'
    output.write_text(json.dumps(source, ensure_ascii=False, indent=2)+'\n',encoding='utf-8')
    if rebuild_workbook:
        subprocess.run(['node', str(root/'utilities/editorial-workbook/build.mjs')],
                       cwd=root, check=True)
    return projection

def read_xlsx(path):
    ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    with zipfile.ZipFile(path) as z:
        strings=[]
        if 'xl/sharedStrings.xml' in z.namelist():
            strings=[''.join(t.text or '' for t in si.findall('.//m:t',ns)) for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si',ns)]
        rels={r.attrib['Id']:r.attrib['Target'] for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
        out={}
        for sheet in ET.fromstring(z.read('xl/workbook.xml')).findall('m:sheets/m:sheet',ns):
            target=rels[sheet.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']]
            target=target.lstrip('/') if target.startswith('/') else 'xl/'+target
            rows=[]
            for row in ET.fromstring(z.read(target)).findall('m:sheetData/m:row',ns):
                cells={}
                for c in row.findall('m:c',ns):
                    letters=''.join(ch for ch in c.attrib['r'] if ch.isalpha()); col=0
                    for ch in letters: col=col*26+ord(ch)-64
                    value=c.find('m:v',ns); value=value.text if value is not None else ''
                    if c.attrib.get('t')=='s': value=strings[int(value)]
                    elif c.attrib.get('t')=='inlineStr': value=''.join(t.text or '' for t in c.findall('.//m:t',ns))
                    elif c.attrib.get('t')=='b': value='true' if value=='1' else 'false'
                    if c.find('m:f',ns) is not None: value='__FORMULA_NOT_ALLOWED__'
                    elif c.attrib.get('t')=='e': value='__CELL_ERROR__'
                    cells[col-1]=value or ''
                rows.append([cells.get(i,'') for i in range(max(cells,default=-1)+1)])
            out[sheet.attrib['name']]=rows
        return out

def validate(data):
    errors=[]
    idx={}
    for sheet,rows in data.items():
        key=KEYS[sheet]; idx[sheet]={}
        for row in rows:
            ident=row.get(key,'')
            if not ident or ident in idx[sheet]: errors.append(f'{sheet}: missing or duplicate {key}: {ident}')
            idx[sheet][ident]=row
    types={'detail','collection','timeline','tool','inline'}
    def boolean(row,key,label):
        if row.get(key) not in ('true','false'): errors.append(f'{label}: {key} must be true or false')
    def number(value):
        try: return bool(str(value).strip()) and math.isfinite(float(value))
        except (ValueError,TypeError): return False
    for room in data['Rooms']: boolean(room,'enabled',room['room_id'])
    anchors={a['anchor_id']:a for a in json.loads((ROOT/'_data/room_anchors.json').read_text())}
    for slot in data['Slots']:
        sid=slot['slot_id']; boolean(slot,'enabled',sid)
        if slot['room_id'] not in idx['Rooms']: errors.append(f'{sid}: unknown room')
        a=anchors.get(slot['anchor_id'],{})
        if a.get('slot_id')!=sid or a.get('room_id')!=slot['room_id']: errors.append(f'{sid}: no matching artwork anchor')
        if slot['slot_type'] not in types: errors.append(f'{sid}: unsupported slot type')
        if not number(slot['capacity']) or float(slot['capacity'])<1 or not float(slot['capacity']).is_integer(): errors.append(f'{sid}: capacity must be a positive integer')
    for content in data['Content']:
        ident=content['content_id']
        for field in ('title','description','content_type'):
            if not content.get(field,'').strip(): errors.append(f'{ident}: {field} is required')
        if content['content_type'] not in types-{'timeline'}: errors.append(f"{ident}: unsupported content type")
    counts={}
    active_order={}
    active_content={}
    for p in data['Placements']:
        ident=p['placement_id']; boolean(p,'published',ident)
        for field in ('slot_id','content_id','content_type','sort_order','published'):
            if not p.get(field,'').strip(): errors.append(f'{ident or "Placement"}: {field} is required')
        slot=idx['Slots'].get(p['slot_id'])
        if not slot: errors.append(f'{ident}: unknown slot'); continue
        content=idx['Timelines' if p['content_type']=='timeline' else 'Content'].get(p['content_id'])
        if not content: errors.append(f'{ident}: unknown content {p["content_id"]}'); continue
        if p['content_type'] not in types or (slot['slot_type']!=p['content_type'] and not (slot['slot_type']=='collection' and p['content_type']!='timeline')): errors.append(f'{ident}: incompatible type')
        if p['content_type']!='timeline' and content['content_type']!=p['content_type']: errors.append(f'{ident}: record type mismatch')
        if not number(p['sort_order']): errors.append(f'{ident}: numeric sort_order required')
        if p['published']=='true': counts[p['slot_id']]=counts.get(p['slot_id'],0)+1
        if p['published']=='true' and slot['enabled']!='true': errors.append(f'{ident}: cannot publish to disabled slot {p["slot_id"]}')
        room=idx['Rooms'].get(slot['room_id'])
        if p['published']=='true' and room and room['enabled']!='true': errors.append(f'{ident}: cannot publish to disabled room {slot["room_id"]}')
        if p['published']=='true':
            order_key=(p['slot_id'],p['sort_order'])
            active_order.setdefault(order_key,[]).append(ident)
            content_key=(p['slot_id'],p['content_id'])
            active_content.setdefault(content_key,[]).append(ident)
    for sid,count in counts.items():
        if number(idx['Slots'][sid]['capacity']) and count>float(idx['Slots'][sid]['capacity']): errors.append(f'{sid}: capacity exceeded')
    for key,ids in active_order.items():
        if len(ids)>1: errors.append(f'{key[0]}: active placements share sort_order {key[1]} ({", ".join(ids)})')
    for key,ids in active_content.items():
        if len(ids)>1: errors.append(f'{key[0]}: active content is assigned more than once ({", ".join(ids)})')
    for t in data['Timelines']:
        ident=t['timeline_id']
        for field in ('room_id','roomName','temporalScale','introduction','successText'):
            if not t.get(field,'').strip(): errors.append(f'{ident}: {field} is required')
        if t['room_id'] not in idx['Rooms']: errors.append(f'{ident}: unknown room')
        if t.get('published','') and t['published'] not in ('true','false'): errors.append(f'{ident}: published must be true or false')
        if t.get('scale_mode','') and t['scale_mode'] not in ('linear','segmented','guided'): errors.append(f'{ident}: scale_mode must be linear, segmented, or guided')
        if t.get('start_date','') and not number(t['start_date']): errors.append(f'{ident}: start_date must be numeric')
        if t.get('end_date','') and not number(t['end_date']): errors.append(f'{ident}: end_date must be numeric')
        if t.get('scale_config',''):
            try: json.loads(t['scale_config'])
            except json.JSONDecodeError: errors.append(f'{ident}: scale_config must be valid JSON')
        if len([e for e in data['Events'] if e['timeline_id']==ident])<2: errors.append(f'{ident}: needs at least two events')
    for e in data['Events']:
        ident=e['id']
        for field in ('timeline_id','sortKey','displayedDate','title','description'):
            if not e.get(field,'').strip(): errors.append(f'{ident or "Event"}: {field} is required')
        if e['timeline_id'] not in idx['Timelines']: errors.append(f'{ident}: unknown timeline')
        if not number(e['sortKey']): errors.append(f'{ident}: numeric sortKey required')
        if e.get('published','') and e['published'] not in ('true','false'): errors.append(f'{ident}: published must be true or false')
    return errors

def workbook_records(sheets, src):
    data={}; errors=[]
    for sheet,spec in src.items():
        rows=sheets.get(sheet,[])
        if not rows or rows[0][:len(spec['headers'])]!=spec['headers']:
            errors.append(f'{sheet}: expected original column headers'); continue
        records=[]
        for row in rows[1:]:
            record={h:str(row[i] if i<len(row) else '') for i,h in enumerate(spec['headers'])}
            if not any(record.values()): continue
            if any(value in ('__FORMULA_NOT_ALLOWED__','__CELL_ERROR__') for value in record.values()):
                errors.append(f'{sheet}: input fields must contain values, not formulas or spreadsheet errors'); continue
            for field in ('enabled','published'):
                if field in record: record[field]=record[field].lower().strip()
            if sheet=='Placements' and record['placement_id'].startswith('draft_') and not record['content_id'] and record['published']=='false':
                if record['slot_id'] not in {slot['slot_id'] for slot in src['Slots']['rows']}:
                    errors.append('Draft placement references an unknown slot')
                continue
            records.append(record)
        data[sheet]=records
    return data,errors

def write_data(data, src):
    backup=ROOT/'docs/room-restoration/editorial-backups'/datetime.now().strftime('%Y%m%d-%H%M%S-%f')
    backup.mkdir(parents=True); payload={}
    for sheet,rows in data.items():
        spec=src[sheet]; target=ROOT/spec['file']; stream=io.StringIO(newline='')
        writer=csv.DictWriter(stream,fieldnames=spec['headers'],lineterminator='\n')
        writer.writeheader(); writer.writerows(rows)
        payload[target]=stream.getvalue(); shutil.copy2(target,backup/target.name)
    try:
        for target,value in payload.items(): target.write_text(value,encoding='utf-8',newline='')
    except Exception:
        for target in payload: shutil.copy2(backup/target.name,target)
        raise
    return backup

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('command',choices=['prepare','check','apply','sync','refresh'])
    parser.add_argument('path',type=Path,nargs='?')
    parser.add_argument('--media-map',type=Path,help='Validated media reference translations')
    parser.add_argument('--dry-run',action='store_true')
    parser.add_argument('--audit',type=Path,help='Write JSON reconciliation audit')
    parser.add_argument('--no-workbook-rebuild',action='store_true')
    args=parser.parse_args(); src=sources()
    if args.command=='refresh':
        result=refresh(rebuild_workbook=not args.no_workbook_rebuild)
        print(f"Refreshed {result['targets']} publication targets and {result['metadata']} CollectionBuilder records.")
        return
    if not args.path: parser.error('path is required except for refresh')
    if args.command=='prepare':
        occupied={p['slot_id'] for p in src['Placements']['rows']}
        for slot in src['Slots']['rows']:
            if slot['slot_id'] not in occupied:
                src['Placements']['rows'].append(dict(placement_id='draft_'+slot['slot_id'],slot_id=slot['slot_id'],content_id='',content_type='detail' if slot['slot_type']=='collection' else slot['slot_type'],sort_order='1',published='false'))
        args.path.write_text(json.dumps(src,ensure_ascii=False,indent=2),encoding='utf-8'); return
    sheets=read_xlsx(args.path); data,errors=workbook_records(sheets,src); audit=[]; conflicts=[]
    if not errors: errors=apply_media_map(data,args.media_map)
    if args.command=='sync' and not errors:
        try:
            data,audit,conflicts=merge_workbook(src,data,system_snapshot(sheets))
        except ValueError as error:
            raise SystemExit('Sync stopped: '+str(error))
        if conflicts:
            if args.audit: write_audit(args.audit,dry_run=args.dry_run,audit=audit,conflicts=conflicts)
            raise SystemExit('Sync stopped: '+json.dumps(conflicts,ensure_ascii=False))
    if not errors: errors=validate(data)
    if errors: raise SystemExit('Import stopped:\n'+'\n'.join(errors))
    print('Valid: '+', '.join(f'{len(rows)} {sheet}' for sheet,rows in data.items()))
    if args.command=='check': return
    if args.command=='sync' and args.dry_run:
        projection=publication_model.build_model(data,publication_model.load_overrides(ROOT))[0]
        if args.audit: write_audit(args.audit,dry_run=True,audit=audit,conflicts=[],projection=projection)
        print(f'DRY RUN: {len(audit)} field changes would be merged; no source data changed.')
        return
    if args.command=='apply':
        hashes={r[0]:r[1] for r in sheets.get('Guide',[]) if len(r)>1 and r[0].startswith('_data/')}
        for spec in src.values():
            if hashes.get(spec['file'])!=spec['hash']:
                raise SystemExit('Source changed since workbook creation: '+spec['file']+'. Use sync for field-safe reconciliation.')
    backup=write_data(data,src)
    projection=refresh(rebuild_workbook=True)
    if args.audit: write_audit(args.audit,dry_run=False,audit=audit,conflicts=[],projection=projection)
    print('Imported CSVs. Backup: '+str(backup)+'\nPublication outputs refreshed. Rebuild Jekyll and review locally. Nothing has been deployed.')

if __name__=='__main__': main()
