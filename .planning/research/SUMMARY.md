# Project Research Summary

**Project:** Roast Timer
**Domain:** Private single-user PWA access for a Next.js app
**Researched:** 2026-02-12
**Confidence:** MEDIUM

## Executive Summary

This project is a private, single-user PWA experience layered onto an existing Next.js app. The research points to a lightweight local privacy gate (passcode + auto-lock) paired with standard PWA installability (manifest, icons, service worker) as the right fit for a personal tool. Experts build this by keeping the gate client-first but explicit about the threat model, and by using a minimal, well-scoped service worker so the app installs and launches offline without caching protected content incorrectly.

Recommended approach: implement a passcode gate backed by a Dexie auth table and Web Crypto-derived verifier, keep unlock state in memory/session only, then add PWA installability with `app/manifest.ts` and Serwist for service worker management. Avoid heavy auth frameworks or cloud sync; they conflict with the personal, local-first goal. Use a minimal install UX that works on iOS (instructions) and avoids over-reliance on `beforeinstallprompt`.

Key risks center on privacy and caching: a UI-only gate can mislead users about security, and a service worker can unintentionally cache protected content. Mitigate by clarifying the privacy model, keeping data behind gate checks, and using cache strategies that avoid precaching protected routes while invalidating caches on passcode changes.

## Key Findings

### Recommended Stack

The stack is a lean Next.js App Router implementation with built-in manifest support, edge middleware for optional route gating, and Serwist for service worker generation. This combination delivers installability and offline launch without adopting heavy auth providers or outdated PWA tooling.

**Core technologies:**
- Next.js App Router manifest (16.1.6): installable PWA metadata via `app/manifest.ts` — built-in support, no extra packages.
- Next.js Proxy (middleware) (16.1.6): edge passcode gate using cookies/redirects — blocks routes before render when needed.
- `@serwist/next` (9.5.5): service worker generation and caching — maintained Next.js PWA integration.

### Expected Features

The MVP is a privacy-gated installable PWA with offline launch. Users expect installability, offline start, and a passcode gate with auto-lock; these are the table stakes. Competitive additions include client-side encryption and encrypted export/import, but those should follow validation.

**Must have (table stakes):**
- Installable PWA shell (manifest, icons, standalone display) — required for add-to-home.
- Service worker caching for offline launch — required for offline startup.
- Passcode gate + auto-lock — required for basic privacy expectations.

**Should have (competitive):**
- Client-side encryption for stored data — stronger privacy posture.
- Encrypted export/import — safe migration without accounts.

**Defer (v2+):**
- Passcode rotation + rekey — high complexity.
- Optional biometric unlock shortcut — platform-specific complexity.

### Architecture Approach

The architecture centers on an access gate layer that wraps the app shell, backed by a Dexie auth store and Web Crypto utilities, with PWA registration and minimal service worker caching. The design keeps unlock state ephemeral (memory/session) while persisting only a derived verifier and salt in IndexedDB.

**Major components:**
1. Access Gate UI — passcode setup, unlock, lock, error states.
2. Access Control Service — gate state, verification, session unlock/lock.
3. Crypto Utilities — PBKDF2 + digest verifier generation.
4. PWA Registration + Install UI — manifest linking, SW registration, install prompts.
5. Dexie Auth Store — passcode verifier/salt persistence.

### Critical Pitfalls

1. **UI-only passcode gate** — define the threat model and avoid exposing protected data without checks.
2. **Service worker caching protected content** — avoid precaching protected routes, clear caches on passcode change.
3. **Missing manifest/HTTPS requirements** — ensure required manifest members and HTTPS to allow installability.
4. **iOS install UX failure** — provide add-to-home instructions, do not rely solely on `beforeinstallprompt`.
5. **Service worker scope errors** — register from origin root and verify control scope in DevTools.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Access Gate Foundation
**Rationale:** Gate and data model must exist before any protected routes or UX can be trusted.
**Delivers:** Dexie auth schema, Web Crypto verifier, passcode setup/unlock UI, session-based lock/auto-lock.
**Addresses:** Passcode gate + auto-lock (table stakes).
**Avoids:** UI-only passcode gate by aligning data access with gate state and documenting the privacy model.

### Phase 2: PWA Installability + Offline Launch
**Rationale:** Installability and offline launch are the remaining P1 features and depend on manifest + service worker wiring.
**Delivers:** Manifest + icons, service worker registration/caching, HTTPS validation, install UX with iOS guidance.
**Uses:** Next.js manifest support, `@serwist/next`, minimal SW patterns.
**Avoids:** Missing manifest requirements, SW scope errors, iOS install UX failure.

### Phase 3: Privacy Hardening + Migration
**Rationale:** Encryption and export/import improve privacy and portability but depend on stable gate + storage.
**Delivers:** Client-side encryption, encrypted export/import, cache invalidation on passcode changes.
**Addresses:** Differentiators and cache-related pitfalls.

### Phase Ordering Rationale

- Gate and auth data must be present before PWA caching to prevent protected data from being cached incorrectly.
- Installability depends on manifest + service worker, which are simpler once access control is stable.
- Encryption/export features depend on stable local storage and passcode workflows.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3:** Client-side encryption and export/import flows require careful crypto and UX validation.

Phases with standard patterns (skip research-phase):
- **Phase 1:** Passcode gate with local verifier and session unlock is a well-known pattern.
- **Phase 2:** PWA installability and basic offline caching are well-documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Official Next.js/Serwist docs are strong; version compatibility still needs validation in project context. |
| Features | MEDIUM | Derived from PWA best practices and local-first expectations; needs user validation. |
| Architecture | MEDIUM | Standard patterns are clear, but implementation details depend on existing app structure. |
| Pitfalls | MEDIUM | Mostly grounded in official guidance; threat-modeling is partly inferred. |

**Overall confidence:** MEDIUM

### Gaps to Address

- Threat model clarity: confirm whether the gate is a privacy screen or must block data endpoints; update UX accordingly.
- Service worker cache policy: define exact caching rules for protected routes and passcode-change invalidation.
- iOS install guidance: validate the final UX on Safari/iOS devices.

## Sources

### Primary (HIGH confidence)
- https://nextjs.org/docs/app/building-your-application/deploying/progressive-web-apps — manifest support, installability
- https://nextjs.org/docs/app/building-your-application/routing/middleware — gate enforcement with middleware
- https://serwist.pages.dev/docs/next — Serwist Next.js integration
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps — PWA best practices
- https://developer.mozilla.org/en-US/docs/Web/Manifest — manifest requirements
- https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API — SW lifecycle and HTTPS requirements
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API — cryptography primitives

### Secondary (MEDIUM confidence)
- https://www.npmjs.com/package/@serwist/next — version recency
- https://www.npmjs.com/package/serwist — version recency
- https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html — passcode handling guidance

### Tertiary (LOW confidence)
- Passcode threat model notes inferred from local-only privacy patterns; validate with user expectations.

---
*Research completed: 2026-02-12*
*Ready for roadmap: yes*
