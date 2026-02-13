# Phase 05: PWA Install + Offline Shell - Research

**Researched:** 2026-02-13
**Domain:** PWA installability, service worker offline shell, iOS Add to Home Screen guidance
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
## Implementation Decisions

### Install experience
- Passive install only; no in-app install prompt or button
- App name: "Roasted"
- App icon should match existing app style and show the full name
- Installed app should launch to the inventory screen

### Claude's Discretion
- Exact placement of the install-related guidance entry point
- Microcopy and layout details for install-related UI (within existing style)

### Deferred Ideas (OUT OF SCOPE)
## Deferred Ideas

None — discussion stayed within phase scope
</user_constraints>

## Summary

This phase is standard PWA enablement for a Next.js 16 app: add a web app manifest that sets name, icons, display, scope, and a start URL that opens the inventory route, then register a service worker that caches an app shell and serves it offline. Installability requires HTTPS (or localhost) and a manifest with required fields and icon sizes. The service worker should cache core static assets during install and provide a cache-first response for shell/navigation requests, with a defined offline fallback.

iOS install is still centered on Add to Home Screen, so you need Apple meta tags and touch icons in addition to the manifest. The in-app guidance is informational only (passive install), so avoid `beforeinstallprompt` flows and focus on a clear instructions entry point. Use platform APIs (manifest, service worker, Cache API) rather than third-party PWA plugins unless a later phase expands scope.

**Primary recommendation:** Use Next.js `app/manifest.ts` to define the install metadata (name, icons, start_url `/inventory`, display `standalone`) and a root-level service worker in `public/sw.js` that precaches the app shell and serves it for offline navigation, plus Apple touch icons and meta tags for iOS Add to Home Screen guidance.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App router + metadata routes | Built-in manifest route support via `app/manifest.(ts|js)` (official Next docs) |
| Web App Manifest | Spec | Install metadata | Required for installability (MDN) |
| Service Worker API | Spec | Offline control | Standard offline mechanism (MDN) |
| Cache API | Spec | Asset caching | Standard service worker cache store (MDN) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Apple iOS web app meta tags | Spec (Apple) | iOS Add to Home Screen behavior | Required for iOS standalone and icon/title control |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom service worker | `next-pwa` plugin | Adds build-time precache automation but increases dependency surface and config; not required for a basic app shell |

**Installation:**
```bash
# no additional packages required
```

## Architecture Patterns

### Recommended Project Structure
```
src/app/
├── manifest.ts          # Web app manifest (Next metadata route)
├── layout.tsx           # Head metadata + iOS tags
├── inventory/page.tsx   # Install start_url target
└── offline/page.tsx     # Optional offline fallback shell
public/
├── sw.js                # Service worker script
└── icons/               # PWA + Apple touch icons
```

### Pattern 1: Next.js manifest route
**What:** Provide `app/manifest.ts` so Next serves `/manifest.webmanifest` and includes the manifest in the app.
**When to use:** Always, to meet installability requirements and set name/icon/start URL.
**Example:**
```ts
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Roasted",
    short_name: "Roasted",
    start_url: "/inventory",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
```

### Pattern 2: Service worker registration
**What:** Register a service worker from client code only when supported.
**When to use:** App bootstrap or a small client-only component in the app shell.
**Example:**
```ts
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js", { scope: "/" });
}
```

### Pattern 3: Precache app shell on install
**What:** Cache static shell assets during the `install` event and keep activation clean.
**When to use:** Always for offline app-shell support.
**Example:**
```js
// Source: https://web.dev/articles/offline-cookbook
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("roasted-shell-v1").then((cache) =>
      cache.addAll([
        "/",
        "/inventory",
        "/offline",
      ]),
    ),
  );
});
```

### Anti-Patterns to Avoid
- **Install prompt UI:** No `beforeinstallprompt` handling or install button (locked decision).
- **Caching non-GET or API writes:** The Cache API is for GET responses; don’t cache mutating requests.
- **Unscoped service worker:** A worker in a subfolder limits scope; keep `sw.js` at `/` or set `Service-Worker-Allowed`.

## Don’t Hand-Roll

| Problem | Don’t Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Install prompts | Custom install UI | Browser install UI only | Passive install is required and iOS doesn’t support `beforeinstallprompt` |
| Offline storage in SW | localStorage or ad-hoc caches | Cache API | Cache API is async, allowed in SW, and designed for offline assets |
| Icon generation | Manual size-by-size export | PWA icon generator tools | Multiple platform sizes and maskable icons are error-prone to craft manually |

**Key insight:** The platform already provides install and offline primitives; custom flows introduce inconsistent behavior and violate the “passive install only” requirement.

## Common Pitfalls

### Pitfall 1: Missing installability requirements
**What goes wrong:** App isn’t promoted for install or shows wrong name/icon.
**Why it happens:** Manifest missing required fields or icon sizes (192/512), or served without HTTPS.
**How to avoid:** Ensure `name`/`short_name`, `start_url`, `display`, and 192/512 icons are present and served over HTTPS/localhost.
**Warning signs:** Chrome install badge never appears; Lighthouse PWA audit fails.

### Pitfall 2: Service worker scope mismatch
**What goes wrong:** Offline shell never activates for navigation.
**Why it happens:** `sw.js` is served from a subpath, limiting scope.
**How to avoid:** Host `sw.js` at the site root or set `Service-Worker-Allowed` if you must scope wider.
**Warning signs:** `navigator.serviceWorker.controller` is null after reload.

### Pitfall 3: iOS Add to Home Screen missing metadata
**What goes wrong:** iOS home screen icon or title looks wrong, standalone mode not honored.
**Why it happens:** Missing `apple-touch-icon`, `apple-mobile-web-app-title`, or `apple-mobile-web-app-capable` meta tags.
**How to avoid:** Add Apple meta tags and touch icon links in the document head.
**Warning signs:** Icon uses a screenshot or the title truncates unexpectedly.

## Code Examples

Verified patterns from official sources:

### Basic manifest reference and required fields
```json
// Source: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
{
  "name": "My PWA",
  "icons": [
    { "src": "icons/512.png", "type": "image/png", "sizes": "512x512" }
  ],
  "start_url": "/",
  "display": "standalone"
}
```

### Apple iOS standalone meta tags
```html
<!-- Source: https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html -->
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Roasted">
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| AppCache | Service Worker + Cache API | Service Worker spec adoption | Granular caching control and reliable offline behavior |

**Deprecated/outdated:**
- AppCache: replaced by Service Worker + Cache API (MDN notes AppCache is obsolete).

## Open Questions

1. **Which routes/assets define the offline shell?**
   - What we know: Offline shell must launch and show the inventory screen when offline.
   - What’s unclear: Exact list of assets to precache (HTML route, CSS, JS bundles, fonts).
   - Recommendation: Define a minimal offline shell (inventory layout + core bundles) and validate in offline mode.

## Sources

### Primary (HIGH confidence)
- https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest - Next.js manifest route
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable - installability requirements
- https://developer.mozilla.org/en-US/docs/Web/Manifest - manifest members and deployment
- https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API - service worker lifecycle
- https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers - registration and caching patterns
- https://developer.mozilla.org/en-US/docs/Web/API/Cache - Cache API behavior
- https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html - iOS web app meta tags and icons

### Secondary (MEDIUM confidence)
- https://web.dev/articles/offline-cookbook - caching patterns and offline strategies

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - confirmed by Next.js and MDN docs
- Architecture: MEDIUM - service worker patterns are standard but need adaptation to this app’s routes
- Pitfalls: MEDIUM - based on MDN and Apple docs, but app-specific verification needed

**Research date:** 2026-02-13
**Valid until:** 2026-03-15
