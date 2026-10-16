# Finance Tracker

Personal finance tracker for creating monthly budgets and tracking expenditure. One Ionic + Vue codebase, compiled to **Web**, **Android**, and **iOS** via Capacitor.

## Data policy

**Data stays 100% on device** — no backend, no network calls. Everything is stored in `localStorage` behind a repository layer (`src/repositories/`). In a later phase a backend API will sync data to the cloud across web/Android/iOS based on user credentials; that change happens behind the same repository interfaces.

## Stack

- **Ionic 9 + Vue 3** (`@ionic/vue`, `@ionic/vue-router`) with tabs
- **Pinia** for state, **chart.js** for the spending chart
- **Vite+** toolchain (`vp`) — Vite/Rolldown, Vitest, Oxlint, Oxfmt
- **Capacitor 8** for native Android/iOS shells

## Requirements

- Node.js 20+ (Vite+ manages the runtime)
- Android: Android Studio + Android SDK (JDK 17) — available on Linux/Windows/macOS
- iOS: **macOS + Xcode** required to build/run

## Commands

| Command               | What it does                                     |
| --------------------- | ------------------------------------------------ |
| `pnpm dev` (`vp dev`) | Start the dev server for the web app             |
| `pnpm build`          | Type-check (`vue-tsc`) then build to `dist/`     |
| `pnpm preview`        | Preview the production web build                 |
| `pnpm check`          | Format, lint and type-check (`vp check`)         |
| `pnpm test`           | Run unit tests (`vp test run`)                   |
| `pnpm mobile:sync`    | Build web assets and `cap sync` to Android + iOS |
| `pnpm android`        | Build, sync and open the Android project         |
| `pnpm ios`            | Build, sync and open the iOS project             |

## Platform builds

**Web** — `pnpm build` produces the static bundle in `dist/` (deploy anywhere).

**Android** — `pnpm android` builds the web assets, syncs them into `android/`, then opens Android Studio. Build/run from there (or `npx cap run android`).

**iOS** — `pnpm ios` (on macOS) builds, syncs into `ios/` and opens Xcode.

Native projects live in `android/` and `ios/` and are committed as source. After any web change, run `pnpm mobile:sync` before testing natively.

## Project structure

```
src/
  main.ts, App.vue          # app bootstrap (Ionic + Pinia + router)
  router/                   # tab routes
  views/                    # Dashboard, Transactions, Budgets, Settings (tab pages)
  components/               # forms, list items, budget card, chart, month picker
  stores/                   # Pinia stores
  repositories/             # domain types, localStorage adapter, repositories  ← all data access
  utils/                    # currency, month, budget math (+ unit tests)
  theme/                    # Ionic theme variables
capacitor.config.ts         # appId / appName / webDir
```
