---
phase: 05-pwa-install-offline-shell
plan: 01
subsystem: infra
tags: [pwa, manifest, service-worker, offline, ios]

# Dependency graph
requires:
  - phase: 04-private-access-gate
    provides: passcode-gated app shell
provides:
  - PWA manifest metadata with install icons
  - Service worker offline app shell
  - In-app iOS Add to Home Screen guidance
affects: [deployment, pwa, ios]

# Tech tracking
tech-stack:
  added: [pwa-asset-generator (npx)]
  patterns: [cache-first navigation fallback, passive install guidance]

key-files:
  created:
    - src/app/manifest.ts
    - public/icons/icon-192.png
    - public/icons/icon-512.png
    - public/icons/apple-touch-icon.png
    - public/sw.js
    - src/app/PwaServiceWorker.tsx
    - src/app/offline/page.tsx
    - src/app/install/page.tsx
  modified:
    - src/app/layout.tsx
    - src/features/inventory/InventoryScreen.tsx

key-decisions:
  - "Used npx pwa-asset-generator to keep icon generation dependency-free."
  - "Cache-first navigation to /inventory with /offline fallback for offline shell."

patterns-established:
  - "PWA shell caching uses a versioned cache name and navigation fallback."
  - "Install guidance is informational only, no prompt UI."

# Metrics
duration: 0 min
completed: 2026-02-13
---

# Phase 5 Plan 1: PWA Install + Offline Shell Summary

**PWA install metadata with branded icons, a cache-first offline shell, and in-app iOS install guidance.**

## Performance

- **Duration:** 0 min
- **Started:** 2026-02-13T17:05:30Z
- **Completed:** 2026-02-13T17:05:30Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments
- Added PWA manifest metadata and iOS install icons with the Roasted name and inventory start URL.
- Implemented a service worker that precaches the inventory shell and falls back to an offline page.
- Added an in-app iOS Add to Home Screen guidance page linked from inventory.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add PWA manifest, metadata, and icon assets** - `2b0e605` (feat)
2. **Task 2: Implement service worker offline shell + registration** - `e4bf474` (feat)
3. **Task 3: Add iOS Add to Home Screen guidance entry point** - `cd3cb36` (feat)

**Plan metadata:** `TBD` (docs: complete plan)

## Files Created/Modified
- `src/app/manifest.ts` - Defines PWA install metadata and icons.
- `src/app/layout.tsx` - Adds app metadata, iOS web app tags, and service worker registration.
- `public/icons/icon-192.png` - 192x192 PWA icon with full Roasted wordmark.
- `public/icons/icon-512.png` - 512x512 PWA icon with full Roasted wordmark.
- `public/icons/apple-touch-icon.png` - Apple touch icon for iOS installs.
- `public/sw.js` - Service worker precaching inventory shell and offline fallback.
- `src/app/PwaServiceWorker.tsx` - Client component registering the service worker.
- `src/app/offline/page.tsx` - Offline shell page.
- `src/app/install/page.tsx` - iOS Add to Home Screen guidance.
- `src/features/inventory/InventoryScreen.tsx` - Install guidance entry point in header nav.

## Decisions Made
- Used npx pwa-asset-generator to generate icons without adding dependencies.
- Implemented cache-first navigation fallback to cached inventory shell before offline page.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Switched icon generator package**
- **Found during:** Task 1 (Add PWA manifest, metadata, and icon assets)
- **Issue:** `@vscode/pwa-asset-generator` was not available in the npm registry.
- **Fix:** Used `pwa-asset-generator` via npx to generate the required icons.
- **Files modified:** public/icons/icon-192.png, public/icons/icon-512.png, public/icons/apple-touch-icon.png
- **Verification:** `npm run lint`
- **Committed in:** 2b0e605 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Icon generation remained automated and dependency-free. No scope creep.

## Issues Encountered
- Install page lint failed on unescaped quotes; copy was updated to remove the quotes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Install metadata, offline shell, and install guidance are in place and ready for verification.
- Manual Lighthouse or PWA checklist verification still needed.

---
*Phase: 05-pwa-install-offline-shell*
*Completed: 2026-02-13*

## Self-Check: PASSED
