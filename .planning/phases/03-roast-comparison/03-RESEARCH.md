# Phase 3: Roast Comparison - Research

**Researched:** 2026-02-12
**Domain:** Roast comparison UI (selection + derived metrics) on Dexie-backed data
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
No CONTEXT.md found for this phase.

### Claude's Discretion
No CONTEXT.md found for this phase.

### Deferred Ideas (OUT OF SCOPE)
No CONTEXT.md found for this phase.
</user_constraints>

## Summary

Phase 3 should build a compare view on top of existing roast history data without adding new persistence. The `CompletedRoast` records already contain `events` and `yieldPercent`, and the domain utility `derivePhaseTimes` can produce total, development, and cooling durations per roast. The compare view should reuse the Dexie `liveQuery` subscription pattern (as in `HistoryScreen`) to keep the roast list and comparison output up to date when selections change or new roasts are saved.

The simplest architecture is a dedicated compare screen component under `src/features/roast-compare/` with local selection state (limited to 2-3 roasts). Render a selection list (checkboxes or cards) and a comparison grid/table that displays phase times and yield % for each selected roast using `formatElapsedMsOrPlaceholder` and a shared yield formatter (same logic as `HistoryScreen` to handle `lossPercent` fallback). Avoid duplicating calculations; keep derivations in memoized selectors and treat null phase times as expected for incomplete event data.

**Primary recommendation:** Implement a new compare screen that subscribes to roasts via `liveQuery`, caps selections at 3, and derives times/yield from existing domain utilities.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App routing and rendering | Existing app framework |
| React | 19.2.4 | UI components | Existing UI framework |
| Dexie | 4.3.0 | IndexedDB wrapper | Current persistence layer |
| Zustand | 5.0.11 | Client state | Current state tool (timer flow) |
| TypeScript | 5.9.3 | Type safety | Current language toolchain |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tailwind CSS | 4.1.18 | Styling | Match existing UI system |
| Zod | 4.3.6 | Validation | Reuse for any new inputs |
| date-fns | 4.1.0 | Time helpers | Existing utility library |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Dexie `liveQuery` + manual subscribe | `dexie-react-hooks` `useLiveQuery` | Adds dependency but reduces boilerplate (not currently in stack) |

**Installation:**
```bash
npm install
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/                     # Routes
├── features/
│   ├── roast-compare/        # Comparison UI + selection state
│   └── roast-log/            # History UI used as reference
├── domain/roast-session/     # derivePhaseTimes, deriveYieldPercent
├── data/                     # listRoastsFiltered, listLots, listCoffees
└── shared/format/            # formatElapsedMsOrPlaceholder
```

### Pattern 1: Reactive list + local selection cap
**What:** Subscribe to roasts with `liveQuery`, store selection in local component state, and enforce a 2-3 selection cap.
**When to use:** Compare view where list updates and selection must be bounded.
**Example:**
```typescript
// Source: src/features/roast-log/HistoryScreen.tsx
useEffect(() => {
  const subscription = liveQuery(() => listRoastsFiltered(filterParams)).subscribe({
    next: (results) => {
      setRoasts(results);
      setIsLoading(false);
      setLoadError(null);
    },
    error: (error) => {
      console.error(error);
      setLoadError("Unable to load roast history.");
      setIsLoading(false);
    },
  });

  return () => subscription.unsubscribe();
}, [filterParams]);
```

### Pattern 2: Derived comparison rows
**What:** Map selected roasts to a view model that includes derived phase times and formatted yield.
**When to use:** Comparison table/grid rendering.
**Example:**
```typescript
// Source: src/domain/roast-session/derive.ts
export const derivePhaseTimes = (events: RoastEvent[]): RoastPhaseTimes => {
  const start = getEventTimestamp(events, "START");
  const firstCrack = getEventTimestamp(events, "FIRST_CRACK");
  const drop = getEventTimestamp(events, "DROP");
  const stop = getEventTimestamp(events, "STOP");

  const totalMs = start != null && stop != null && stop >= start ? stop - start : null;
  const developmentMs =
    firstCrack != null && drop != null && drop >= firstCrack ? drop - firstCrack : null;
  const coolingMs = drop != null && stop != null && stop >= drop ? stop - drop : null;

  return { totalMs, developmentMs, coolingMs };
};
```

### Anti-Patterns to Avoid
- **Selection state in DB:** Comparison selection is UI-only; do not persist in Dexie unless explicitly required.
- **Recomputing derivations on every render:** Use `useMemo` for derived rows when roasts/selection change.
- **Direct arithmetic in UI:** Use `derivePhaseTimes`, `deriveYieldPercent`, and `formatElapsedMsOrPlaceholder` for consistency.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Phase calculations | Inline time math in components | `derivePhaseTimes` | Keeps formulas consistent and tested in one place |
| Yield formatting | Custom calculation per view | `deriveYieldPercent` + shared formatter | Prevents formula drift and rounding inconsistencies |
| Live list refresh | Manual polling | Dexie `liveQuery` | Avoids stale compare view and extra timers |

**Key insight:** The data model already supports comparison; the main risk is duplicating calculations or introducing inconsistent formatting across screens.

## Common Pitfalls

### Pitfall 1: Allowing more than 3 roasts
**What goes wrong:** UI accepts too many selections, making the comparison unreadable and violating requirements.
**Why it happens:** Selection state is stored as an unbounded array or Set without guardrails.
**How to avoid:** Enforce max length on selection changes and disable additional checkboxes.
**Warning signs:** Users can select 4+ roasts; comparison grid wraps unpredictably.

### Pitfall 2: Null phase times displayed as 0:00
**What goes wrong:** Incomplete or edited roasts show misleading phase times.
**Why it happens:** UI assumes phase times are always numbers.
**How to avoid:** Use `formatElapsedMsOrPlaceholder` and handle null explicitly.
**Warning signs:** Comparisons show 0:00 for missing data.

### Pitfall 3: Yield % inconsistent with history
**What goes wrong:** Comparison uses a different yield formula or ignores `lossPercent` fallback.
**Why it happens:** Formatter logic is duplicated instead of reused.
**How to avoid:** Extract `resolveYieldPercent` logic from `HistoryScreen` to a shared helper.
**Warning signs:** History and compare screens show different yield for the same roast.

## Code Examples

Verified patterns from repo:

### Formatting phase times
```typescript
// Source: src/shared/format/time.ts
export const formatElapsedMsOrPlaceholder = (
  elapsedMs: number | null,
  placeholder = "--:--"
): string => {
  if (elapsedMs == null) {
    return placeholder;
  }

  return formatElapsedMs(elapsedMs);
};
```

### Roast listing by filter
```typescript
// Source: src/data/roasts.ts
export const listRoastsFiltered = async (
  filters: RoastFilters
): Promise<CompletedRoast[]> => {
  const { lotId, roastLevel, startAt, endAt } = filters;

  if (startAt == null && endAt == null && lotId == null && roastLevel == null) {
    return listRoasts();
  }

  const rangeStart = startAt ?? 0;
  const rangeEnd = endAt ?? Number.MAX_SAFE_INTEGER;

  let results: CompletedRoast[];
  if (startAt != null || endAt != null) {
    results = await db.roasts
      .where("startedAt")
      .between(rangeStart, rangeEnd, true, true)
      .reverse()
      .toArray();
  } else if (lotId != null) {
    results = await db.roasts.where("lotId").equals(lotId).reverse().toArray();
  } else if (roastLevel != null) {
    results = await db.roasts
      .where("roastLevel")
      .equals(roastLevel)
      .reverse()
      .toArray();
  } else {
    results = await listRoasts();
  }

  if (lotId != null) {
    results = results.filter((roast) => roast.lotId === lotId);
  }

  if (roastLevel != null) {
    results = results.filter((roast) => roast.roastLevel === roastLevel);
  }

  return results;
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual refresh or polling | Dexie `liveQuery` subscriptions | Existing codebase (HistoryScreen) | Comparison view stays in sync with saved roasts |

**Deprecated/outdated:**
- Manual refresh buttons for data lists (prefer reactive subscriptions).

## Open Questions

1. **Where should the compare view live in navigation?**
   - What we know: History and Inventory are separate routes; timer links to both.
   - What's unclear: Whether compare should be a new route (`/compare`) or embedded within history.
   - Recommendation: Prefer a dedicated route to keep history list focused; embed entry point in history header.

## Sources

### Primary (HIGH confidence)
- `package.json` - dependency versions
- `package-lock.json` - resolved TypeScript version
- `src/domain/roast-session/derive.ts` - phase time derivation
- `src/data/roasts.ts` - roast listing and filtering
- `src/features/roast-log/HistoryScreen.tsx` - liveQuery subscription pattern
- `src/shared/format/time.ts` - time formatting helper

### Secondary (MEDIUM confidence)
- `src/features/roast-log/ReviewScreen.tsx` - yield calculation display pattern

### Tertiary (LOW confidence)
- No external sources used

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions verified from `package.json` and `package-lock.json`
- Architecture: MEDIUM - inferred from current code organization and patterns
- Pitfalls: MEDIUM - based on existing code patterns and requirement constraints

**Research date:** 2026-02-12
**Valid until:** 2026-03-14
