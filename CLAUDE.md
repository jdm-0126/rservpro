# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies
- `npx expo start` (or `npm start`) — start Metro dev server; `--android`, `--ios`, `--web` switches the target
- `npm run lint` — `expo lint`
- `npm test` — `jest --watchAll` (preset `jest-expo`); run a single file with `npx jest path/to/file.test.tsx`
- `npm run build` — static web export to `dist/` (`expo export -p web`)
- `npm run vercel-build` — what Vercel runs: generates PWA icons, exports web, then strips `eas.json` and `create-production-builds.yml` from `dist/` so EAS/CI config never ships
- `npm run generate-icons` — regenerate PWA icons (192/512) into `public/icons/` from `assets/images/icon.png` (requires `sharp`)
- `npx vercel --prod` — deploy web build to Vercel
- `eas build --profile {development|preview|production}` — native builds (see `eas.json`); production Android emits an app-bundle, preview emits an APK
- `npm run reset-project` — moves current starter into `app-example/` and creates a blank `app/`. Destructive — don't run unless explicitly requested.

## Architecture

Expo Router app (SDK 55, React Native 0.76, new arch enabled) that ships to iOS/Android via EAS and to the web as a static PWA on Vercel from the same codebase. **There is no backend** — all data lives client-side in `AsyncStorage`.

### Provider stack and where state lives

`app/_layout.tsx` wraps everything in three contexts (in this order):

1. **`AuthContext`** (`context/AuthContext.tsx`) — Google OAuth via `expo-auth-session`. User is persisted under `villa_user`. `isAdmin` is derived by comparing the user's email against the comma-separated `EXPO_PUBLIC_ADMIN_EMAIL` env var; there is no role table.
2. **`VillaContext`** (`context/VillaContext.tsx`) — villa catalog. Seeds from the hard-coded `VILLAS` array in `constants/villaData.ts` on first run; once an admin edits, the full list is mirrored to `villa_listings` and `AsyncStorage` becomes the source of truth.
3. **`BookingContext`** (`context/BookingContext.tsx`) — owns bookings, blocked date ranges, and admin notifications (keys `villa_bookings_v3`, `villa_blocked_ranges`, `villa_admin_notifications`). Availability is computed by expanding every confirmed booking and blocked range into a set of `YYYY-MM-DD` strings and checking intersections — use the exported `expandDateRange` and the `isDateRangeAvailable` selector instead of re-implementing.

Bumping a storage shape requires bumping the key suffix (note `villa_bookings_v3`) — old data is not migrated.

### Routing

File-based via `expo-router` with typed routes enabled (`experiments.typedRoutes`). Layout:

- `app/index.tsx` — Get-Started splash; redirects signed-in users to `/(tabs)`.
- `app/(tabs)/` — main tabs (Villas, Bookings, Profile, Admin). The Admin tab is conditionally rendered via `href: null` when `isAdmin` is false — don't gate it with a route guard.
- `app/admin/` — admin-only screens (villa form, availability blocking). Routed to from inside the admin tab; not itself in the tab bar.
- `app/villa/[id].tsx`, `app/booking/[id].tsx` — dynamic detail/booking screens.
- `app/screens/` — auxiliary screens registered as stack screens in the root layout.

The path alias `@/*` (see `tsconfig.json`) resolves to the project root — prefer `@/context/...`, `@/components/...` over relative paths.

### Global chat assistant

`components/ChatAssistant.tsx` is mounted once in `app/(tabs)/_layout.tsx` so it floats over every tab. `getBotReply` is a rule-based regex matcher — **order matters**: `book <villa>` intents must come before bare villa-name intents, otherwise "Book Pampanga" matches `/pampanga/` and returns info instead of the booking form. Adding a villa means adding both an info branch and a book branch.

### Web / PWA specifics

- `app/+html.tsx` is the web HTML shell. It injects the manifest, theme color, and registers `/sw.js`. Static assets under `public/` (manifest, service worker, icons) are copied to `dist/` by the Expo web export.
- `vercel.json` rewrites all paths to `/index.html` (SPA fallback).
- Don't commit anything to `dist/` — it's the build output.

### Other

- `.env` uses `EXPO_PUBLIC_*` vars only (must be public-prefixed to be readable in the client at build time). Replace the Google client-ID placeholders before native builds.
- `app-example/` is a frozen snapshot left by `reset-project`. Don't edit — it's not part of the running app.
- The real entry is `expo-router/entry` (set in `package.json#main`). Do **not** add an `app.tsx` at the project root — a stale one from a different starter previously broke type-checking by importing screens that don't exist.
