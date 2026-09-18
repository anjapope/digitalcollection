import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import shared_media


PNG_A = b"\x89PNG\r\n\x1a\n" + b"a" * 32
PNG_B = b"\x89PNG\r\n\x1a\n" + b"b" * 32


class SharedMediaTests(unittest.TestCase):
    def data(self, *rows):
        return {"Content": list(rows), "Collection": []}

    def baseline(self, *rows):
        return {"Content": list(rows), "Collection": []}

    def test_media_root_uses_override_environment_then_sibling(self):
        workbook = Path("shared") / "ArchIvory Editorial Workbook.xlsx"
        with patch.dict(os.environ, {}, clear=True):
            self.assertEqual(
                shared_media.configured_root(workbook),
                Path("shared") / "Images",
            )
            with patch.dict(
                os.environ, {shared_media.MEDIA_ENV: str(Path("other") / "Images")}
            ):
                self.assertEqual(
                    shared_media.configured_root(workbook),
                    Path("other") / "Images",
                )
            self.assertEqual(
                shared_media.configured_root(workbook, Path("explicit") / "Images"),
                Path("explicit") / "Images",
            )

    def test_valid_media_reference_and_copy(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            media = root / "Images"
            repo = root / "repo"
            media.mkdir()
            repo.mkdir()
            source = media / "ivory detail.png"
            source.write_bytes(PNG_A)

            plan = shared_media.plan_media(
                self.data({"content_id": "item-1", "image": "ivory detail.png"}),
                self.baseline({"content_id": "item-1", "image": ""}),
                media,
                repo,
            )

            self.assertEqual(plan.copy_count, 1)
            self.assertEqual(len(plan.mappings), 1)
            self.assertRegex(
                plan.mappings[0].replacement,
                r"^/assets/img/editorial/ivory detail-[0-9a-f]{12}\.png$",
            )
            shared_media.copy_media(plan)
            self.assertEqual(plan.files[0].destination.read_bytes(), PNG_A)
            self.assertEqual(source.read_bytes(), PNG_A)

    def test_missing_media_file_identifies_record(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            media = root / "Images"
            repo = root / "repo"
            media.mkdir()
            repo.mkdir()
            with self.assertRaisesRegex(
                shared_media.MediaValidationError,
                r"Content record item-1 field image: missing\.png",
            ):
                shared_media.plan_media(
                    self.data({"content_id": "item-1", "image": "missing.png"}),
                    self.baseline({"content_id": "item-1", "image": ""}),
                    media,
                    repo,
                )

    def test_rejects_unsupported_absolute_and_traversal_references(self):
        invalid = (
            ("file.svg", "unsupported media type"),
            ("C:/private/file.jpg", "schemes are not supported"),
            ("../outside.jpg", "path traversal"),
            ("https://example.test/file.jpg", "schemes are not supported"),
        )
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            media = root / "Images"
            repo = root / "repo"
            media.mkdir()
            repo.mkdir()
            for value, message in invalid:
                with self.subTest(value=value), self.assertRaisesRegex(
                    shared_media.MediaValidationError, message
                ):
                    shared_media.plan_media(
                        self.data({"content_id": "item-1", "image": value}),
                        self.baseline({"content_id": "item-1", "image": ""}),
                        media,
                        repo,
                    )

    def test_duplicate_filenames_use_distinct_deterministic_destinations(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            media = root / "Images"
            repo = root / "repo"
            (media / "a").mkdir(parents=True)
            (media / "b").mkdir()
            repo.mkdir()
            (media / "a" / "photo.png").write_bytes(PNG_A)
            (media / "b" / "photo.png").write_bytes(PNG_B)
            rows = (
                {"content_id": "item-a", "image": "a/photo.png"},
                {"content_id": "item-b", "image": "b/photo.png"},
            )

            plan = shared_media.plan_media(
                self.data(*rows),
                self.baseline(
                    {"content_id": "item-a", "image": ""},
                    {"content_id": "item-b", "image": ""},
                ),
                media,
                repo,
            )

            destinations = {item.site_reference for item in plan.files}
            self.assertEqual(len(destinations), 2)
            self.assertTrue(any("/a/photo-" in value for value in destinations))
            self.assertTrue(any("/b/photo-" in value for value in destinations))

    def test_existing_destination_with_different_content_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            media = root / "Images"
            repo = root / "repo"
            media.mkdir()
            repo.mkdir()
            (media / "photo.png").write_bytes(PNG_A)
            data = self.data({"content_id": "item-1", "image": "photo.png"})
            baseline = self.baseline({"content_id": "item-1", "image": ""})
            first = shared_media.plan_media(data, baseline, media, repo)
            first.files[0].destination.parent.mkdir(parents=True)
            first.files[0].destination.write_bytes(PNG_B)

            with self.assertRaisesRegex(
                shared_media.MediaValidationError,
                "destination exists with different content",
            ):
                shared_media.plan_media(data, baseline, media, repo)

    def test_unchanged_file_is_detected_and_not_recopied(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            media = root / "Images"
            repo = root / "repo"
            media.mkdir()
            repo.mkdir()
            (media / "photo.png").write_bytes(PNG_A)
            data = self.data({"content_id": "item-1", "image": "photo.png"})
            baseline = self.baseline({"content_id": "item-1", "image": ""})
            first = shared_media.plan_media(data, baseline, media, repo)
            shared_media.copy_media(first)
            modified = first.files[0].destination.stat().st_mtime_ns

            second = shared_media.plan_media(data, baseline, media, repo)
            copied = shared_media.copy_media(second)

            self.assertEqual(second.current_count, 1)
            self.assertEqual(copied, 0)
            self.assertEqual(second.files[0].destination.stat().st_mtime_ns, modified)


if __name__ == "__main__":
    unittest.main()
