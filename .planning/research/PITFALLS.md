# Pitfalls Research

**Domain:** Private access passcode gate + installable PWA for a personal Next.js app
**Researched:** 2026-02-12
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: Passcode gate is only UI-deep (false sense of privacy)

**What goes wrong:**
Protected data is still retrievable because the passcode check only hides UI routes, while data endpoints, static JSON, or cached assets remain accessible.

**Why it happens:**
The gate is implemented as a client-only check (localStorage/session state) without server-side enforcement or cache controls, which is easy to bypass in devtools.

**How to avoid:**
Define the threat model explicitly (casual privacy vs. real security). If security matters, enforce the gate in server middleware or route handlers and avoid shipping protected data without verification. If it is only a privacy screen, say so in the UX and documentation.

**Warning signs:**
Data endpoints respond without a passcode, or viewing the app source reveals protected content even when "locked."

**Phase to address:**
Phase 1 - Passcode gate design and threat model.

---

### Pitfall 2: Service worker caches protected pages/data

**What goes wrong:**
After install, the service worker serves protected content from cache even when the app is "locked," or when the passcode changes.

**Why it happens:**
Offline-first caching strategies store HTML/data responses without considering auth state; cache persists until explicitly cleared.

**How to avoid:**
Do not precache protected routes. Use runtime caching keyed by auth state, and clear relevant caches when the passcode changes or on logout. Prefer network-first for protected content.

**Warning signs:**
Lock screen appears but navigating back shows content; switching passcode does not invalidate cached pages.

**Phase to address:**
Phase 3 - Service worker and cache policy hardening.

---

### Pitfall 3: App not installable because manifest/HTTPS requirements are missed

**What goes wrong:**
The browser never shows install UI; Lighthouse flags missing required manifest members or HTTPS.

**Why it happens:**
Manifest lacks required fields or required icons (192x192, 512x512), or the app is not served over HTTPS.

**How to avoid:**
Ship a valid web app manifest linked on every page, include required members (name/short_name, icons, start_url, display), and serve over HTTPS.

**Warning signs:**
Install prompt never fires on Chromium browsers; DevTools application panel shows manifest errors.

**Phase to address:**
Phase 2 - PWA manifest + HTTPS validation.

---

### Pitfall 4: Custom install UX breaks on iOS

**What goes wrong:**
An "Install" button does nothing on iOS, leaving users stuck.

**Why it happens:**
`beforeinstallprompt` is not supported on iOS; install must be done via Share sheet instructions.

**How to avoid:**
Detect iOS and show explicit "Add to Home Screen" instructions; only show the custom install button where the event is supported.

**Warning signs:**
iOS users report no install prompt even though Android/desktop works.

**Phase to address:**
Phase 2 - PWA install UX.

---

### Pitfall 5: Service worker fails to register or controls the wrong scope

**What goes wrong:**
Offline and installability features silently fail because the service worker does not register or only controls a subpath.

**Why it happens:**
The service worker file path is incorrect, scope is too narrow, or the app is not running on HTTPS.

**How to avoid:**
Register the service worker from the origin root, verify the scope, and confirm HTTPS in production. Keep the worker path and scope aligned.

**Warning signs:**
DevTools shows "No service worker" for the app scope; offline mode fails to load any assets.

**Phase to address:**
Phase 2 - Service worker wiring.

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Store passcode in localStorage/plain text | Quick implementation | Passcode easily recovered; no real privacy | Never |
| Gate only the UI routes (no data protection) | Fast passcode screen | Data still accessible via network/cache | Only if explicitly "casual privacy" |
| Precache everything for offline | Simpler SW config | Stale or protected content served offline | Never for protected routes |
| One manifest file linked only on the homepage | Less wiring | Non-home routes not installable | Never |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Web app manifest | Manifest requires credentials but link lacks `crossorigin="use-credentials"` | Add `crossorigin` when manifest needs credentials |
| PWA install prompt | Assuming `beforeinstallprompt` works on iOS | Use platform-specific install guidance |
| HTTPS hosting | Testing on `http://` or file URLs | Use HTTPS or `localhost` for PWA features |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Unbounded runtime caching | Cache grows without limit | Use cache versioning and eviction | 100+ sessions / months of use |
| Precache large media/assets | Install/update is slow | Only precache app shell | >50 MB assets |
| Network-first on all routes | Slow app start while offline | Use cache-first for static assets only | Intermittent connectivity |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Sending passcode over non-TLS | Passcode exposure | Enforce HTTPS for all auth-related pages |
| Weak passcode policy (very short) | Easy guessing | Require reasonable length or passphrase |
| No cache invalidation on passcode change | Old user can still access | Clear SW caches and reset auth state |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Passcode prompt on every refresh | Annoying friction | Allow "remember me" with session timeout |
| Install CTA shown when not eligible | Confusion and dead button | Only show CTA when installable or provide instructions |
| "Locked" state with no recovery path | User gets stuck | Provide passcode reset flow (even if local) |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Passcode gate:** Server or cache protection matches the privacy goal; not UI-only.
- [ ] **Manifest:** Required members + 192/512 icons + linked on all routes.
- [ ] **HTTPS:** Production deploy uses HTTPS; installability verified.
- [ ] **Service worker:** Protected routes are not precached; cache clears on passcode change.

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| UI-only passcode gate | MEDIUM | Add middleware/auth guard and move data fetch behind it |
| Cached protected content | MEDIUM | Bump cache version and clear old caches on activate |
| Missing installability | LOW | Fix manifest + icons; redeploy with HTTPS |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| UI-only passcode gate | Phase 1 | Data not accessible without passcode in network tab |
| Cached protected content | Phase 3 | Lock screen persists even with offline/cache tests |
| Missing manifest requirements | Phase 2 | DevTools shows no manifest errors |
| iOS install UX failure | Phase 2 | iOS users can follow instructions to install |
| Service worker scope errors | Phase 2 | SW controls full app scope in DevTools |

## Sources

- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable (installability requirements, HTTPS, required manifest members; HIGH confidence)
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest (manifest members and deployment details; HIGH confidence)
- https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers (service worker scope, caching, HTTPS requirement; HIGH confidence)
- https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html (password handling and TLS guidance; MEDIUM confidence)
- Passcode gate threat model notes based on local-app privacy patterns (LOW confidence)

---
*Pitfalls research for: private access passcode gate + installable PWA in Next.js*
*Researched: 2026-02-12*
