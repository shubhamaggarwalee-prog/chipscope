# Publishing ChipScope

Publish the backend and configure a permanent public origin before releasing the mobile app. The current backend's private GitHub connector requires the connected Replit environment; independent hosting configuration is separate work.

Run EAS commands from `apps/mobile/` after a root `pnpm install --frozen-lockfile`. Set unique `ios.bundleIdentifier` and `android.package` values in `app.json`, initialize your EAS project, and configure the non-secret `EXPO_PUBLIC_API_URL` for each build environment. Do not append /api to that origin.

```sh
cd apps/mobile
pnpm dlx eas-cli login
pnpm dlx eas-cli init
pnpm dlx eas-cli build --platform ios --profile production
pnpm dlx eas-cli build --platform android --profile production
```

Apple and Google developer accounts, store listing assets, privacy disclosures and signing setup are required. Validate icons and screenshots before submission.

The app does not store the owner's OpenAI key in the OS keychain or bundle. That key and quota salt stay in server Secrets; GitHub credentials stay in the server-side connector. Document AI processing and daily quota storage in the privacy policy. The API distributes the validated dataset from the private repository, not a public raw GitHub URL.

Before release: verify online data refresh, offline fallback, AI answers and quota behavior against the published backend. This source synchronization does not publish the app or backend.
