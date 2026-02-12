# Stack Research

**Domain:** Mobile-friendly roast timer + green coffee inventory web app (single-user, iPhone-first)
**Researched:** 2026-02-12
**Confidence:** MEDIUM

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.1.6 | Web app framework (routing, bundling, deployment) | Standard 2025 React web stack with a mature App Router and strong deployment tooling; fits a single-user, mobile-first app without needing a backend. (Confidence: HIGH) |
| React | 19.2.4 | UI rendering and component model | Default UI layer for modern web apps and the foundation for Next.js; strongest ecosystem for mobile-friendly web UI. (Confidence: HIGH) |
| TypeScript | 5.9.3 | Type safety and maintainability | Prevents data-shape bugs in roast/weight calculations and keeps inventory data consistent. (Confidence: HIGH) |
| Tailwind CSS | 4.1.18 | Styling system for mobile UI | Fast iteration for touch-first layouts and consistent spacing/typography without custom CSS sprawl. (Confidence: HIGH) |
| Dexie (IndexedDB) | 4.3.0 | Local-first persistence | Reliable offline storage for roasts and inventory without server dependencies. (Confidence: HIGH) |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zustand | 5.0.11 | App state store | Use for cross-component timer state, roast phase transitions, and UI state that shouldn't live in local component state. (Confidence: HIGH) |
| Zod | 4.3.6 | Data validation | Use for validating roast entries, weights, and inventory inputs before persistence. (Confidence: HIGH) |
| date-fns | 4.1.0 | Date/time utilities | Use for elapsed time formatting and phase duration calculations. (Confidence: HIGH) |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint | Linting | Use Next.js recommended config to keep rules aligned with framework defaults. |
| Prettier | Formatting | Keeps formatting consistent across contributors and UI code. |

## Installation

```bash
# Core
npm install next@16.1.6 react@19.2.4 react-dom@19.2.4 tailwindcss@4.1.18 dexie@4.3.0

# Supporting
npm install zustand@5.0.11 zod@4.3.6 date-fns@4.1.0

# Dev dependencies
npm install -D typescript@5.9.3 eslint prettier
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js | Vite + React | Use for a pure SPA with static hosting and zero SSR needs; simpler build if you do not want Next.js routing or server features. |
| Dexie (IndexedDB) | SQLite (OPFS/wasm) | Use if you need relational queries, huge datasets, or complex reporting beyond IndexedDB’s strengths. |
| Zustand | Redux Toolkit | Use if you need advanced debugging, strict state conventions, or large team workflows. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| localStorage for core data | Blocking API, small quotas, and no indexing make it unreliable for inventory/roast history. | Dexie (IndexedDB) |
| Firebase/Firestore for single-user local-first MVP | Adds auth/billing complexity and offline behavior is harder to reason about for a single-user app. | Dexie now; add a sync backend later if multi-device sync is required |
| Cordova/Ionic wrappers | Extra native build surface and UI constraints without clear value for a web-first timer/inventory tool. | Next.js mobile web app (optionally PWA) |

## Stack Patterns by Variant

**If you want a zero-backend, offline-first MVP:**
- Use the stack above with Dexie as the source of truth
- Because local-first removes auth/sync complexity and matches the single-user requirement

**If you later need multi-device sync:**
- Keep Dexie as a client cache and add a hosted Postgres + auth backend (e.g., Supabase)
- Because syncing inventory/roast history requires conflict resolution and user identity

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| next@16.1.6 | react@19.2.4, react-dom@19.2.4 | Verify peer dependency warnings on install and align versions with Next.js release notes. |
| tailwindcss@4.1.18 | @tailwindcss/postcss, postcss | Follow the Tailwind Next.js install guide for the PostCSS plugin setup. |

## Sources

- https://github.com/vercel/next.js/releases/tag/v16.1.6 — latest stable release
- https://github.com/facebook/react/releases/tag/v19.2.4 — latest stable release
- https://github.com/microsoft/TypeScript/releases/tag/v5.9.3 — latest stable release
- https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.1.18 — latest stable release
- https://tailwindcss.com/docs/installation/framework-guides/nextjs — Tailwind + Next.js installation steps
- https://github.com/dexie/Dexie.js/releases/tag/v4.3.0 — latest stable release
- https://github.com/pmndrs/zustand/releases/tag/v5.0.11 — latest stable release
- https://github.com/colinhacks/zod/releases/tag/v4.3.6 — latest stable release
- https://github.com/date-fns/date-fns/releases/tag/v4.1.0 — latest stable release

---
*Stack research for: Mobile-friendly roast timer + inventory app*
*Researched: 2026-02-12*
