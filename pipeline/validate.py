#!/usr/bin/env python3
"""Reject malformed records and unreviewed drafts before publishing a bundle."""
import json
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"


def main():
    bundle = json.loads((DATA / "bundle.json").read_text())
    assert isinstance(bundle["version"], int) and bundle["version"] >= 1
    for name in ("devices", "chips", "news"):
        canonical = json.loads((DATA / f"{name}.json").read_text())
        assert bundle[name] == canonical, f"bundle does not match {name}"
        ids = [record["id"] for record in canonical]
        assert len(ids) == len(set(ids)), f"duplicate {name} ids"
    for device in bundle["devices"]:
        assert all(k in device for k in ("id", "name", "brand", "category", "year", "tagline", "highlights", "components", "sources"))
        for component in device["components"]:
            assert all(k in component for k in ("category", "name", "vendor", "confidence"))
            assert component["confidence"] in ("verified", "reported")
    for chip in bundle["chips"]:
        assert all(k in chip for k in ("id", "name", "vendor", "kind", "specs", "usedIn"))
    for news in bundle["news"]:
        assert all(isinstance(news.get(k), str) for k in ("id", "date", "title", "summary", "source", "url"))
        assert news["url"].startswith("https://")
    print("Dataset and bundle validated; review drafts remain separate.")


if __name__ == "__main__":
    main()
