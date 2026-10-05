#!/usr/bin/env python3
"""ChipScope discovery pipeline — finds the latest products from public sources.

Sources (all free, no keys needed):
  1. iFixit News listing  — article URLs like /News/<id>/<slug>; slugs
     containing "teardown" become candidates.
  2. TechInsights sitemap — paginated sitemap.xml; /blog/ URLs containing
     "teardown" reveal which products TechInsights covers (titles only —
     we never copy their paywalled content).

New findings are:
  - appended to data/discovery_queue.json (status "pending") for BoM research,
  - appended to data/news.json so the app's news feed stays fresh.

Idempotent: data/seen.json tracks every URL already processed.
Everything is best-effort — a source failing never breaks the run.
"""
from __future__ import annotations

import json
import hashlib
import re
import sys
import urllib.request
from datetime import date
from html import unescape
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
SEEN_FILE = DATA / "seen.json"
QUEUE_FILE = DATA / "discovery_queue.json"
NEWS_FILE = DATA / "news.json"

UA = {"User-Agent": "ChipScopeDiscovery/1.0 (+https://github.com/chipscope; contact: maintainer)"}
TIMEOUT = 25
FETCH_SUCCESSES = 0
# Only pick up teardown coverage from roughly the last 4 months — older posts
# are already in (or deliberately out of) the curated database.
RECENCY_DAYS = 120
MAX_NEWS = 40

IFIXIT_NEWS = "https://www.ifixit.com/News"
TECHINSIGHTS_SITEMAP = "https://www.techinsights.com/sitemap.xml?page={page}"

# iFixit sometimes covers non-teardown news; only these slug patterns count.
TEARDOWN_HINT = re.compile(r"teardown|inside-|what.s-inside", re.I)
IFIXIT_LINK = re.compile(r'href="(/News/(\d+)/([a-z0-9\-]+))"', re.I)
BLOG_LINK = re.compile(r"https://www\.techinsights\.com/blog/([a-z0-9\-]+)", re.I)


def fetch(url: str) -> str | None:
    global FETCH_SUCCESSES
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=TIMEOUT) as res:
            ctype = res.headers.get("Content-Type", "")
            if "text" not in ctype and "xml" not in ctype:
                return None
            text = res.read().decode("utf-8", errors="replace")
            FETCH_SUCCESSES += 1
            return text
    except Exception as e:  # best-effort: log and move on
        print(f"  ! fetch failed: {url} ({e})", file=sys.stderr)
        return None


def slug_to_title(slug: str) -> str:
    words = slug.replace("-", " ").strip()
    return unescape(words[:1].upper() + words[1:] if words else slug)


def load_json(path: Path, default):
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            pass
    return default


def ifixit_candidates() -> list[dict]:
    print("Checking iFixit News…")
    html = fetch(IFIXIT_NEWS)
    if not html:
        return []
    out = []
    for href, _id, slug in IFIXIT_LINK.findall(html):
        if TEARDOWN_HINT.search(slug):
            out.append(
                {
                    "source": "ifixit",
                    "url": f"https://www.ifixit.com{href}",
                    "title": slug_to_title(slug),
                    "slug": slug,
                }
            )
    # de-dupe by URL, keep order
    return list({c["url"]: c for c in out}.values())


def techinsights_candidates(seen: set[str]) -> list[dict]:
    print("Checking TechInsights sitemap…")
    from datetime import datetime, timedelta, timezone

    cutoff = datetime.now(timezone.utc) - timedelta(days=RECENCY_DAYS)
    out: list[dict] = []
    page = 1
    while page <= 10:  # sitemap index advertised 4 pages; be generous
        xml = fetch(TECHINSIGHTS_SITEMAP.format(page=page))
        if not xml:
            break
        try:
            root = ET.fromstring(xml)
        except Exception:
            break
        ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
        entries = 0
        for url_el in root.iter(f"{ns}url"):
            loc_el = url_el.find(f"{ns}loc")
            lastmod_el = url_el.find(f"{ns}lastmod")
            if loc_el is None or not loc_el.text:
                continue
            entries += 1
            u = loc_el.text.split("?")[0]
            m = BLOG_LINK.match(u)
            if not m or "teardown" not in m.group(1) or u in seen:
                continue
            # Recency gate: skip anything not touched in the last ~4 months.
            try:
                lastmod = datetime.fromisoformat((lastmod_el.text or "").replace("Z", "+00:00"))
            except Exception:
                continue
            if lastmod < cutoff:
                continue
            out.append(
                {
                    "source": "techinsights",
                    "url": u,
                    "title": slug_to_title(m.group(1)),
                    "slug": m.group(1),
                }
            )
        if entries == 0:
            break
        page += 1
    return out


def main() -> int:
    DATA.mkdir(exist_ok=True)
    seen: set[str] = set(load_json(SEEN_FILE, []))
    queue: list[dict] = load_json(QUEUE_FILE, [])
    news: list[dict] = load_json(NEWS_FILE, [])

    candidates = ifixit_candidates() + techinsights_candidates(seen)
    if not FETCH_SUCCESSES:
        raise RuntimeError("All discovery sources are unavailable; not publishing an empty update.")
    print(f"Found {len(candidates)} teardown candidates.")

    today = date.today().isoformat()
    new_count = 0
    for c in candidates:
        if c["url"] in seen:
            continue
        seen.add(c["url"])
        new_count += 1
        queue.append(
            {
                "id": f"q-{len(queue)+1:04d}",
                "status": "pending",
                "discovered": today,
                **c,
                "note": "Research BoM from the linked teardown, then move to devices.json.",
            }
        )
        news.append(
            {
                "id": f"news-{c['slug'][:24]}-{hashlib.sha1(c['url'].encode()).hexdigest()[:8]}",
                "date": today,
                "title": c["title"],
                "summary": f"New teardown coverage from {c['source']}: {c['title']}. Full component breakdown pending in the database.",
                "source": "iFixit" if c["source"] == "ifixit" else "TechInsights (public listing)",
                "url": c["url"],
            }
        )

    SEEN_FILE.write_text(json.dumps(sorted(seen), indent=2) + "\n")
    QUEUE_FILE.write_text(json.dumps(queue, indent=2) + "\n")
    # Keep the news feed readable: newest MAX_NEWS items only.
    news = sorted(news, key=lambda n: n.get("date", ""), reverse=True)[:MAX_NEWS]
    NEWS_FILE.write_text(json.dumps(news, indent=2) + "\n")
    print(f"New: {new_count} (queue: {len(queue)}, news: {len(news)})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
