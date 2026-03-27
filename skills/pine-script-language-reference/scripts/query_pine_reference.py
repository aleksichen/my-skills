#!/usr/bin/env python3
"""
Query local Pine v6 reference index.

Usage:
  python "$SKILL_DIR/scripts/query_pine_reference.py" ta.sma
  python "$SKILL_DIR/scripts/query_pine_reference.py" strategy. --prefix
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Dict, List, Tuple


def load_entries(index_path: Path) -> List[Tuple[str, str, Dict]]:
    data = json.loads(index_path.read_text(encoding="utf-8"))
    entries: List[Tuple[str, str, Dict]] = []

    # Prefer full index format when available.
    if "entries" in data:
        for item in data.get("entries", []):
            name = item.get("name")
            if name:
                entries.append((item.get("category", "unknown"), name, item))
        return entries

    # Backward compatibility: enriched structure format.
    for section in data.get("sections", []):
        section_name = section.get("name", "unknown")
        for child in section.get("children", []):
            name = child.get("name")
            if name:
                entries.append((section_name, name, child))
    return entries


def resolve_index_path(script_file: Path) -> Path:
    full_name = "pine-v6-reference-full.json"
    structure_name = "pine-v6-reference-structure.json"

    override = os.getenv("PINE_REFERENCE_INDEX_PATH", "").strip()
    if override:
        override_path = Path(override).expanduser().resolve()
        candidates = [override_path]
        if override_path.is_dir():
            candidates = [override_path / full_name, override_path / structure_name]
        for candidate in candidates:
            if candidate.exists():
                return candidate
        raise SystemExit(f"Index not found via PINE_REFERENCE_INDEX_PATH: {override_path}")

    for parent in script_file.resolve().parents:
        docs_reference = parent / "docs" / "reference"
        full_index_path = docs_reference / full_name
        if full_index_path.exists():
            return full_index_path
        structure_index_path = docs_reference / structure_name
        if structure_index_path.exists():
            return structure_index_path

    raise SystemExit(
        "Index not found. Set PINE_REFERENCE_INDEX_PATH to the index file path "
        "or to a directory containing pine-v6-reference-full.json."
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Query Pine v6 local reference index")
    parser.add_argument("term", help="Entry name or prefix to search")
    parser.add_argument("--prefix", action="store_true", help="Enable prefix match")
    args = parser.parse_args()

    index_path = resolve_index_path(Path(__file__))

    term = args.term.strip()
    normalized_term = term[:-2] if term.endswith("()") else term
    entries = load_entries(index_path)

    if args.prefix:
        matches = [
            (cat, name, payload)
            for cat, name, payload in entries
            if name.startswith(term) or name.startswith(normalized_term)
        ]
    else:
        exact = [
            (cat, name, payload)
            for cat, name, payload in entries
            if name == term
            or name == normalized_term
            or name == f"{term}()"
            or name == f"{normalized_term}()"
        ]
        matches = exact if exact else [
            (cat, name, payload)
            for cat, name, payload in entries
            if term in name or normalized_term in name
        ]

    if not matches:
        print("Match: none")
        print("Entry:", term)
        print("Source:", index_path)
        return

    print(
        "Match:",
        "exact"
        if any(
            name == term
            or name == normalized_term
            or name == f"{term}()"
            or name == f"{normalized_term}()"
            for _, name, _ in matches
        )
        else "partial",
    )
    print("Entry:", term)
    print("Source:", index_path)
    print("")
    for cat, name, payload in matches[:100]:
        desc = ""
        descriptions = payload.get("description", [])
        if isinstance(descriptions, list) and descriptions:
            desc = descriptions[0]
        elif isinstance(descriptions, str):
            desc = descriptions
        desc = desc.replace("\n", " ").strip()
        if len(desc) > 140:
            desc = desc[:137] + "..."

        if desc:
            print(f"- [{cat}] {name}: {desc}")
        else:
            print(f"- [{cat}] {name}")
    if len(matches) > 100:
        print(f"... and {len(matches) - 100} more")


if __name__ == "__main__":
    main()
