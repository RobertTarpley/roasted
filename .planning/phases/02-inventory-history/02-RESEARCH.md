# Phase 02: Inventory + History - Research

**Researched:** 2026-02-12
**Domain:** IndexedDB persistence, inventory modeling, history filtering
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
## Implementation Decisions

### Inventory model
- Coffee record fields: Name (required; typically farm/producer), Origin (optional; country), Process (required: Natural, Washed, Honey/Pulped Natural, Experimental, Other)
- Lots are created under a coffee record with a lot name/label and starting inventory (lbs)
- Inventory is tracked in pounds with decimal precision; grams convert to pounds using 1 lb = 453.592 g

### Inventory adjustments
- User can add adjustments for purchases or corrections
- Each adjustment records: lot, amount (+/- lbs), and reason (purchase or correction)
- Adjustments update current inventory immediately and are visible in lot detail

### Roast linkage
- Pre-roast flow requires selecting a lot for each roast
- Selected lot appears in history and on the saved roast record
- Saving a roast auto-deducts green weight from the selected lot

### History filters
- Filters include: coffee/lot (single select), date range (start/end optional), and roast level
- Filters are optional; default history shows all roasts

### Claude's Discretion
- Exact UI layout for lot management and adjustment entry
- Empty-state and validation copy

### Deferred Ideas (OUT OF SCOPE)
## Deferred Ideas

- Low-inventory alerts
- Lot-level analytics or projections
</user_constraints>

## Summary

Phase 2 should extend the existing Dexie-backed persistence layer with new tables for coffee records, lots, and inventory adjustments, plus new fields on roasts to capture lot linkage. Use Dexie schema versioning to add tables and indexes that support history filters (lot, roast level, date range) and inventory operations. Keep multi-table updates atomic by wrapping roast saves and inventory deductions in a single Dexie transaction.

The UI and feature flow already rely on client components and a Dexie liveQuery subscription. Continue using liveQuery + subscription for live lists (inventory, filtered history) and reuse the existing data-layer pattern (src/data/*.ts) to keep storage concerns out of components. Validation should follow the existing Zod approach in forms, with input parsing to numbers and error messaging at the component layer.

**Primary recommendation:** Use Dexie versioned schema with indexed fields and transactions to keep roast saves + inventory deductions consistent, and drive history/inventory views via liveQuery subscriptions.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App router + rendering | Existing app framework |
| React | 19.2.4 | UI components | Existing UI framework |
| Dexie | 4.3.0 | IndexedDB wrapper | Current persistence layer |
| Zustand | 5.0.11 | Client state | Timer flow state |
| Zod | 4.3.6 | Form validation | Current validation pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tailwind CSS | 4.1.18 | Styling | Existing styling system |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| liveQuery + manual subscribe | dexie-react-hooks useLiveQuery | Adds dependency but simplifies React usage (Dexie docs mention it) |

**Installation:**
```bash
npm install
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/               # Next.js routes
├── data/              # Dexie db + data access
├── domain/            # Types and derivations
├── features/          # UI screens + forms
└── shared/            # Formatting utilities
```

### Pattern 1: Dexie schema versioning for new tables
**What:** Add new stores with a higher schema version and define indexes needed for filters.
**When to use:** Any time adding tables or indexed fields.
**Example:**
```typescript
// Source: https://dexie.org/docs/Version/Version.stores()
db.version(2).stores({
  coffees: "++id, name, origin, process",
  lots: "++id, coffeeId, label, currentInventoryLbs",
  adjustments: "++id, lotId, createdAt, reason",
  roasts: "++id, startedAt, roastLevel, lotId"
});
```

### Pattern 2: Transaction for roast save + inventory deduction
**What:** Wrap multi-table writes in a single Dexie transaction.
**When to use:** Saving a roast and updating lot inventory together.
**Example:**
```typescript
// Source: https://dexie.org/docs/Dexie/Dexie.transaction()
await db.transaction("rw", db.roasts, db.lots, async () => {
  await db.roasts.add(roast);
  await db.lots.update(lotId, { currentInventoryLbs: nextInventory });
});
```

### Pattern 3: Indexed queries with where + between
**What:** Filter history by indexed fields (lot/date/level) with where/between.
**When to use:** Querying by a single field or compound indexes.
**Example:**
```typescript
// Source: https://dexie.org/docs/Table/Table.where()
const filtered = await db.roasts
  .where("startedAt")
  .between(startTimestamp, endTimestamp, true, true)
  .toArray();
```

### Pattern 4: Reactive lists with liveQuery subscriptions
**What:** Use liveQuery to keep inventory/history lists in sync.
**When to use:** Screens that should update as Dexie data changes.
**Example:**
```typescript
// Source: https://dexie.org/docs/liveQuery()
const subscription = liveQuery(() => db.roasts.toArray()).subscribe({
  next: setRoasts,
  error: handleError,
});
```

### Anti-Patterns to Avoid
- **Manual IndexedDB access:** The project already uses Dexie; mixing APIs complicates transactions and queries.
- **Multi-table writes outside a transaction:** Risks partial saves if inventory update fails.
- **Filtering large sets in memory:** Prefer indexed queries for date/lot/level where possible.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IndexedDB wrapper | Raw IndexedDB APIs | Dexie | Transactions and query ergonomics are established (Dexie docs) |
| Reactive list updates | Manual polling | liveQuery subscriptions | Auto-updates on data changes (Dexie docs) |
| Form validation | Ad-hoc checks | Zod schemas | Consistent error handling like existing forms |

**Key insight:** Dexie already provides versioning, indexing, and live queries; use those rather than custom persistence or polling logic.

## Common Pitfalls

### Pitfall 1: Forgetting to bump schema version
**What goes wrong:** New tables or indexes are ignored, causing missing data or queries failing.
**Why it happens:** Dexie only applies new schema definitions in higher versions.
**How to avoid:** Increment the version and define all new stores/indexes in that version.
**Warning signs:** Newly added tables are empty or undefined at runtime.

### Pitfall 2: Non-Dexie async inside transactions
**What goes wrong:** Transaction auto-commits or fails (TransactionInactiveError).
**Why it happens:** IndexedDB transactions close on async gaps.
**How to avoid:** Keep transactions limited to Dexie operations or use Dexie.waitFor if needed.
**Warning signs:** Intermittent transaction failures or partial writes.

### Pitfall 3: Missing or wrong indexes for filters
**What goes wrong:** Queries fall back to slow in-memory filtering.
**Why it happens:** where/between need indexed fields; compound filters need compound indexes.
**How to avoid:** Index fields used in filters (lotId, roastLevel, startedAt) and consider compound indexes for combined filters.
**Warning signs:** Large lists with noticeable lag when filtering.

### Pitfall 4: Floating point drift in inventory math
**What goes wrong:** Inventory totals accumulate small errors.
**Why it happens:** Repeated decimal arithmetic in pounds.
**How to avoid:** Normalize to a fixed decimal precision after each update (e.g., 3 decimals) and display rounded values.
**Warning signs:** Inventory shows long fractional tails or inconsistent totals.

## Code Examples

Verified patterns from official sources:

### Define stores and indexes
```typescript
// Source: https://dexie.org/docs/Version/Version.stores()
db.version(2).stores({
  coffees: "++id, name, origin, process",
  lots: "++id, coffeeId, label",
  adjustments: "++id, lotId, createdAt",
  roasts: "++id, startedAt, roastLevel, lotId"
});
```

### Run a readwrite transaction
```typescript
// Source: https://dexie.org/docs/Dexie/Dexie.transaction()
await db.transaction("rw", db.roasts, db.lots, async () => {
  await db.roasts.add(roast);
  await db.lots.update(lotId, { currentInventoryLbs: nextInventory });
});
```

### Filter by index
```typescript
// Source: https://dexie.org/docs/Table/Table.where()
const roasts = await db.roasts.where("roastLevel").equals("Medium").toArray();
```

### Subscribe with liveQuery
```typescript
// Source: https://dexie.org/docs/liveQuery()
const subscription = liveQuery(() => db.roasts.toArray()).subscribe({
  next: setRoasts,
  error: (error) => console.error(error),
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Direct IndexedDB API | Dexie abstraction | Established in current codebase | Faster development, fewer transaction bugs |

**Deprecated/outdated:**
- Manual IndexedDB transactions for app data (superseded by Dexie in this project).

## Open Questions

1. **Should deleting a roast restore inventory?**
   - What we know: There is a delete action in history; auto-deduct happens on save.
   - What's unclear: Whether deletion should revert the lot deduction or leave inventory unchanged.
   - Recommendation: Decide before planning; it affects data model and transaction logic.

2. **Is negative inventory allowed for lots?**
   - What we know: Adjustments can be negative for corrections; auto-deduct reduces inventory.
   - What's unclear: Should the UI block going below zero or allow negative to reflect oversold stock.
   - Recommendation: Define validation and messaging behavior in planning.

3. **What happens when a lot is removed but roasts reference it?**
   - What we know: Roasts must show their selected lot in history.
   - What's unclear: Whether lots are ever deleted or only archived.
   - Recommendation: Prefer soft-delete/archival or block deletion if referenced.

## Sources

### Primary (HIGH confidence)
- https://dexie.org/docs/Version/Version.stores() - schema/index definition
- https://dexie.org/docs/Dexie/Dexie.transaction() - transaction usage and constraints
- https://dexie.org/docs/Table/Table.where() - indexed queries and compound filtering
- https://dexie.org/docs/liveQuery() - liveQuery usage and behavior

### Secondary (MEDIUM confidence)
- package.json - repository dependencies and versions

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions verified in package.json
- Architecture: MEDIUM - inferred from current project structure + Dexie docs
- Pitfalls: MEDIUM - based on Dexie docs and common IndexedDB behavior

**Research date:** 2026-02-12
**Valid until:** 2026-03-14
