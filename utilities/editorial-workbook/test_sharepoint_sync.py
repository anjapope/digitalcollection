import csv
from pathlib import Path
import tempfile
import unittest
import sharepoint_sync as sync


class ImportTests(unittest.TestCase):
    def test_image_references(self):
        for value in ('', '/assets/picture.png', 'objects/a.jpg', 'https://example.com/a.jpg'):
            self.assertIsNone(sync.image_name(value))
        self.assertEqual(sync.image_name('Ivory detail (2).JPG'), 'Ivory detail (2).JPG')
        for value in ('../a.jpg', 'Images/a.jpg', 'file.exe', 'https://bad', 'a\\b.jpg'):
            if value.startswith('https://'):
                continue
            with self.assertRaises(ValueError):
                sync.image_name(value)

    def test_copies_and_reuses_referenced_picture(self):
        class Source:
            calls = []
            def download(self, name):
                self.calls.append(name)
                return b'\x89PNG\r\n\x1a\n' + b'test fixture'
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / '_data').mkdir()
            (root / '_data/room_content.csv').write_text('content_id,image\na,picture.png\nb,picture.png\n')
            (root / '_data/demo-metadata.csv').write_text('objectid,object_location,image_small,image_thumb\nx,objects/existing.jpg,,\n')
            source = Source()
            self.assertEqual(sync.copy_images(source, root), 1)
            self.assertEqual(source.calls, ['Images/picture.png'])
            with (root / '_data/room_content.csv').open() as stream:
                rows = list(csv.DictReader(stream))
            self.assertEqual(rows[0]['image'], rows[1]['image'])
            self.assertTrue((root / rows[0]['image'].lstrip('/')).is_file())

    def test_mislabeled_image_rejected(self):
        with self.assertRaises(ValueError):
            sync.verify_image('image.jpg', b'<html>not an image</html>')

    def test_missing_image_aborts(self):
        class Source:
            def download(self, name):
                raise FileNotFoundError(name)
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / '_data').mkdir()
            (root / '_data/room_content.csv').write_text('content_id,image\na,missing.jpg\n')
            with self.assertRaises(FileNotFoundError):
                sync.copy_images(Source(), root)


if __name__ == '__main__':
    unittest.main()
