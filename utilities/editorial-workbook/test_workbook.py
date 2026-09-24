import copy, csv, io, json, shutil, sys, tempfile, unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch
import workbook as w

class WorkbookChecks(unittest.TestCase):
    def setUp(self): self.data={s:v['rows'] for s,v in w.sources().items()}
    def test_current_data(self): self.assertEqual(w.validate(self.data),[])
    def test_reject_bad_reference_and_duplicate(self):
        self.data['Placements'][0]['content_id']='does-not-exist'
        self.assertTrue(w.validate(self.data))
        self.data['Content'].append(dict(self.data['Content'][0]))
        self.assertTrue(any('duplicate' in e for e in w.validate(self.data)))
    def test_reject_dates_capacity_and_type(self):
        self.data['Events'][0]['sortKey']=''
        self.data['Slots'][0]['capacity']='0'
        self.data['Placements'][0]['content_type']='video'
        errors=w.validate(self.data)
        self.assertTrue(any('sortKey' in e for e in errors))
        self.assertTrue(any('capacity' in e for e in errors))
        self.assertTrue(any('type' in e or 'content' in e for e in errors))

    def test_reject_conflicting_active_placements_and_disabled_targets(self):
        first=self.data['Placements'][0]
        self.data['Placements'].append({**first,'placement_id':'conflict','content_id':self.data['Content'][1]['content_id']})
        errors=w.validate(self.data)
        self.assertTrue(any('sort_order' in e for e in errors))
        self.data['Placements']=[p for p in self.data['Placements'] if p['placement_id']!='conflict']
        slot=self.data['Slots'][0]
        slot['enabled']='false'
        errors=w.validate(self.data)
        self.assertTrue(any('disabled slot' in e for e in errors))

    def test_reject_missing_required_editor_fields(self):
        self.data['Content'][0]['title']=''
        self.data['Events'][0]['displayedDate']=''
        errors=w.validate(self.data)
        self.assertTrue(any('title is required' in e for e in errors))
        self.assertTrue(any('displayedDate is required' in e for e in errors))
    def test_saved_workbook_round_trip_and_stale_guard(self):
        original=w.ROOT
        book=original/'outputs/archivory-editorial/ArchIvory Editorial Workbook.xlsx'
        with tempfile.TemporaryDirectory() as tmp:
            w.ROOT=Path(tmp); (w.ROOT/'_data').mkdir()
            for name in list(w.TABLES.values())+['room_anchors']:
                suffix='.json' if name=='room_anchors' else '.csv'
                shutil.copy2(original/'_data'/(name+suffix),w.ROOT/'_data'/(name+suffix))
            previous=sys.argv
            try:
                sys.argv=['workbook.py','apply',str(book)]
                with patch.object(w,'refresh',return_value={'targets':0,'metadata':0}), redirect_stdout(io.StringIO()): w.main()
                actual={s:v['rows'] for s,v in w.sources().items()}
                self.assertEqual(self.data,actual)
                (w.ROOT/'_data/room_content.csv').write_text('changed',encoding='utf-8')
                # Restore a valid changed CSV to test the stale-source check, not parsing.
                shutil.copy2(original/'_data/room_content.csv',w.ROOT/'_data/room_content.csv')
                with (w.ROOT/'_data/room_content.csv').open('a',encoding='utf-8') as f: f.write('\n')
                with self.assertRaisesRegex(SystemExit,'Source changed'):
                    with redirect_stdout(io.StringIO()): w.main()
            finally: sys.argv=previous; w.ROOT=original

    def test_generated_placement_formulas_use_iferror_not_ifna(self):
        # IFNA(...) produced #NAME? errors in the target Excel environment; the
        # automatic Placement lookup formulas must use the widely-supported
        # IFERROR instead. This guards against IFNA being reintroduced.
        source = (w.ROOT/'utilities/editorial-workbook/build.mjs').read_text(encoding='utf-8')
        self.assertNotIn('IFNA(', source)
        self.assertIn('IFERROR(VLOOKUP(B${row},Slots!$A$2:$D$501,2,FALSE)', source)

    def test_workbook_generator_includes_guided_editor_views(self):
        source = (w.ROOT/'utilities/editorial-workbook/build.mjs').read_text(encoding='utf-8')
        for sheet in ('Edit Items', 'Timeline Cards', 'Room Overview', 'Publishing'):
            self.assertIn(f"'{sheet}'", source)

    def test_media_map_translates_only_the_named_record_and_field(self):
        data={
            'Content':[
                {'content_id':'one','image':'photo.png'},
                {'content_id':'two','image':'photo.png'},
            ]
        }
        with tempfile.TemporaryDirectory() as tmp:
            manifest=Path(tmp)/'media.json'
            manifest.write_text(json.dumps([{
                'sheet':'Content',
                'record_id':'one',
                'field':'image',
                'expected':'photo.png',
                'replacement':'/assets/img/editorial/photo-abc123.png',
            }]),encoding='utf-8')
            self.assertEqual(w.apply_media_map(data,manifest),[])
        self.assertEqual(data['Content'][0]['image'],'/assets/img/editorial/photo-abc123.png')
        self.assertEqual(data['Content'][1]['image'],'photo.png')

    def test_media_map_rejects_unsafe_destination(self):
        data={'Content':[{'content_id':'one','image':'photo.png'}]}
        with tempfile.TemporaryDirectory() as tmp:
            manifest=Path(tmp)/'media.json'
            manifest.write_text(json.dumps([{
                'sheet':'Content',
                'record_id':'one',
                'field':'image',
                'expected':'photo.png',
                'replacement':'/assets/img/editorial/../../outside.png',
            }]),encoding='utf-8')
            self.assertTrue(any('unsafe destination' in error for error in w.apply_media_map(data,manifest)))

    def test_field_merge_preserves_independent_source_and_workbook_changes(self):
        current=copy.deepcopy(w.sources())
        baseline={sheet:{row[w.KEYS[sheet]]:dict(row) for row in spec['rows']}
                  for sheet,spec in current.items()}
        edited={sheet:[dict(row) for row in spec['rows']] for sheet,spec in current.items()}
        current['Content']['rows'][0]['description']='Maintainer revision'
        edited['Content'][0]['title']='Curator revision'
        merged,audit,conflicts=w.merge_workbook(current,edited,baseline)
        row=next(row for row in merged['Content'] if row['content_id']=='gallery_intro')
        self.assertEqual(row['title'],'Curator revision')
        self.assertEqual(row['description'],'Maintainer revision')
        self.assertFalse(conflicts)
        self.assertTrue(any(change['field']=='title' for change in audit))

    def test_field_merge_reports_same_field_conflict(self):
        current=copy.deepcopy(w.sources())
        baseline={sheet:{row[w.KEYS[sheet]]:dict(row) for row in spec['rows']}
                  for sheet,spec in current.items()}
        edited={sheet:[dict(row) for row in spec['rows']] for sheet,spec in current.items()}
        current['Content']['rows'][0]['title']='Maintainer title'
        edited['Content'][0]['title']='Curator title'
        _,_,conflicts=w.merge_workbook(current,edited,baseline)
        self.assertEqual(conflicts[0]['field'],'title')

if __name__=='__main__': unittest.main()
