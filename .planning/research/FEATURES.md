# Feature Research

**Domain:** Private, single-user PWA access for a personal web app
**Researched:** 2026-02-12
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Installable PWA shell (manifest, icons, standalone display) | PWA users expect add-to-home and app-like launch | MEDIUM | Requires Web App Manifest, icons, start URL, and standalone display settings. | 
| Service worker caching for offline launch | PWAs are expected to load without network | MEDIUM | Cache app shell and critical routes; keep cache versioning predictable. |
| Secure context (HTTPS) | PWA + service worker require secure contexts | LOW | Must run on HTTPS (localhost allowed for dev). |
| Passcode gate on launch | Private personal apps must keep data behind a lock | MEDIUM | Local passcode screen before entering app; store derived verifier locally. |
| Auto-lock on background/idle | Users expect the app to relock when leaving | LOW | Lock on `visibilitychange`/`blur` and inactivity timeout. |
| Local-first storage for private data | PWA data must persist offline | LOW | Store app data in IndexedDB (Dexie already used). |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Client-side encryption for stored data | Strong privacy posture for sensitive logs | HIGH | Use Web Crypto to derive a key from passcode and encrypt IndexedDB payloads. |
| Optional “private mode” networking toggle | Ensures no outbound calls while locked or offline | MEDIUM | Block sync/analytics when locked; align with personal privacy expectations. |
| Secure passcode change + data rekey | Lets users rotate passcode without data loss | HIGH | Requires re-encrypting data with new key. |
| Encrypted export/backup file | Allows safe device migration without server accounts | MEDIUM | Export encrypted JSON/zip; import requires passcode. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full account system + password reset emails | Feels “properly secure” | Adds backend complexity and weakens the “private local” story | Keep local passcode; add export/backup instead. |
| Always-on cloud sync | Convenience across devices | Adds data exposure and conflict handling | Optional manual export/import. |
| Biometric-only unlock with no fallback | Users want Face ID/Touch ID | Locks users out when OS biometrics change or fail | Offer biometrics only as an optional shortcut alongside passcode. |

## Feature Dependencies

```
Installable PWA Shell
    └──requires──> Web App Manifest + Icons
    └──requires──> Service Worker Registration

Offline Launch
    └──requires──> Service Worker Caching Strategy

Passcode Gate
    └──requires──> Local Credential Storage (verifier)
    └──requires──> Secure Context (HTTPS)

Client-side Encryption
    └──requires──> Web Crypto API
    └──requires──> IndexedDB Storage (Dexie)

Encrypted Export/Import
    └──requires──> Client-side Encryption
```

### Dependency Notes

- **Installable PWA shell requires manifest + service worker:** Installability depends on manifest metadata and service worker presence.
- **Passcode gate requires local credential storage:** Needs a stored verifier or derived key to validate unlock attempts.
- **Client-side encryption requires Web Crypto + IndexedDB:** Encryption key handling and data storage are tightly coupled.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] Installable PWA shell (manifest, icons, standalone) — enables home-screen install and app-like launch.
- [ ] Service worker caching for offline launch — ensures the app opens without network.
- [ ] Passcode gate + auto-lock — delivers basic privacy for a single-user app.

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Client-side encryption for stored data — improves privacy posture.
- [ ] Encrypted export/import — supports migration without accounts.

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Passcode rotation + rekey workflow — higher complexity, lower immediate impact.
- [ ] Optional biometric unlock shortcut — platform-specific testing and fallback requirements.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Installable PWA shell (manifest + icons) | HIGH | MEDIUM | P1 |
| Service worker caching for offline launch | HIGH | MEDIUM | P1 |
| Passcode gate + auto-lock | HIGH | MEDIUM | P1 |
| Client-side encryption for stored data | MEDIUM | HIGH | P2 |
| Encrypted export/import | MEDIUM | MEDIUM | P2 |
| Passcode rotation + rekey | LOW | HIGH | P3 |
| Optional biometric unlock shortcut | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Competitor A | Competitor B | Our Approach |
|---------|--------------|--------------|--------------|
| Installability + offline launch | Not assessed | Not assessed | Follow PWA best practices with manifest + service worker. |
| Local privacy gating | Not assessed | Not assessed | Passcode gate + auto-lock, optional encryption later. |

## Sources

- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps (PWA installability, offline, best practices)
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest (manifest requirements for installable PWAs)
- https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API (service worker offline caching)
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API (client-side cryptography primitives)

---
*Feature research for: private personal PWA access*
*Researched: 2026-02-12*
