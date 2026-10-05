# ChipScope

The current Expo mobile app and Express backend, with shared API contracts and persistent AI quota storage. This private repository is a product-only snapshot of the Replit app, not the entire Replit workspace.

## Layout

- `apps/mobile/`: current screens, assets, mobile logic and offline dataset
- `apps/api/`: private-data API and owner-sponsored OpenAI answers
- `lib/api-spec/`, `lib/api-zod/`, `lib/api-client-react/`: contracts, validation and generated client
- `lib/db/`: PostgreSQL schema including daily AI quotas
- `data/`: canonical dataset consumed by the backend
- `pipeline/`: weekly discovery, human-review drafts, validation and inactive workflow

## Clean install and checks

Use Node.js 22 or newer, pnpm 10.26.1 (enable Corepack or install that pnpm version), and Python 3 for dataset validation.

```sh
pnpm install --frozen-lockfile
pnpm run verify:source
pnpm run validate:data
pnpm run typecheck
pnpm run build:api
```

## Run

Set `PORT`, `DATABASE_URL`, `OPENAI_API_KEY` and `SESSION_SECRET` in the backend environment; names are shown in `apps/api/.env.example`. The backend does not automatically load .env files: inject environment variables through your host or shell. Use a development PostgreSQL database and run `pnpm run db:push` before AI requests.

```sh
pnpm run dev:api
# In a second terminal, from the repository root:
EXPO_PUBLIC_API_URL=https://your-backend-host.example pnpm run dev:mobile
```

For a physical phone, use an API origin reachable from that phone, not localhost. For a local simulator or web preview, localhost may be appropriate. API paths already include `/api`: supply only the origin.

Routes: `GET /api/healthz`, `GET /api/chipscope/bundle`, and `POST /api/chipscope/ask`. Users supply no AI key. Defaults are 10 requests per client per UTC day, 200 app-wide per UTC day and 3 concurrent requests per server instance.

### Current hosting dependency

The private-data loader uses Replit's server-side GitHub connector. It remains pointed at this repository's root `data/bundle.json`. A source checkout does not grant connector credentials: run this backend in the connected Replit environment. Making the backend independently deployable and configuring a permanent mobile API origin is separate release work, not part of this source export. Missing credentials produce an explicit unavailable response; the mobile app retains its offline dataset.

## Dataset and source integrity

All exported runtime source files are byte-identical to their Replit source, except explicitly documented standalone package/runtime configuration adaptations. `SOURCE_PROVENANCE.json` records SHA-256 hashes and source mappings; `SOURCE_HASHES.json` records every exported file except itself. `pnpm run verify:source` verifies the snapshot and both dataset copies. Intentional later edits require regenerating the hash manifest with `node scripts/verify-source.mjs --update`.

Canonical pipeline updates change root `data/`. The mobile dataset is an offline bootstrap snapshot: refresh it deliberately when preparing a release, then regenerate hashes. Do not silently promote discovery drafts into curated devices or chips.

See [WEEKLY_UPDATES.md](WEEKLY_UPDATES.md) and [PUBLISHING.md](PUBLISHING.md). No secrets, dependencies, build output or unrelated Replit artifacts are included. This export does not establish automatic source synchronization.
