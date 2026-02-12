# Project Research Summary

**Project:** Roast Timer
**Domain:** Mobile-friendly coffee roast timer + green coffee inventory (single-user, iPhone-first)
**Researched:** 2026-02-12
**Confidence:** MEDIUM

## Executive Summary

This project is a single-user, mobile-first roast timer and green coffee inventory tracker. The research points to a local-first web app with a strict roast event model, phase timing, and lot-level inventory tracking as the most practical MVP approach. Experts in this domain emphasize consistent event capture, phase splits, and weight-based metrics, with inventory tied to lots and roast sessions.

The recommended approach is a Next.js + React + TypeScript app with Dexie (IndexedDB) as the source of truth, a roast session FSM with an append-only event log, and an inventory ledger model in grams. This keeps the timer accurate on mobile, preserves auditability, and avoids premature backend complexity while enabling offline use.

Key risks are inconsistent phase events, unit mismatch between inventory and roast inputs, and timer drift when the phone is backgrounded. Mitigation is to enforce explicit event timestamps, normalize weights to grams in the data model with strict conversions at the UI, and compute elapsed time from persisted timestamps rather than timer ticks.

## Key Findings

### Recommended Stack

The stack is optimized for a single-user, offline-first web app: Next.js + React + TypeScript with Tailwind for rapid mobile UI, Dexie for reliable IndexedDB persistence, and Zustand/Zod/date-fns for state, validation, and time formatting. This avoids unnecessary backend and aligns with the single-device, iPhone-first constraint. See `/.planning/research/STACK.md`.

**Core technologies:**
- Next.js 16.1.6: web app framework — strong App Router and deployment tooling; suited for mobile-first app without backend.
- React 19.2.4: UI rendering — default ecosystem for modern web UIs.
- TypeScript 5.9.3: type safety — prevents data-shape errors in roast and inventory calculations.
- Tailwind CSS 4.1.18: styling — fast iteration for touch-first layouts.
- Dexie 4.3.0 (IndexedDB): local-first persistence — reliable offline storage without server dependencies.

### Expected Features

Users expect a roast timer with phase splits, event markers, roast logging, and a coffee catalog with inventory. Differentiators include auto-deduction, comparisons, and simple planning tools once the core workflow is stable. See `/.planning/research/FEATURES.md`.

**Must have (table stakes):**
- Roast timer with phase splits and event markers — core workflow.
- Roast log with notes, roast level, start/end weights, loss % — essential roast record.
- Coffee catalog + lot selection with green inventory tracking — ties roasts to stock.

**Should have (competitive):**
- Inventory auto-deduction per roast — reduces manual stock math.
- Roast comparison view (phase times + loss %) — supports iteration.

**Defer (v2+):**
- Batch yield planner — needs historical loss data.
- Low-inventory alerts — helpful but not critical for MVP.

### Architecture Approach

A layered architecture with a roast session FSM + event log, an append-only inventory ledger, and derived read models is recommended to keep the UI simple while preserving auditability and accurate phase timings. See `/.planning/research/ARCHITECTURE.md`.

**Major components:**
1. Roast Session Engine (FSM + event log) — single source of truth for phase events and derived metrics.
2. Inventory Ledger — append-only stock changes and unit conversions.
3. Local DB + repositories — persistence of sessions, coffees, and ledger entries.

### Critical Pitfalls

Top issues are event ambiguity, unit mismatch, and mobile timer drift, all of which can be avoided with strict event modeling, canonical units, and timestamp-based elapsed time. See `/.planning/research/PITFALLS.md`.

1. **Ambiguous roast events and phase boundaries** — enforce explicit, timestamped events in a strict FSM.
2. **Unit mismatch between inventory and roast inputs** — store all weights in grams; convert only at the UI.
3. **Timer accuracy breaks in mobile background** — persist timestamps and compute elapsed time from system time.
4. **Inventory modeled as a single total** — use lot-level inventory with adjustment events.
5. **Wrong roast loss formula** — define loss as (green - roasted) / green and show formula in UI.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Core Roast Capture
**Rationale:** Event modeling and timer accuracy underpin every downstream feature and must be correct first.
**Delivers:** Roast session FSM + event log, phase splits, timer UI resilient to backgrounding, roast log with weights and loss %.
**Addresses:** Roast timer, event markers, roast log, start/end weights, loss %.
**Avoids:** Ambiguous events, wrong loss formula, background timer drift, missing cooling phase.

### Phase 2: Inventory + Lots
**Rationale:** Inventory features depend on stable roast data and unit normalization.
**Delivers:** Coffee catalog with lots, inventory ledger, unit conversions in grams, roast-to-lot linkage, manual adjustments.
**Addresses:** Coffee catalog, green inventory tracking, lot selection.
**Avoids:** Unit mismatch, inventory modeled as total only, inventory drift.

### Phase 3: Optimization + Insights
**Rationale:** Differentiators rely on accumulated history and stable schemas.
**Delivers:** Inventory auto-deduction, roast comparison view, optional export scaffolding.
**Addresses:** Auto-deduction, roast comparison; sets foundation for planner/alerts.
**Avoids:** Premature complexity and unstable analytics from insufficient data.

### Phase Ordering Rationale

- Core event/timer correctness enables reliable phase metrics and roast loss, which inventory and comparisons depend on.
- Architecture patterns (FSM + ledger + derived read models) align with phase boundaries for incremental delivery.
- Early focus on unit normalization and event modeling mitigates the most expensive pitfalls.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** Lot-level inventory and unit conversion UX details need validation with real workflow data.
- **Phase 3:** Export formats and comparison semantics benefit from targeted research to avoid rework.

Phases with standard patterns (skip research-phase):
- **Phase 1:** Timer + event log + roast logging follow established local-first patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Official release sources validate versions; app suitability inferred from constraints. |
| Features | MEDIUM | Competitive analysis from reputable product docs but limited user validation. |
| Architecture | LOW | Based on standard patterns without direct external sources. |
| Pitfalls | LOW | Mix of general roasting sources and practitioner inference. |

**Overall confidence:** MEDIUM

### Gaps to Address

- Inventory workflow validation: confirm lot-level model and adjustment UI against real roast practices before Phase 2.
- Mobile timer behavior: validate backgrounding behavior on iOS Safari and refine event capture UX if needed.
- Export/backup expectations: confirm whether CSV or file-based backup is required before Phase 3.

## Sources

### Primary (HIGH confidence)
- https://github.com/vercel/next.js/releases/tag/v16.1.6 — Next.js release
- https://github.com/facebook/react/releases/tag/v19.2.4 — React release
- https://github.com/microsoft/TypeScript/releases/tag/v5.9.3 — TypeScript release
- https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.1.18 — Tailwind release
- https://github.com/dexie/Dexie.js/releases/tag/v4.3.0 — Dexie release
- https://github.com/pmndrs/zustand/releases/tag/v5.0.11 — Zustand release
- https://github.com/colinhacks/zod/releases/tag/v4.3.6 — Zod release
- https://github.com/date-fns/date-fns/releases/tag/v4.1.0 — date-fns release
- https://tailwindcss.com/docs/installation/framework-guides/nextjs — Tailwind + Next.js guide

### Secondary (MEDIUM confidence)
- https://www.cropster.com/products/roast/features/ — roast workflow expectations
- https://www.cropster.com/products/commerce/ — inventory planning patterns
- https://www.cropster.com/products/origin/features/ — lot/inventory concepts
- https://artisan-scope.org/ — roasting software landscape

### Tertiary (LOW confidence)
- https://en.wikipedia.org/wiki/Coffee_roasting — process overview
- https://library.sweetmarias.com/coffee-roasting/ — roasting terminology
- Practitioner experience — timer/inventory workflow patterns

---
*Research completed: 2026-02-12*
*Ready for roadmap: yes*
