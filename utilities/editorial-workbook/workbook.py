"""Prepare data and validate/import the team workbook. XLSX reading uses stdlib only."""
import argparse, csv, hashlib, io, json, math, shutil, tempfile, zipfile
from datetime import datetime
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
TABLES = {'Placements':'placements', 'Content':'room_content', 'Events':'timeline_events',
          'Timelines':'room_timelines', 'Rooms':'rooms', 'Slots':'exhibit_slots', 'Collection':'demo-metadata'}
KEYS = {'Placements':'placement_id','Content':'content_id','Events':'id','Timelines':'timeline_id','Rooms':'room_id','Slots':'slot_id','Collection':'objectid'}

def sources():
    result = {}
    for sheet, name in TABLES.items():
        path = ROOT / '_data' / (name+'.csv')
        with path.open(encoding='utf-8-sig', newline='') as f:
            reader=csv.DictReader(f)
            result[sheet]={'headers':reader.fieldnames,'rows':[{k:v or '' for k,v in row.items()} for row in reader],
                           'file':str(path.relative_to(ROOT)).replace('\\','/'),'hash':hashlib.sha256(path.read_bytes()).hexdigest()}
    return result

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
        if len([e for e in data['Events'] if e['timeline_id']==ident])<2: errors.append(f'{ident}: needs at least two events')
    for e in data['Events']:
        ident=e['id']
        for field in ('timeline_id','sortKey','displayedDate','title','description'):
            if not e.get(field,'').strip(): errors.append(f'{ident or "Event"}: {field} is required')
        if e['timeline_id'] not in idx['Timelines']: errors.append(f'{ident}: unknown timeline')
        if not number(e['sortKey']): errors.append(f'{ident}: numeric sortKey required')
    return errors

def main():
    parser=argparse.ArgumentParser(); parser.add_argument('command',choices=['prepare','check','apply']); parser.add_argument('path',type=Path)
    args=parser.parse_args(); src=sources()
    if args.command=='prepare':
        occupied={p['slot_id'] for p in src['Placements']['rows']}
        for s in src['Slots']['rows']:
            if s['slot_id'] not in occupied:
                src['Placements']['rows'].append(dict(placement_id='draft_'+s['slot_id'],slot_id=s['slot_id'],content_id='',content_type='detail' if s['slot_type']=='collection' else s['slot_type'],sort_order='1',published='false'))
        args.path.write_text(json.dumps(src,ensure_ascii=False,indent=2),encoding='utf-8'); return
    sheets=read_xlsx(args.path); data={}; errors=[]
    for sheet,spec in src.items():
        rows=sheets.get(sheet,[])
        if not rows or rows[0][:len(spec['headers'])]!=spec['headers']: errors.append(f'{sheet}: expected original column headers'); continue
        records=[]
        for r in rows[1:]:
            record={h:str(r[i] if i<len(r) else '') for i,h in enumerate(spec['headers'])}
            if not any(record.values()): continue
            if any(v in ('__FORMULA_NOT_ALLOWED__','__CELL_ERROR__') for v in record.values()):
                errors.append(f'{sheet}: input fields must contain values, not formulas or spreadsheet errors'); continue
            for field in ('enabled','published'):
                if field in record: record[field]=record[field].lower().strip()
            # Blank unpublished location prompts are workbook aids, not site records.
            if sheet=='Placements' and record['placement_id'].startswith('draft_') and not record['content_id'] and record['published']=='false':
                if record['slot_id'] not in {s['slot_id'] for s in src['Slots']['rows']}: errors.append('Draft placement references an unknown slot')
                continue
            records.append(record)
        data[sheet]=records
    if not errors: errors=validate(data)
    if errors: raise SystemExit('Import stopped:\n'+'\n'.join(errors))
    print('Valid: '+', '.join(f'{len(rows)} {sheet}' for sheet,rows in data.items()))
    if args.command=='check': return
    hashes={r[0]:r[1] for r in sheets.get('Guide',[]) if len(r)>1 and r[0].startswith('_data/')}
    for spec in src.values():
        if hashes.get(spec['file'])!=spec['hash']: raise SystemExit('Source changed since workbook creation: '+spec['file']+'. Reconcile before importing.')
    backup=ROOT/'docs/room-restoration/editorial-backups'/datetime.now().strftime('%Y%m%d-%H%M%S-%f'); backup.mkdir(parents=True)
    payload={}
    for sheet,rows in data.items():
        spec=src[sheet]; target=ROOT/spec['file']; stream=io.StringIO(newline='')
        writer=csv.DictWriter(stream,fieldnames=spec['headers'],lineterminator='\n'); writer.writeheader(); writer.writerows(rows)
        payload[target]=stream.getvalue(); shutil.copy2(target,backup/target.name)
    try:
        for target,value in payload.items(): target.write_text(value,encoding='utf-8',newline='')
    except Exception:
        for target in payload: shutil.copy2(backup/target.name,target)
        raise
    print('Imported CSVs. Backup: '+str(backup)+'\nRebuild Jekyll and review locally. Nothing has been deployed.')

if __name__=='__main__': main()
