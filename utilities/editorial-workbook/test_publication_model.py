import copy
import unittest

import publication_model as model


class PublicationModelTests(unittest.TestCase):
    def setUp(self):
        self.data = model.load_sources()

    def test_projection_preserves_collection_metadata_and_routes(self):
        projection, metadata = model.build_model(self.data)
        original = self.data['Collection'][0]
        record = next(row for row in metadata if row['objectid'] == original['objectid'])
        self.assertEqual(record['creator'], original['creator'])
        self.assertEqual(record['date'], original['date'])
        target = next(row for row in projection['targets']
                      if row['target_id'] == 'conservation_lab_table_01_1')
        self.assertEqual(target['record_kind'], 'collection')
        self.assertEqual(target['room_url'], '/pages/rooms/art.html')
        self.assertEqual(target['item_url'], '/items/chineseuvivorycollection.html')

    def test_override_changes_only_canonical_target(self):
        projection, _ = model.build_model(
            self.data,
            [{'target_id': 'gallery_intro_1', 'field': 'title', 'value': 'Changed'}],
        )
        target = next(row for row in projection['targets']
                      if row['target_id'] == 'gallery_intro_1')
        self.assertEqual(target['title'], 'Changed')
        self.assertEqual(self.data['Content'][0]['title'], 'Gallery Intro')

    def test_unknown_override_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'do not exist'):
            model.build_model(self.data, [
                {'target_id': 'missing', 'field': 'title', 'value': 'Nope'}
            ])


if __name__ == '__main__':
    unittest.main()
