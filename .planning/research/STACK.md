# Stack Research

**Domain:** Private single-user PWA access in a Next.js app
**Researched:** 2026-02-12
**Confidence:** MEDIUM

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js App Router manifest (built-in) | 16.1.6 | Installable PWA metadata via `app/manifest.ts` | Next.js supports the web app manifest file convention directly, so you can add installability without extra packages. |
| Next.js Proxy (middleware renamed) | 16.1.6 | Passcode gate at the edge using cookies and redirects | Lets you block app routes until an unlock cookie is present, without adding an auth framework. |
| @serwist/next | 9.5.5 | Service worker generation and caching for offline-capable PWA | Actively maintained Next.js PWA integration for service workers and caching strategies. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| serwist | 9.5.5 | Service worker runtime APIs and caching strategies | Use when you need custom caching strategies beyond @serwist/next defaults. |
| Web Crypto API (built-in) | Baseline (2015+) | Passcode hashing/key derivation in the browser | Use to store a hashed passcode (not plaintext) for a local-only gate. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Lighthouse (Chrome DevTools) | Validate installability and PWA checks | Run after adding manifest and service worker to confirm install criteria. |

## Installation

```bash
# Core
npm install @serwist/next serwist

# Supporting
# (none)

# Dev dependencies
# (none)
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| @serwist/next | Manual service worker (`public/sw.js`) | Use if you want full control and are willing to maintain caching logic yourself. |
| @serwist/next | next-pwa | Use only if you are already on next-pwa and cannot migrate; it is not actively updated. |
| Proxy-based passcode gate | Client-only gate (no proxy) | Use if you only need a soft privacy screen and want zero server involvement. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| next-pwa | Last published years ago; risk of incompatibility with recent Next.js versions | @serwist/next |
| Full auth providers (NextAuth/Auth.js) | Overkill for single-user private access; adds DB/session complexity | Proxy + local passcode hash stored in Dexie |

## Stack Patterns by Variant

**If you need a simple privacy screen (single device, offline OK):**
- Use a client-only passcode gate backed by Dexie + Web Crypto API
- Because the goal is “keep casual access out,” not enforce real authentication

**If you want route-level blocking (protects deep links):**
- Use Next.js Proxy with a cookie check + unlock route
- Because Proxy runs before routes are rendered and can block access uniformly

**If you only need installability (not offline):**
- Use manifest + icons only, skip service worker tooling
- Because install prompts do not require offline caching

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| @serwist/next@9.5.5 | Next.js 16.x | Verify Turbopack vs webpack mode; @serwist/next has specific guidance for each. |

## Sources

- https://nextjs.org/docs/app/building-your-application/deploying/progressive-web-apps — Next.js PWA manifest support, installability, and Serwist mention
- https://nextjs.org/docs/app/building-your-application/routing/middleware — Proxy (middleware) for route gating and cookies
- https://serwist.pages.dev/docs/next — @serwist/next integration docs
- https://www.npmjs.com/package/@serwist/next — current version and release recency
- https://www.npmjs.com/package/serwist — current version and release recency
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API — Web Crypto API for passcode hashing (secure context)

---
*Stack research for: Private single-user PWA access in Next.js*
*Researched: 2026-02-12*
