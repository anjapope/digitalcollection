"""Build the one-way publication projection from the normalized editorial data.

The CSV/JSON tables remain the authority.  This module creates consumable
CollectionBuilder and room-routing projections and never accepts edits to them
as source data.
"""
import csv
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TABLE_FILES = {
    "Placements": "placements.csv", "Content": "room_content.csv",
    "Events": "timeline_events.csv", "Timelines": "room_timelines.csv",
    "Rooms": "rooms.csv", "Slots": "exhibit_slots.csv",
    "Collection": "demo-metadata.csv",
}
OVERRIDE_FIELDS = {"title", "description", "route_slug", "published"}
METADATA_HEADERS = [
    "objectid", "parentid", "title", "creator", "date", "description",
    "subject", "location", "latitude", "longitude", "source", "identifier",
    "type", "format", "language", "rights", "rightsstatement",
    "display_template", "object_location", "image_small", "image_thumb",
    "image_alt_text", "object_transcript", "room_url", "room_label",
    "publication_targets",
]


def read_csv(path):
    with Path(path).open(encoding="utf-8-sig", newline="") as stream:
        return [{key: value or "" for key, value in row.items()}
                for row in csv.DictReader(stream)]


def slug(value):
    value = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return value or "publication"


def load_sources(root=ROOT):
    return {name: read_csv(Path(root) / "_data" / filename)
            for name, filename in TABLE_FILES.items()}


def load_overrides(root=ROOT):
    path = Path(root) / "_data" / "publication_overrides.csv"
    if not path.exists():
        return []
    rows = read_csv(path)
    errors = []
    for row in rows:
        if not row.get("target_id") or row.get("field") not in OVERRIDE_FIELDS:
            errors.append("Overrides require target_id and a supported field")
    if errors:
        raise ValueError("\n".join(errors))
    return rows


def _overrides(rows):
    result = {}
    for row in rows:
        target = result.setdefault(row["target_id"], {})
        if row["field"] in target:
            raise ValueError(
                f"Duplicate publication override for {row['target_id']} {row['field']}"
            )
        target[row["field"]] = row.get("value", "")
    return result


def build_model(data, overrides=()):
    """Return deterministic routing targets and CollectionBuilder records."""
    content = {row["content_id"]: dict(row) for row in data["Content"]}
    collection = {row["objectid"]: dict(row) for row in data["Collection"]}
    rooms = {row["room_id"]: row for row in data["Rooms"]}
    slots = {row["slot_id"]: row for row in data["Slots"]}
    changes = _overrides(overrides)
    targets = []
    for placement in sorted(data["Placements"], key=lambda row: row["placement_id"]):
        slot = slots.get(placement["slot_id"])
        if not slot:
            continue
        room = rooms.get(slot["room_id"], {})
        source = content.get(placement["content_id"], {})
        title = source.get("title", placement["content_id"])
        description = source.get("description", "")
        override = changes.get(placement["placement_id"], {})
        target = {
            "target_id": placement["placement_id"],
            "placement_id": placement["placement_id"],
            "record_id": placement["content_id"],
            "record_kind": ("collection" if placement["content_id"] in collection
                            else "content"),
            "slot_id": slot["slot_id"],
            "room_id": slot["room_id"],
            "room_label": room.get("editor_label", slot["room_id"]),
            "room_url": room.get("route", ""),
            "content_type": placement["content_type"],
            "sort_order": placement["sort_order"],
            "published": override.get("published", placement["published"]),
            "title": override.get("title", title),
            "description": override.get("description", description),
            "route_slug": override.get("route_slug", slug(placement["content_id"])),
        }
        target["item_url"] = ("/items/" + target["route_slug"] + ".html"
                              if target["content_type"] not in ("timeline", "tool")
                              else "")
        targets.append(target)
    known = {target["target_id"] for target in targets}
    unknown = sorted(set(changes) - known)
    if unknown:
        raise ValueError("Override targets do not exist: " + ", ".join(unknown))

    by_record = {}
    for target in targets:
        if target["published"] == "true" and target["item_url"]:
            by_record.setdefault(target["record_id"], []).append(target)
    metadata = []
    for record_id in sorted(by_record):
        target_list = by_record[record_id]
        source = dict(collection.get(record_id, {}))
        editorial = content.get(record_id, {})
        primary = target_list[0]
        row = {field: source.get(field, "") for field in METADATA_HEADERS}
        row.update({
            "objectid": record_id,
            "title": primary["title"] or source.get("title", record_id),
            "description": primary["description"] or source.get("description", ""),
            "source": editorial.get("citation", "") or source.get("source", ""),
            "object_location": editorial.get("image", "") or source.get("object_location", ""),
            "image_small": editorial.get("image", "") or source.get("image_small", ""),
            "image_thumb": editorial.get("image", "") or source.get("image_thumb", ""),
            "image_alt_text": source.get("image_alt_text", "") or primary["title"],
            "room_url": primary["room_url"],
            "room_label": primary["room_label"],
            "publication_targets": "|".join(target["target_id"] for target in target_list),
        })
        metadata.append(row)
    return {"version": 1, "targets": targets}, metadata


def write_projection(root=ROOT):
    root = Path(root)
    data = load_sources(root)
    model, metadata = build_model(data, load_overrides(root))
    canonical = json.dumps(model, ensure_ascii=False, indent=2) + "\n"
    (root / "_data" / "publication_targets.json").write_text(
        canonical, encoding="utf-8"
    )
    with (root / "_data" / "publication-metadata.csv").open(
        "w", encoding="utf-8", newline=""
    ) as stream:
        writer = csv.DictWriter(stream, fieldnames=METADATA_HEADERS,
                                lineterminator="\n")
        writer.writeheader()
        writer.writerows(metadata)
    digest = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    return {"targets": len(model["targets"]), "metadata": len(metadata),
            "fingerprint": digest}
