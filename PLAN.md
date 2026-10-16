# Finance Tracker — Implementation Plan

## Goal

A personal finance tracker: create budgets and track expenditure. Built with **Ionic + Vue**, compiled to **three platforms — Web, Android, iOS**.

## Data policy

- **For now: data stays 100% on device.** All data lives in browser/app `localStorage` behind a repository layer. No backend, no network calls, no telemetry.
- **Future (planned, not in v1):** a backend API will be added so data syncs to the cloud and across all platforms (web / Android / iOS) based on **user credentials**. The repository layer is the seam where a remote/sync implementation will later replace or wrap the localStorage implementation — repositories must therefore expose async APIs from day one, and all reads/writes must go through them (no direct `localStorage` access outside the storage adapter).

## Stack decisions

| Concern       | Choice                                                                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| UI framework  | **Ionic 9 Vue** (`@ionic/vue` + `@ionic/vue-router`, Vue 3.5, Vue Router 5)                                                              |
| Build         | Existing **Vite+** toolchain (`vp dev`, `vp build`, `vp check`, `vp test`) + `@vitejs/plugin-vue`                                        |
| Native shells | **Capacitor** (`@capacitor/core`, `android/`, `ios/`, `webDir: dist`)                                                                    |
| State         | **Pinia** (stores: transactions, budgets, categories)                                                                                    |
| Charts        | **chart.js** (doughnut: spending by category; optional bar: monthly trend)                                                               |
| Storage       | **localStorage behind a repository layer** — typed repo interfaces; localStorage impl is swappable for a cloud-sync implementation later |
| Type check    | `vue-tsc` for `.vue`/`.ts` (verify how `vp check` picks it up in phase 1)                                                                |

## App structure (tabs)

| Tab          | Contents                                                                           |
| ------------ | ---------------------------------------------------------------------------------- |
| Dashboard    | Month income/expense/balance, budget progress, doughnut chart, recent transactions |
| Transactions | List by month, filter by type/category, add/edit via modal, swipe-delete           |
| Budgets      | Per-category monthly limit, spent/remaining bar, overspend highlight               |
| Settings     | Categories management (CRUD, default set seeded) + currency choice                 |

## Domain model (localStorage JSON, versioned keys e.g. `ft:transactions:v1`)

```ts
Transaction { id, type: "income" | "expense", amount, categoryId, date /* YYYY-MM-DD */, note?, createdAt, updatedAt }
Budget      { id, categoryId, month /* YYYY-MM-MM: YYYY-MM */, limit }
Category    { id, name, type: "income" | "expense" | "both", icon, color }
Settings    { currency }
```

Seed default categories on first run.

## Target structure

```
src/
  main.ts, App.vue, theme/variables.css
  router/index.ts          # @ionic/vue-router, 4 tab routes
  views/                   # DashboardPage, TransactionsPage, BudgetsPage, SettingsPage(+Categories)
  components/              # TransactionForm, TransactionListItem, BudgetProgressCard,
                           # CategoryPieChart, MonthPicker, CategoryForm
  stores/                  # pinia: transactions, budgets, categories
  repositories/            # types.ts, localStorage adapter, *Repo.ts  ← all data access
  utils/                   # currency, month helpers, id
capacitor.config.ts        # appId, webDir dist
```

## Milestones

1. **Foundation** — Vue plugin + Ionic packages, replace template shell with `App.vue` + tabs router; `vp dev` renders tabbed app; wire `vue-tsc` into check/build.
2. **Domain + storage** — types, repositories, seed default categories, unit tests for repos & budget math (`vp test`).
3. **Transactions** — list/add/edit/delete + month & category filters.
4. **Budgets** — set monthly limits per category, progress vs actual spend.
5. **Dashboard + charts** — summary cards, budget progress, chart.js doughnut.
6. **Settings/categories** — CRUD categories, currency.
7. **Capacitor** — `cap init/add android/ios`, `mobile` script (`vp build && cap sync`), safe-area/CSS adjustments, verify web + Android emulator.
8. **Validation pass** — `vp check`, `vp test`, `vp build`, README covering how to run each platform.

## Status

| Phase                             | Status                                          |
| --------------------------------- | ----------------------------------------------- |
| 1 Foundation                      | ✅ done                                         |
| 2 Domain + storage (+ unit tests) | ✅ done                                         |
| 3 Transactions UI                 | ✅ done                                         |
| 4 Budgets UI                      | ✅ done                                         |
| 5 Dashboard + charts              | ✅ done                                         |
| 6 Settings/categories             | ✅ done                                         |
| 7 Capacitor (web/android/ios)     | ✅ done (native run needs Android Studio/Xcode) |
| 8 Validation + README             | ✅ done                                         |

`vp check`, `vue-tsc --noEmit`, `vp test` (15 tests) and `vp build` all pass; `cap add android` / `cap add ios` and `cap sync` succeed.

## Constraints & risks

- **Environment**: development on Linux/WSL — Android SDK/Studio can run here; **iOS builds require macOS/Xcode**, so the `ios/` project will be generated but must be built on a Mac.
- `vp check`'s type-checker may not understand `.vue` files natively → phase 1 verifies; fallback is explicit `vue-tsc --noEmit` in the build script.
- Router history: use `createWebHistory` initially; switch to hash history if Capacitor deep routes misbehave.
- The project is not yet a git repo — `git init` can be done as step 0.
