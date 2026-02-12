# Architecture Research

**Domain:** Coffee roasting timer + green coffee inventory (single-user mobile-first)
**Researched:** 2026-02-12
**Confidence:** LOW

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         Presentation Layer                       │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Timer UI     │  │ Roast Log UI │  │ Inventory UI│            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘            │
│         │                 │                 │                   │
├─────────┴─────────────────┴─────────────────┴───────────────────┤
│                         Application Layer                         │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Roast Session Engine (FSM + event log + derived metrics)    │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │ Inventory Ledger (green in, roasted out, unit conversions)  │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │ Notes & Metadata (roast level, notes, tags, profile)        │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │ Sync/Export (optional: CSV, backup, cloud)                  │  │
│  └────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│                             Data Layer                            │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Local DB     │  │ File Export  │  │ Settings     │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Timer UI | Start/stop timer, mark first crack, dump, cooling, show splits and live deltas | Stateful UI with live ticks and large controls for mobile |
| Roast Log UI | Review sessions, edit notes, view metrics, attach coffee | List/detail views with computed stats |
| Inventory UI | View green stock, lots, roast history impact | List views with ledger summaries |
| Roast Session Engine | Single source of truth for timer state, phase splits, derived metrics | Finite state machine + event log + derived model |
| Inventory Ledger | Tracks weight in/out, unit normalization, roast loss % | Append-only entries with conversions |
| Notes & Metadata | Captures roast notes, roast level, tags, coffee selection | Form handling + validation |
| Local DB | Persistence of coffees, roast sessions, ledger entries, settings | IndexedDB/SQLite/local storage abstraction |
| Sync/Export | Backup to file or cloud, CSV export for logs/ledger | Async background tasks |

## Recommended Project Structure

```
src/
├── app/                 # App shell, routing, global providers
├── features/
│   ├── timer/           # Roast session UI + state machine
│   ├── roast-log/       # Roast history, detail, editing
│   ├── inventory/       # Green coffee lots and ledger views
│   └── coffees/         # Coffee catalog (origin, lot, vendor)
├── domain/
│   ├── roast-session/   # FSM, event log, derived metrics
│   ├── inventory/       # Ledger, unit conversions, loss calc
│   └── measurements/    # Units and conversions (g/lb)
├── data/                # Persistence adapters, repositories
├── shared/              # UI components, formatting, utilities
└── integrations/        # Export/sync (optional)
```

### Structure Rationale

- **features/:** Keeps UI and flows grouped by user tasks (timer, inventory, logs).
- **domain/:** Pure business logic isolated from UI and storage; easiest to test.
- **data/:** Swap local DB or add sync without touching domain logic.

## Architectural Patterns

### Pattern 1: Roast Session FSM + Event Log

**What:** Model the roast as an explicit state machine with an append-only event log; derive splits, times, and roast loss from events.
**When to use:** Any time a timer has phase markers (first crack, dump, cooling) and needs auditability.
**Trade-offs:** Slightly more modeling work up front; much easier to correct or replay sessions.

**Example:**
```typescript
type RoastEvent =
  | { type: "START"; t: number }
  | { type: "FIRST_CRACK"; t: number }
  | { type: "DUMP"; t: number }
  | { type: "COOL_END"; t: number }
  | { type: "STOP"; t: number };

function deriveSplits(events: RoastEvent[]) {
  const start = events.find(e => e.type === "START")?.t ?? 0;
  const fc = events.find(e => e.type === "FIRST_CRACK")?.t ?? null;
  const dump = events.find(e => e.type === "DUMP")?.t ?? null;
  return {
    total: dump != null ? dump - start : null,
    dev: fc != null && dump != null ? dump - fc : null,
  };
}
```

### Pattern 2: Inventory Ledger (Append-Only)

**What:** Track stock changes as ledger entries instead of updating a single quantity.
**When to use:** Any time you need auditability (roast input/output weights, adjustments).
**Trade-offs:** More rows; but supports corrections and reporting.

**Example:**
```typescript
type LedgerEntry = {
  coffeeId: string;
  type: "GREEN_IN" | "ROAST_IN" | "ROAST_OUT" | "ADJUST";
  grams: number;
  at: number;
};

function currentBalance(entries: LedgerEntry[]) {
  return entries.reduce((sum, e) => sum + e.grams, 0);
}
```

### Pattern 3: Derived Read Models

**What:** Precompute view models for logs and inventory summaries.
**When to use:** List-heavy screens (roast history, inventory overview).
**Trade-offs:** Requires recompute on change; keeps UI simple and fast.

## Data Flow

### Request Flow

```
User taps "Start" or "First Crack"
    ↓
Timer UI → Roast Session Engine → Event Log → Local DB
    ↓                    ↓              ↓          ↓
Live UI ← Derived Model ← Recompute ← Persist
```

### State Management

```
Local DB
  ↓ (subscribe)
Derived View Models ← Domain Aggregates ← Actions/Events ← UI
```

### Key Data Flows

1. **Roast session capture:** Timer UI emits events → session engine validates state transitions → event log persisted → derived splits and roast loss computed for display and log entry.
2. **Inventory update:** Roast saved with green input and roasted output weights → inventory ledger entries appended → inventory totals recomputed per coffee.
3. **Roast log review:** Roast list screen queries derived read model → user edits notes/roast level → metadata updates without changing event log.

## Build Order (Dependency-Aware)

1. **Domain models and unit conversions** (grams/lb, loss %) → needed by timer and inventory.
2. **Roast Session Engine (FSM + event log)** → foundation for timer and roast logs.
3. **Local persistence layer** (repositories for sessions, coffees, ledger) → required before logs/inventory are useful.
4. **Timer UI** → uses session engine + persistence for live capture.
5. **Roast Log UI** → reads derived models from saved sessions.
6. **Inventory UI** → depends on ledger entries and roast saves.
7. **Sync/Export** (optional) → depends on stable data schema.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Local-first monolith; single DB; offline by default. |
| 1k-100k users | Add background sync and conflict resolution; server-backed storage. |
| 100k+ users | Multi-tenant backend, analytics pipeline, data partitioning by user. |

### Scaling Priorities

1. **First bottleneck:** timer accuracy during app backgrounding; fix with monotonic time source + event log reconciliation.
2. **Second bottleneck:** large roast history lists; fix with derived read models and pagination.

## Anti-Patterns

### Anti-Pattern 1: Timer UI directly writes aggregates

**What people do:** Update total time and splits in UI state without an event log.
**Why it's wrong:** Hard to fix mistakes or recompute when edits occur.
**Do this instead:** Record events and derive metrics from them.

### Anti-Pattern 2: Inventory as single mutable quantity

**What people do:** Overwrite current stock on each roast.
**Why it's wrong:** No audit trail and loss % becomes inconsistent.
**Do this instead:** Use ledger entries and compute balance from history.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Cloud backup (optional) | Sync service with local-first reconciliation | Only needed if multi-device or export required. |
| CSV export | On-demand file generation | Keep data schema stable before shipping. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Timer UI ↔ Roast Session Engine | Events/actions | Strict FSM prevents invalid phase ordering. |
| Roast Session Engine ↔ Inventory Ledger | Domain call | Roast save triggers ledger append. |
| Domain ↔ Data | Repository interface | Keep storage tech swappable. |

## Sources

- No external sources accessible in this environment; architecture based on general domain patterns and standard app design practices (LOW confidence).

---
*Architecture research for: coffee roasting timer + inventory app*
*Researched: 2026-02-12*
