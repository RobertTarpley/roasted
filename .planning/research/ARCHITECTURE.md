# Architecture Research

**Domain:** Private access gate + installable PWA for a single-user Next.js + Dexie app
**Researched:** 2026-02-12
**Confidence:** MEDIUM

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Presentation Layer                           │
├──────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌───────────────────┐  ┌──────────────────┐   │
│  │ Access Gate UI   │  │ Main App Shell    │  │ Install UI       │   │
│  └────────┬─────────┘  └────────┬──────────┘  └────────┬─────────┘   │
│           │                     │                     │              │
├───────────┴─────────────────────┴─────────────────────┴──────────────┤
│                         Client Application Layer                      │
├──────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ Access Control Service (passcode setup, verify, lock)           │  │
│  ├────────────────────────────────────────────────────────────────┤  │
│  │ Crypto Utilities (salt + PBKDF2, verify)                        │  │
│  ├────────────────────────────────────────────────────────────────┤  │
│  │ PWA Registration (manifest link + service worker registration)  │  │
│  └────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────┤
│                              Data Layer                               │
├──────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────┐ │
│  │ Dexie DB (auth)    │  │ Dexie DB (app data)│  │ CacheStorage   │ │
│  └────────────────────┘  └────────────────────┘  └────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Access Gate UI (NEW) | Setup passcode, unlock, lock, error states | Client-only screen rendered before main app |
| Access Control Service (NEW) | Decide gate state, verify passcode, manage session unlock | Hook + context provider with Dexie access |
| Crypto Utilities (NEW) | Derive key/hash from passcode, compare | Web Crypto `SubtleCrypto` PBKDF2 + digest |
| Install UI (NEW) | Show install hint or install button | Banner/modal tied to PWA readiness |
| PWA Registration (NEW) | Register service worker; link manifest | Client effect in root layout |
| Service Worker (NEW) | Cache app shell and assets | `public/sw.js` with CacheStorage |
| Dexie Auth Store (NEW) | Persist passcode salt/hash + metadata | `auth` table in IndexedDB |
| App Shell (MODIFIED) | Wrap routes with access guard | Root layout or route group guard |

## Recommended Project Structure

```
src/
├── app/                         # Next.js app routes + layouts
│   ├── (gate)/                  # Passcode setup/unlock routes
│   ├── (app)/                   # Existing app routes (protected)
│   └── layout.tsx               # Root layout; access + PWA providers
├── features/
│   ├── access/                  # Gate UI + hooks (NEW)
│   └── pwa/                     # Install UI + SW registration (NEW)
├── db/
│   ├── index.ts                 # Dexie instance (MODIFIED)
│   └── schema.ts                # Auth table + migrations (MODIFIED)
├── lib/
│   ├── crypto/                  # PBKDF2 + digest helpers (NEW)
│   └── session/                 # Session unlock helpers (NEW)
public/
├── manifest.webmanifest         # PWA manifest (NEW)
└── sw.js                        # Service worker (NEW)
```

### Structure Rationale

- **features/access:** Keeps passcode gate isolated and testable; integrates via a single access provider.
- **features/pwa:** Separates install UX and service worker concerns from app features.
- **db/schema.ts:** Auth store changes are explicit and migrated alongside existing Dexie schema.

## Architectural Patterns

### Pattern 1: Client-Only Passcode Gate with Persisted Verifier

**What:** Store a salted, derived verifier in IndexedDB; keep unlock state in memory/session storage only.
**When to use:** Single-user, local-first apps that need a privacy gate (not strong security).
**Trade-offs:** Protects casual access, but local data is still inspectable by a determined user.

**Example:**
```typescript
const verifier = await derivePasscodeVerifier(passcode, salt);
await authTable.put({ id: "local", salt, verifier, kdf: "PBKDF2" });
setSessionUnlocked(true);
```

### Pattern 2: Minimal Service Worker for App-Shell Caching

**What:** Register a service worker to cache static assets and app shell for offline startup.
**When to use:** PWA installability and offline access for a local-first app.
**Trade-offs:** Risk of stale assets if cache invalidation is too aggressive; keep it simple.

**Example:**
```typescript
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}
```

### Pattern 3: Install UX via Standard Manifest + Optional Prompt

**What:** Provide `manifest.webmanifest` and icons; optionally surface install UI using `beforeinstallprompt`.
**When to use:** If you need a custom install button, but note limited browser support.
**Trade-offs:** Custom prompt is non-standard and browser-dependent.

## Data Flow

### Request Flow

```
User opens app
    ↓
Access Provider → Auth Store (Dexie) → Gate Decision
    ↓                          ↓
Gate UI (unlock) ← Verify Passcode ← Crypto Utils
    ↓
App Shell renders
```

### State Management

```
Auth Store (Dexie)
  ↓ (read-once)
Access State (in-memory/session)
  ↓ (subscribe)
Gate UI / App Shell
```

### Key Data Flows

1. **Passcode setup:** User sets passcode → salt + PBKDF2 verifier created → auth record stored in Dexie → session unlocked.
2. **Unlock:** User enters passcode → verifier derived → compare to stored verifier → session unlocked (sessionStorage or in-memory).
3. **Lock:** User taps lock or app unloads → session flag cleared → gate shown on next load.
4. **PWA install:** Manifest + service worker registered → browser shows install UI; optional custom install button listens for `beforeinstallprompt` (non-standard).

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Local-only auth store + minimal service worker; no backend required. |
| 1k-100k users | If multi-user appears, move auth to server and add real sessions. |
| 100k+ users | Dedicated auth service; enforce server-side access control. |

### Scaling Priorities

1. **First bottleneck:** Stale service worker caches; add cache versioning and update flow.
2. **Second bottleneck:** Auth model if multi-user emerges; introduce server verification.

## Anti-Patterns

### Anti-Pattern 1: Storing unlocked state in localStorage

**What people do:** Persist an "unlocked" flag across browser restarts.
**Why it's wrong:** Defeats the privacy gate and exposes data after a restart.
**Do this instead:** Keep unlock state in memory or sessionStorage only.

### Anti-Pattern 2: Treating passcode gate as strong security

**What people do:** Market the gate as robust protection.
**Why it's wrong:** Client-only storage can be inspected; it is a privacy screen only.
**Do this instead:** Clearly position as a lightweight gate; use real auth if needed.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Web App Manifest | `<link rel="manifest">` in HTML head | Required for installability. |
| Service Worker | `navigator.serviceWorker.register()` | Requires HTTPS or localhost. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Root layout ↔ Access provider | Context + guard | Gate must run before app routes render. |
| Access provider ↔ Dexie auth store | Repository access | Reads verifier, writes setup data. |
| Access provider ↔ Crypto utilities | Direct function calls | Keep cryptography isolated. |
| App shell ↔ PWA registration | Hook/effect | Register once on client. |

## Build Order (Dependency-Aware)

1. **Dexie auth schema + migration** → required before any gate logic.
2. **Crypto utilities (PBKDF2 + digest)** → needed for setup + unlock.
3. **Access provider + gate routes** → blocks app until unlocked.
4. **Session unlock handling** (memory/sessionStorage) → avoid persistent unlocks.
5. **Manifest + icons** → prerequisite for installability.
6. **Service worker registration + cache** → enables offline PWA.
7. **Optional install UI** → only after manifest + SW in place.

## Sources

- https://developer.mozilla.org/en-US/docs/Web/Manifest (web app manifest and installability requirements)
- https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API (service worker lifecycle, secure contexts)
- https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto (Web Crypto primitives and key handling)
- https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent (custom install prompt is non-standard)

---
*Architecture research for: private passcode gate + PWA install for Roast Timer*
*Researched: 2026-02-12*
