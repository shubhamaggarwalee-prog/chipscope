# Weekly ChipScope updates

## One-time GitHub activation

GitHub Actions is enabled for the private repository. The Replit GitHub connection
can update source files but cannot write executable workflow files.

1. Open `pipeline/update-data-workflow.yml` in GitHub's editor.
2. Move it to `.github/workflows/update-data.yml` and commit to `main`.
3. Open **Actions → Update teardown database → Run workflow** to verify the first run.

The schedule is **Monday at 09:00 UTC**. A scheduled workflow must exist on the
repository's default branch.

## What changes automatically

- Discover public teardown listings from iFixit and TechInsights.
- Add unseen links to the news feed and the human-review discovery queue.
- Rebuild `data/bundle.json` only when its content changes.
- Validate the bundle before committing it.

Curated devices and chips are not rewritten by discovery. Review drafts manually
before promoting them into `data/devices.json`.

Discovery and news updates need no AI key. The original optional enrichment step
can use a separate GitHub Actions `OPENAI_API_KEY` secret; without it, it prints
manual research instructions. Replit Secrets are not copied to GitHub.

## Private repository, public teardown data

The Replit API serves only the validated dataset at `/api/chipscope/bundle`.
GitHub credentials stay server-side. The mobile app checks for the latest bundle
on launch and keeps a validated local cache for offline use.

## Free AI in the Replit app

The configured Replit app uses `/api/chipscope/ask`; users do not enter API keys.
The owner's `OPENAI_API_KEY` stays in server-side Replit Secrets. OpenAI bills the
owner, not the app's users.

Default limits: 10 AI requests per client per UTC day, 200 across the app per UTC
day, and three simultaneous requests per server instance. Daily counters are
stored in PostgreSQL, without prompts or raw client IP addresses.

For a production release, publish the backend and configure the mobile build's
public `EXPO_PUBLIC_API_URL` with its permanent origin. Never use an OpenAI key in
an `EXPO_PUBLIC_*` variable.

This repository now includes the current mobile app, backend and shared libraries.
It is a verified source snapshot, not automatic synchronization with Replit.
The workflow and canonical data stay at the repository root; apps/mobile/data is
an offline bootstrap snapshot refreshed deliberately for future app releases.
