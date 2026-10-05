#!/usr/bin/env python3
"""Assembles data/bundle.json from the canonical data/*.json files.

The app fetches bundle.json from raw.githubusercontent.com on launch, so a
pipeline run updates every installed app without an app-store release.
Version bumps only when content actually changed (sha1 of the payload).
"""
from __future__ import annotations

import hashlib
import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
BUNDLE = DATA / "bundle.json"


def main() -> int:
    devices = json.loads((DATA / "devices.json").read_text())
    chips = json.loads((DATA / "chips.json").read_text())
    news = json.loads((DATA / "news.json").read_text())

    payload = {"devices": devices, "chips": chips, "news": news}
    digest = hashlib.sha1(json.dumps(payload, sort_keys=True).encode()).hexdigest()[:12]

    prev = json.loads(BUNDLE.read_text()) if BUNDLE.exists() else {}
    version = prev.get("version", 0)
    if prev.get("digest") == digest:
        print(f"bundle.json v{version} unchanged")
        return 0
    version += 1

    bundle = {
        "version": version,
        "digest": digest,
        "updatedAt": date.today().isoformat(),
        **payload,
    }
    BUNDLE.write_text(json.dumps(bundle) + "\n")
    print(f"bundle.json v{version} ({len(devices)} devices, {len(chips)} chips, {len(news)} news)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
