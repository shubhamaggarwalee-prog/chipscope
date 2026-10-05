# Publishing ChipScope

## 1. Accounts (on you — ~15 minutes)

- **Apple Developer Program** — $99 USD/year, enroll at developer.apple.com with your Apple ID.
- **Google Play** — $25 USD one-time, at play.google.com/console.

## 2. App identity (already configured, change anytime)

`app.json`: name **ChipScope**, slug/scheme `chipscope`, bundle ids to set below. Replace
`assets/icon.png` with your own 1024×1024 icon before submitting (current one is a placeholder).

## 3. EAS — cloud builds, no Mac needed

```bash
npm install -g eas-cli
eas login
eas init            # creates the project, writes projectId into app.json
```

Set bundle identifiers (must be unique, e.g. `com.yourname.chipscope`):

```bash
# in app.json → ios.bundleIdentifier and android.package
```

Then build:

```bash
eas build --platform ios --profile production      # → .ipa
eas build --platform android --profile production  # → .aab
```

`eas.json` in this repo already defines `development`, `preview`, and `production` profiles.

## 4. Submit

```bash
eas submit --platform ios       # needs your Apple Developer API key (EAS guides you)
eas submit --platform android    # needs a Google Play service-account JSON
```

## 5. After launch

- **Data updates** flow through `data/bundle.json` — no rebuild needed.
- **Code updates** can ship over-the-air: `eas update --auto` (configure a channel first).

## Checklist before first submission

- [ ] Real 1024×1024 icon + splash in `assets/`
- [ ] `REMOTE_BUNDLE_URL` in `src/lib/store.ts` points at your repo
- [ ] Privacy policy URL (free generators exist; required by both stores — the app stores the OpenAI key in the OS keychain and fetches the public data bundle)
- [ ] Screenshots for both stores (Expo Go on your phone works fine)
