# Phase 1: Roast Capture + Logs - Research

**Researched:** 2026-02-12
**Domain:** Roast timer capture, phase splits, and local roast log persistence
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
## Implementation Decisions

### Timer screen flow
- Full-screen timer layout with minimal chrome
- Bottom-center sticky Start/Stop button
- Timer shows total time plus all phase durations once they exist, with placeholders before
- Two-tier controls: Start/Stop primary, First Crack/Drop secondary

### Event markers
- Only two marker buttons: First Crack and Drop/Bean Dump
- Markers are not editable; delete and re-add only
- Marker list is compact under the timer, newest on top
- Tapping a marker jumps the display to show elapsed time at that marker

### Roast log capture
- Required fields to save: roast level + green weight + roasted weight
- Notes are optional and free-text only
- Roast level options: Light / Medium / Dark
- Green weight entered before roast; roasted weight entered after roast

### Save/confirmation
- Flow: Stop ends cooling → enter roasted weight → review screen with Save or Discard
- Discard requires a second confirmation; if confirmed, nothing is saved
- After save, user returns to timer (reset state)
- “Delete last roast” action available in history (undo pattern)

### Claude's Discretion
- Exact placement/visual design of marker list and placeholders
- Wording of confirmation prompts

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

## Summary

Phase 1 is a timer-centric capture flow that benefits from a simple event-log model: record start, first crack, drop, and stop events; derive phase splits from those timestamps; and persist a finalized roast log with weights and loss % in local storage. Planning should focus on a clear state machine, deterministic derivations, and data persistence that remains stable as later phases add history and inventory.

The existing stack research recommends a Next.js + React + TypeScript + Tailwind UI with Dexie (IndexedDB) as the local database and Zustand for cross-component state. That combination supports a local-first, single-user MVP and provides enough structure for later phases without overbuilding. For Phase 1, define a minimal roast session schema, a derived view model for the timer screen, and a save flow that enforces required fields and computes loss %.

**Primary recommendation:** Model the roast session as an event log with derived phase durations and persist completed sessions via Dexie, keeping UI state in Zustand.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App framework (routing, bundling, deployment) | Standard React web framework for mobile-first apps. (Confidence: MEDIUM) |
| React | 19.2.4 | UI rendering and component model | Required UI layer for Next.js; broad ecosystem. (Confidence: MEDIUM) |
| TypeScript | 5.9.3 | Type safety and maintainability | Prevents schema drift in roast data and calculations. (Confidence: MEDIUM) |
| Tailwind CSS | 4.1.18 | Styling system | Fast iteration for touch-first layouts. (Confidence: MEDIUM) |
| Dexie (IndexedDB) | 4.3.0 | Local-first persistence | IndexedDB wrapper for structured roast logs. (Confidence: HIGH) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zustand | 5.0.11 | App state store | Timer state, UI flow state, and transient session state. (Confidence: HIGH) |
| Zod | 4.3.6 | Data validation | Validate weights, roast level, and notes before save. (Confidence: MEDIUM) |
| date-fns | 4.1.0 | Date/time utilities | Format elapsed time and timestamps. (Confidence: MEDIUM) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Dexie (IndexedDB) | localStorage | localStorage is blocking and lacks indexing/queries; Dexie is safer for logs. |
| Zustand | React Context only | Context can cause broad re-renders; Zustand scales better for timer state. |

**Installation:**
```bash
npm install next@16.1.6 react@19.2.4 react-dom@19.2.4 tailwindcss@4.1.18 dexie@4.3.0 zustand@5.0.11 zod@4.3.6 date-fns@4.1.0
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/                 # App shell, routing, global providers
├── features/
│   ├── timer/           # Timer UI, markers, flow
│   └── roast-log/        # Review/save flow for completed roasts
├── domain/
│   └── roast-session/   # Event log, derivations, validation
├── data/                # Dexie schema, repositories
└── shared/              # UI components, formatting utilities
```

### Pattern 1: Roast Session Event Log + Derived Splits
**What:** Store events (start, first crack, drop, stop) and derive total/dev/cooling durations.
**When to use:** Any time phase markers and derived splits must be consistent and recomputable.
**Example:**
```typescript
type RoastEvent =
  | { type: "START"; t: number }
  | { type: "FIRST_CRACK"; t: number }
  | { type: "DROP"; t: number }
  | { type: "STOP"; t: number };

function derivePhaseTimes(events: RoastEvent[]) {
  const start = events.find(e => e.type === "START")?.t ?? null;
  const firstCrack = events.find(e => e.type === "FIRST_CRACK")?.t ?? null;
  const drop = events.find(e => e.type === "DROP")?.t ?? null;
  const stop = events.find(e => e.type === "STOP")?.t ?? null;

  return {
    total: start != null && stop != null ? stop - start : null,
    development: firstCrack != null && drop != null ? drop - firstCrack : null,
    cooling: drop != null && stop != null ? stop - drop : null,
  };
}
```

### Pattern 2: Persist Completed Sessions with Dexie
**What:** Use an IndexedDB table for roast sessions and store the event log plus derived fields.
**When to use:** When you need durable roast history for later phases.
**Example:**
```typescript
// Source: https://dexie.org/docs/Tutorial/Hello-World
const db = new Dexie("RoastTimer");
db.version(1).stores({
  roasts: "++id, startedAt, roastLevel",
});
```

### Pattern 3: Timer/UI State in Zustand
**What:** Centralize live timer state and UI flow transitions in a small store.
**When to use:** When multiple components need live timer data and markers.
**Example:**
```typescript
// Source: https://raw.githubusercontent.com/pmndrs/zustand/main/README.md
import { create } from "zustand";

const useTimerStore = create((set) => ({
  isRunning: false,
  start: () => set({ isRunning: true }),
  stop: () => set({ isRunning: false }),
}));
```

### Anti-Patterns to Avoid
- **Timer UI writes aggregates directly:** Derive totals from events so deletes/re-adds are consistent.
- **Persisting live ticks:** Store events and final metrics, not every timer tick.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Local persistence | Custom IndexedDB wrapper | Dexie | Handles schema versions and async patterns cleanly. |
| Input validation | Manual ad-hoc checks | Zod | Centralized schemas reduce save-flow bugs. |
| Cross-component timer state | Prop-drilling or global context only | Zustand | Minimal boilerplate and efficient updates. |

**Key insight:** The timer flow is simple, but storage and state coordination are deceptively complex; lean on proven libraries.

## Common Pitfalls

### Pitfall 1: Timer drift or background throttling
**What goes wrong:** setInterval or setTimeout pauses in background, causing incorrect elapsed times.
**Why it happens:** Browsers throttle timers when tabs are backgrounded.
**How to avoid:** Store start timestamps and compute elapsed using a monotonic clock; only use intervals to trigger UI refresh.
**Warning signs:** Elapsed time jumps after lock screen or tab switch.

### Pitfall 2: Inconsistent phase ordering
**What goes wrong:** First Crack or Drop recorded before Start or multiple times in the wrong order.
**Why it happens:** UI allows marker actions without state validation.
**How to avoid:** Enforce state transitions in a small state machine (start → first crack → drop → stop).
**Warning signs:** Derived durations are negative or missing.

### Pitfall 3: Loss % calculation on invalid weights
**What goes wrong:** Division by zero or negative loss when green weight missing or smaller than roasted weight.
**Why it happens:** Save flow doesn't require weights or validate ranges.
**How to avoid:** Require green weight before roast, roasted weight after roast; validate > 0 and roasted <= green.
**Warning signs:** NaN or negative loss % in review screen.

## Code Examples

Verified patterns from official sources:

### Dexie database setup
```typescript
// Source: https://dexie.org/docs/Tutorial/Hello-World
const db = new Dexie("RoastTimer");
db.version(1).stores({
  roasts: "++id, startedAt, roastLevel",
});
```

### Zustand store creation
```typescript
// Source: https://raw.githubusercontent.com/pmndrs/zustand/main/README.md
import { create } from "zustand";

const useTimerStore = create((set) => ({
  isRunning: false,
  start: () => set({ isRunning: true }),
  stop: () => set({ isRunning: false }),
}));
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| UI-maintained aggregates | Event log + derived metrics | Ongoing best practice | Easier corrections and consistent splits. |

**Deprecated/outdated:**
- Storing core roast logs in localStorage: IndexedDB-based persistence is the durable, queryable standard for local-first apps.

## Open Questions

1. **Timer accuracy while backgrounded**
   - What we know: Browser timers can be throttled; timestamps should be used for elapsed time.
   - What's unclear: Whether the target deployment will require additional background handling (PWA, iOS web app behavior).
   - Recommendation: Plan to compute elapsed from stored timestamps and test on target devices early.

## Sources

### Primary (HIGH confidence)
- https://dexie.org/docs/Tutorial/Hello-World - Dexie database setup example
- https://raw.githubusercontent.com/pmndrs/zustand/main/README.md - Zustand store creation example

### Secondary (MEDIUM confidence)
- /Users/bobsmachine/Projects/roastTimer/.planning/research/STACK.md - Internal stack selection and versions

### Tertiary (LOW confidence)
- /Users/bobsmachine/Projects/roastTimer/.planning/research/ARCHITECTURE.md - Internal architecture guidance (not externally verified)

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - Version sources are internal; core libraries verified by official docs for key pieces.
- Architecture: LOW - Patterns are domain-informed but not externally verified.
- Pitfalls: MEDIUM - Based on common web timer behavior and validation needs.

**Research date:** 2026-02-12
**Valid until:** 2026-03-14
