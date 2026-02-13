# Phase 4: Private Access Gate - Research

**Researched:** 2026-02-13
**Domain:** Passcode gate with session-only unlock in Next.js App Router
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
## Implementation Decisions

### Passcode entry UX
- Full-screen modal before any app UI is shown
- Single password field (not PIN keypad)
- Show app branding with a short line ("Private Roast Timer")
- Include a "show passcode" toggle

### Unlock persistence
- Unlock persists for the browser session only (until tab/window is closed)
- No manual lock action
- Re-locks on tab close (no inactivity timer)
- Unlock applies to all tabs in the same browser session

### Failure handling
- No lockout; unlimited retries
- Error message: "Incorrect passcode"
- Clear the passcode field after a failed attempt
- Allow paste into the passcode field

### Privacy notice
- Show on the passcode screen only

### Claude's Discretion
- Exact layout, spacing, and visual styling within existing design language
- Error state styling and animation

### Deferred Ideas (OUT OF SCOPE)
## Deferred Ideas

None — discussion stayed within phase scope
</user_constraints>

## Summary

For this phase, the standard Next.js 16.1.6 App Router approach is to enforce the gate at the proxy (formerly middleware) layer using a session cookie, and to validate the passcode via a server-only Route Handler that reads an env var. This satisfies "no app UI before unlock" (proxy redirect before any route renders), keeps the passcode secret on the server, and allows the unlock state to persist across tabs for the browser session by using a session cookie (no max-age/expires).

The passcode UI itself should be a dedicated gate route that renders a full-screen "modal" screen. The UI posts the passcode to an API Route Handler (POST), which compares against `process.env` and, on success, sets the session cookie. On failure, the UI clears the field and shows the required error message. No lock button is added; the session ends on browser close which clears the cookie.

**Primary recommendation:** Use a `proxy.ts` gate with a session cookie + `/api/access/unlock` Route Handler that compares to a server env var and sets the cookie on success.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router (proxy + route handlers) | 16.1.6 | Gate all routes before render; server-side passcode check | Built-in server boundary for auth-like checks and redirects. |
| React | 19.2.4 | Gate screen UI | Existing app framework. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next/headers` cookies API | 16.1.6 | Read/write cookies in Route Handlers | Set session cookie after unlock. |
| `NextRequest`/`NextResponse` | 16.1.6 | Read cookies in proxy, redirect when locked | Enforce gate before any app route renders. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Proxy gate + server env validation | Client-only gate (localStorage/sessionStorage) | Violates ACCESS-01/ACCESS-02 and is trivially bypassed. |

**Installation:**
```bash
# No new packages required for the gate
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (gate)/access/page.tsx     # Passcode gate screen
│   ├── api/access/unlock/route.ts # Passcode verification
│   └── (app)/...                  # Existing app routes
proxy.ts                           # Gate redirect before render
```

### Pattern 1: Proxy gate with session cookie
**What:** Use `proxy.ts` to redirect all app routes to the gate when the session cookie is missing.
**When to use:** You must block all app UI until unlocked (ACCESS-01).
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/building-your-application/routing/middleware
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const unlocked = request.cookies.get("rt_unlocked");
  const isGate = request.nextUrl.pathname.startsWith("/access");

  if (!unlocked && !isGate) {
    return NextResponse.redirect(new URL("/access", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
```

### Pattern 2: Server-side passcode validation + session cookie
**What:** Route Handler compares submitted passcode to a server env var and sets a session cookie on success.
**When to use:** Passcode must not be visible in client bundles (ACCESS-02).
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { passcode } = await request.json();
  const expected = process.env.PRIVATE_PASSCODE;

  if (!expected || passcode !== expected) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("rt_unlocked", "1", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  return Response.json({ ok: true });
}
```

### Anti-Patterns to Avoid
- **Client-only gate:** UI-only checks are bypassable and violate ACCESS-01.
- **Persistent unlock in localStorage:** Breaks session-only unlock and defeats the gate.
- **Exposing passcode with `NEXT_PUBLIC_*`:** Leaks the secret to the client bundle.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Route blocking before render | Custom client router guard | Next.js proxy file | Proxy executes before routes render and can redirect consistently. |
| Session persistence | localStorage unlock flag | Session cookie (no expiry) | Works across tabs, clears on browser close. |

**Key insight:** Built-in proxy + route handlers provide a server boundary without adding an auth stack, which aligns with the phase scope and requirements.

## Common Pitfalls

### Pitfall 1: Proxy matcher blocks the gate or API
**What goes wrong:** Users get redirect loops or unlock API is blocked.
**Why it happens:** Matcher excludes too much or too little.
**How to avoid:** Explicitly exclude `/access`, `/api`, and `/_next/*` in matcher.
**Warning signs:** Gate page never loads, API returns 307 to `/access`.

### Pitfall 2: Unlock not shared across tabs
**What goes wrong:** Each tab requires a new unlock.
**Why it happens:** Unlock state stored in `sessionStorage` (per-tab).
**How to avoid:** Use a session cookie without `maxAge`/`expires`.
**Warning signs:** Opening a second tab shows gate despite first tab unlocked.

### Pitfall 3: Passcode leaks to client
**What goes wrong:** Passcode appears in client bundle or logs.
**Why it happens:** Using `NEXT_PUBLIC_` env var or embedding value in UI.
**How to avoid:** Only read passcode in Route Handler on the server.
**Warning signs:** Passcode string visible in JS bundle or network responses.

## Code Examples

Verified patterns from official sources:

### Proxy cookie check with redirect
```typescript
// Source: https://nextjs.org/docs/app/building-your-application/routing/middleware
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const unlocked = request.cookies.get("rt_unlocked");
  if (!unlocked) {
    return NextResponse.redirect(new URL("/access", request.url));
  }
  return NextResponse.next();
}
```

### Set cookie in a Route Handler
```typescript
// Source: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set("rt_unlocked", "1", { path: "/" });
  return Response.json({ ok: true });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` file | `proxy.ts` file | Next.js 16.0.0 | Gate should be implemented in `proxy.ts`, not `middleware.ts`. |

**Deprecated/outdated:**
- `middleware.ts`: Deprecated in favor of `proxy.ts` in Next.js 16.x.

## Open Questions

1. **What env var name should the passcode use?**
   - What we know: Passcode must be server-side only (ACCESS-02).
   - What's unclear: Naming convention for this repo.
   - Recommendation: Default to `PRIVATE_PASSCODE` unless the project already has a naming standard.

## Sources

### Primary (HIGH confidence)
- https://nextjs.org/docs/app/building-your-application/routing/middleware - proxy file, matcher, and cookies
- https://nextjs.org/docs/app/building-your-application/routing/route-handlers - route handlers and cookies API usage

### Secondary (MEDIUM confidence)
- None

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Based on current Next.js 16.1.6 docs.
- Architecture: MEDIUM - Pattern is standard but needs repo-specific path alignment.
- Pitfalls: MEDIUM - Derived from common Next.js gate implementations.

**Research date:** 2026-02-13
**Valid until:** 2026-03-15
