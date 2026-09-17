"""Validate, import, test, and build from a locally synced OneDrive workbook.

This command never writes to the workbook and never deploys or pushes changes.
The existing workbook importer creates a timestamped CSV backup before import.
"""
import argparse
import os
import subprocess
import sys
import time
import zipfile
from pathlib import Path

import workbook


DEFAULT_ENV = "ARCHIVORY_SHARED_WORKBOOK"
LOCK_PREFIX = "~$"
TEMP_SUFFIXES = (".tmp", ".partial", ".crdownload", ".download")


def configured_workbook(explicit=None):
    value = explicit or os.environ.get(DEFAULT_ENV, "")
    if not value.strip():
        raise ValueError(
            f"Set {DEFAULT_ENV} to the synced .xlsx path or pass --workbook PATH"
        )
    raw_path = Path(value)
    if raw_path.name.startswith(LOCK_PREFIX) or raw_path.suffix.lower() in TEMP_SUFFIXES:
        raise ValueError(f"Workbook looks temporary or locked: {raw_path.name}")
    path = raw_path.expanduser()
    if path.suffix.lower() != ".xlsx":
        raise ValueError("Shared workbook must be an .xlsx file")
    return path


def readable_xlsx(path):
    if not path.exists():
        raise FileNotFoundError(f"Shared workbook does not exist: {path.name}")
    if not path.is_file():
        raise ValueError(f"Shared workbook is not a file: {path.name}")
    if not os.access(path, os.R_OK):
        raise PermissionError(f"Shared workbook is not readable: {path.name}")
    try:
        with zipfile.ZipFile(path) as archive:
            if archive.testzip() is not None:
                raise ValueError("Workbook archive contains a corrupt entry")
            required = {"xl/workbook.xml"}
            missing = required - set(archive.namelist())
            if missing:
                raise ValueError("Workbook is missing its workbook structure")
    except zipfile.BadZipFile as error:
        raise ValueError("Workbook is not a readable Excel .xlsx file") from error


def workbook_signature(path):
    stat = path.stat()
    return stat.st_size, stat.st_mtime_ns


def wait_for_stable(path, seconds=2):
    readable_xlsx(path)
    before = workbook_signature(path)
    if seconds:
        time.sleep(seconds)
    readable_xlsx(path)
    after = workbook_signature(path)
    if before != after:
        raise RuntimeError(
            "Workbook is still changing; wait for OneDrive/Excel to finish saving and retry"
        )


def run(command, label):
    print(f"[{label}] {' '.join(command)}")
    result = subprocess.run(command, cwd=workbook.ROOT, text=True, capture_output=True)
    if result.stdout:
        print(result.stdout.rstrip())
    if result.returncode:
        if result.stderr:
            print(result.stderr.rstrip(), file=sys.stderr)
        raise RuntimeError(f"{label} failed with exit code {result.returncode}")
    return result


def stable_vocab(data):
    expected = [row["slot_id"] for row in workbook.sources()["Slots"]["rows"]]
    actual = [row.get("slot_id", "") for row in data.get("Slots", [])]
    if actual != expected:
        raise ValueError("Workbook changes the established slot ID vocabulary")


def run_pipeline(path, *, dry_run=False, settle_seconds=2):
    wait_for_stable(path, settle_seconds)
    sheets = workbook.read_xlsx(path)
    stable_vocab(
        {
            "Slots": [
                dict(zip(sheets["Slots"][0], row))
                for row in sheets.get("Slots", [])[1:]
                if any(row)
            ]
        }
    )
    command = [sys.executable, str(workbook.ROOT / "utilities/editorial-workbook/workbook.py")]
    run(command + ["check", str(path)], "validate")
    if dry_run:
        print("DRY RUN: validation passed; no CSV files or site output were changed.")
        return
    before_ids = [row["slot_id"] for row in workbook.sources()["Slots"]["rows"]]
    run(command + ["apply", str(path)], "import")
    after_sources = workbook.sources()
    if [row["slot_id"] for row in after_sources["Slots"]["rows"]] != before_ids:
        raise RuntimeError("Import changed the established slot ID vocabulary")
    run(command + ["check", str(path)], "post-check")
    run(["node", "utilities/test-room-placement.cjs"], "room tests")
    bundle_command = "bundle.bat" if os.name == "nt" else "bundle"
    run(
        [
            bundle_command,
            "exec",
            "jekyll",
            "build",
            "--config",
            "_config.yml,_config.local.yml",
        ],
        "site build",
    )
    print("SUCCESS: workbook imported, room tests passed, and the site is deployment-ready.")
    print("No deployment was performed.")


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Publish a locally synced OneDrive ArchIvory workbook to a build-ready site"
    )
    parser.add_argument("--workbook", help=f"Path override; otherwise ${DEFAULT_ENV}")
    parser.add_argument("--dry-run", action="store_true", help="Validate only; do not import or build")
    parser.add_argument(
        "--settle-seconds",
        type=float,
        default=2,
        help="Seconds between file stability checks (default: 2)",
    )
    args = parser.parse_args(argv)
    try:
        run_pipeline(
            configured_workbook(args.workbook),
            dry_run=args.dry_run,
            settle_seconds=max(0, args.settle_seconds),
        )
    except Exception as error:
        print(f"STOPPED: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
