import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import publish_from_shared as publish


class SharedPublishTests(unittest.TestCase):
    def test_requires_configured_workbook(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaisesRegex(ValueError, "ARCHIVORY_SHARED_WORKBOOK"):
                publish.configured_workbook()

    def test_rejects_lock_and_temporary_files(self):
        for name in ("~$ArchIvory Editorial Workbook.xlsx", "workbook.xlsx.tmp"):
            with self.assertRaisesRegex(ValueError, "temporary|locked"):
                publish.configured_workbook(name)

    def test_missing_workbook_is_reported(self):
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaisesRegex(FileNotFoundError, "does not exist"):
                publish.readable_xlsx(Path(directory) / "missing.xlsx")

    def test_rejects_invalid_xlsx(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bad.xlsx"
            path.write_text("not an xlsx", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "readable Excel"):
                publish.readable_xlsx(path)

    def test_stability_detects_changes(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "book.xlsx"
            path.write_bytes(b"one")
            with patch.object(publish, "readable_xlsx"), patch.object(
                publish, "workbook_signature", side_effect=[(1, 1), (2, 2)]
            ):
                with self.assertRaisesRegex(RuntimeError, "still changing"):
                    publish.wait_for_stable(path, 0)

    def test_dry_run_validates_without_running_import(self):
        path = Path("outputs/archivory-editorial/ArchIvory Editorial Workbook.xlsx")
        with patch.object(publish, "wait_for_stable"), patch.object(
            publish, "run"
        ) as run:
            publish.run_pipeline(path, dry_run=True, settle_seconds=0)
            self.assertEqual(run.call_count, 1)
            self.assertIn("check", run.call_args.args[0])

    def test_success_runs_import_checks_tests_and_build(self):
        path = Path("outputs/archivory-editorial/ArchIvory Editorial Workbook.xlsx")
        labels = []

        def fake_run(command, label):
            labels.append(label)

        with patch.object(publish, "wait_for_stable"), patch.object(
            publish, "run", side_effect=fake_run
        ):
            publish.run_pipeline(path, settle_seconds=0)

        self.assertEqual(
            labels,
            ["validate", "import", "post-check", "room tests", "site build"],
        )

    def test_validation_failure_stops_before_import(self):
        path = Path("outputs/archivory-editorial/ArchIvory Editorial Workbook.xlsx")
        labels = []

        def fake_run(command, label):
            labels.append(label)
            if label == "validate":
                raise RuntimeError("validation failed")

        with patch.object(publish, "wait_for_stable"), patch.object(
            publish, "run", side_effect=fake_run
        ):
            with self.assertRaisesRegex(RuntimeError, "validation failed"):
                publish.run_pipeline(path, settle_seconds=0)

        self.assertEqual(labels, ["validate"])

    def test_build_failure_stops_pipeline(self):
        path = Path("outputs/archivory-editorial/ArchIvory Editorial Workbook.xlsx")
        results = [None, None, None, None, RuntimeError("site build failed")]

        def fake_run(command, label):
            result = results.pop(0)
            if result:
                raise result

        with patch.object(publish, "wait_for_stable"), patch.object(
            publish, "run", side_effect=fake_run
        ):
            with self.assertRaisesRegex(RuntimeError, "site build failed"):
                publish.run_pipeline(path, settle_seconds=0)


if __name__ == "__main__":
    unittest.main()
