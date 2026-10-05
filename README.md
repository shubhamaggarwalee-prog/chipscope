# ChipScope — free teardown intelligence

What’s inside the world’s electronics, built entirely from public sources. No lab, no paywall.

- **Discover** — search devices and chips, filter by category, read the latest teardown news
- **Teardown view** — every device’s chips with vendor, specs, and Verified/Reported confidence
- **Chip profiles** — process node, foundry, specs, and every device that uses the chip
- **Compare** — two devices side by side
- **Ask AI** — grounded Q&A over the database (your own OpenAI key, gpt-4o-mini)

## Run it

```bash
npm install
npx expo start
```

Scan the QR with **Expo Go** (iOS/Android), or press `i` / `a` for simulators.

## How the data stays fresh (free)

`pipeline/discover.py` runs weekly on GitHub Actions (free tier) and:

1. Scrapes the **iFixit News** listing for new teardowns
2. Reads **TechInsights’ public sitemap** for new teardown announcements (titles only — we never copy their paywalled content)
3. Appends findings to `data/discovery_queue.json` and fresh items to `data/news.json`
4. `pipeline/enrich.py` drafts device entries from the articles (needs `OPENAI_API_KEY` repo secret; drafts land in `data/review/` for human approval — never auto-published)
5. `pipeline/build_bundle.py` rebuilds `data/bundle.json`

The app checks for a new bundle on launch and self-updates — no app-store release needed.

### One-time setup for auto-updates

1. Push this repo to GitHub.
2. In `src/lib/store.ts`, set `REMOTE_BUNDLE_URL` to:
   `https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/data/bundle.json`
3. (Optional) Add your OpenAI key as the `OPENAI_API_KEY` repo secret for auto-drafts.
4. The `update-data` workflow runs every Monday; use “Run workflow” to trigger it now.

Test the pipeline locally any time:

```bash
python3 pipeline/discover.py
python3 pipeline/build_bundle.py
```

## Data schema

Canonical files: `data/devices.json`, `data/chips.json`, `data/news.json`.

- Every component has `confidence`: `"verified"` (maker-confirmed or multiple teardowns) or `"reported"` (single reputable report).
- Every device lists `sources` with links. Link only to pages you’ve actually verified.
- Never invent part numbers, vendors, or specs. Omit what you can’t confirm.

## Making money (keeping the app free)

Affiliate plumbing is built in — `src/lib/affiliate.ts`:

1. **Amazon Associates** (verified program): sign up at https://affiliate-program.amazon.com/
   — free, works with mobile apps. You get a tag like `chipscope-20`; paste it into
   `AFFILIATE_IDS` in that file. Note: Amazon requires 3 qualifying sales in 180 days
   to keep the account approved.
2. **ShareASale / Awin** (affiliate networks): search their merchant directories for
   electronics/component retailers, join their programs, add the tags the same way.
3. **Mouser / Digi-Key / LCSC**: no public self-serve affiliate program could be verified —
   their in-app buttons work as plain part-search links (still useful, just not earning).

Rebuild after adding IDs. Every chip page ("Find this chip") and device page ("Find parts")
shows distributor buttons carrying your tag, with an automatic commission disclosure
(FTC requirement — don't remove it).

## Publishing to the App Store / Play Store

See `PUBLISHING.md` — EAS builds in the cloud, no Mac required.

## Legal notes

- Teardown **facts** (which chip is in which phone) aren’t copyrightable; report **text and photos** are. We link and attribute, never copy.
- iFixit community content is CC BY-NC-SA — fine to reference with attribution in a free app.
- FCC filings are US public records.

## Replit / Gmail note
`babel.config.js` ships as `babel.config.js.txt` because Gmail strips `.js`
files from zips. In Replit, create a new file named `babel.config.js` at the
project root and paste in the contents of `babel.config.js.txt` (or rename it).
Then: `npm install` → `npx expo start`.
