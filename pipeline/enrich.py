#!/usr/bin/env python3
"""ChipScope enrichment — drafts device entries from teardown articles.

For each "pending" item in data/discovery_queue.json:
  - fetches the article, extracts readable text,
  - asks an LLM (gpt-4o-mini) to draft a ChipScope device JSON using ONLY
    facts stated in the article, every component tagged "reported",
  - writes the draft to data/review/<id>.json and marks the queue item
    "drafted".

A human MUST review data/review/*.json before moving entries into
data/devices.json. The script never writes to devices.json itself.

Requires: OPENAI_API_KEY env var. Without it, prints manual instructions.
"""
from __future__ import annotations

import json
import os
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
QUEUE_FILE = DATA / "discovery_queue.json"
REVIEW_DIR = DATA / "review"

UA = {"User-Agent": "ChipScopeEnrich/1.0"}
TIMEOUT = 25

SYSTEM = """You turn a teardown article into a ChipScope device draft.
Return STRICT JSON only, no markdown fences:
{"id":"<slug-like id>","name":"<product name>","brand":"<maker>","category":"Phone|Laptop|Tablet|Wearable|Audio|Console|Board|Headset","year":<release year>,"tagline":"<one line>","highlights":[{"label":"SoC","value":"..."}],"components":[{"category":"SoC|Modem|Memory|Storage|Camera|Display|Audio|Power|Connectivity|Sensors","name":"<chip/part name>","vendor":"<vendor>","detail":"<optional>","confidence":"reported"}],"repairability":"<optional>","sources":[{"label":"<article title>","url":"<article url>"}]}
RULES: use ONLY facts stated in the article. Never invent part numbers, vendors, or specs. When unsure, omit the component. Every component confidence is "reported"."""


def fetch_text(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=TIMEOUT) as res:
        html = res.read().decode("utf-8", errors="replace")
    text = re.sub(r"<script.*?</script>|<style.*?</style>", " ", html, flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text[:30000]


def draft_with_llm(article_text: str, url: str) -> dict:
    import json as j

    key = os.environ["OPENAI_API_KEY"]
    payload = j.dumps(
        {
            "model": "gpt-4o-mini",
            "temperature": 0.1,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": SYSTEM},
                {"role": "user", "content": f"ARTICLE URL: {url}\n\nARTICLE TEXT:\n{article_text}"},
            ],
        }
    ).encode()
    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"},
    )
    with urllib.request.urlopen(req, timeout=120) as res:
        body = j.loads(res.read().decode())
    content = body["choices"][0]["message"]["content"]
    content = re.sub(r"^```(?:json)?\s*|\s*```$", "", content.strip(), flags=re.I)
    return j.loads(content)


def main() -> int:
    queue: list[dict] = json.loads(QUEUE_FILE.read_text()) if QUEUE_FILE.exists() else []
    pending = [q for q in queue if q.get("status") == "pending"]
    if not pending:
        print("Nothing pending.")
        return 0

    if not os.environ.get("OPENAI_API_KEY"):
        print("OPENAI_API_KEY not set — manual mode.")
        for q in pending:
            print(f"  - [{q['id']}] {q['title']}\n    {q['url']}")
        print("\nResearch each URL, then add entries to data/devices.json following the schema in README.")
        return 0

    REVIEW_DIR.mkdir(exist_ok=True)
    for q in pending:
        try:
            print(f"Drafting {q['id']}: {q['title']}")
            text = fetch_text(q["url"])
            draft = draft_with_llm(text, q["url"])
            draft["sources"] = [{"label": q["title"], "url": q["url"]}]
            (REVIEW_DIR / f"{q['id']}.json").write_text(json.dumps(draft, indent=2) + "\n")
            q["status"] = "drafted"
        except Exception as e:
            print(f"  ! failed: {e}", file=sys.stderr)
            q["status"] = "failed"
            q["error"] = str(e)[:200]

    QUEUE_FILE.write_text(json.dumps(queue, indent=2) + "\n")
    print(f"Done. Review drafts in {REVIEW_DIR}/ before promoting to devices.json.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
