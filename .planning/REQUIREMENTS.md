# Requirements: Roast Timer

**Defined:** 2026-02-12
**Core Value:** Make it effortless to time a roast and capture the key metrics and notes so I can track results over time.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Roast Timing

- [ ] **TIME-01**: User can start a roast timer that tracks overall elapsed time
- [ ] **TIME-02**: User can mark "First Crack" to start development time from that event
- [ ] **TIME-03**: User can mark "Drop/Bean Dump" to start cooling time from that event
- [ ] **TIME-04**: User can stop a roast to finalize overall, development, and cooling times
- [ ] **TIME-05**: User can add/edit event markers (e.g., color change) with timestamps

### Roast Records

- [ ] **LOG-01**: User can save a roast log with notes and roast level
- [ ] **LOG-02**: User can enter green weight (grams) and roasted weight (grams)
- [ ] **LOG-03**: System calculates roast loss % as (green - roasted) / green
- [ ] **LOG-04**: User can view roast history and filter by coffee/lot, date, and roast level

### Inventory

- [ ] **INVT-01**: User can create coffee records and select a lot for each roast
- [ ] **INVT-02**: User can track green inventory per lot in pounds
- [ ] **INVT-03**: User can record inventory adjustments (purchases or corrections)
- [ ] **INVT-04**: System auto-deducts green inventory per roast using the entered green weight with gram-to-pound conversion

### Insights

- [ ] **INS-01**: User can compare 2-3 roasts by phase times and loss %

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Reliability

- **REL-01**: App supports offline-first roast capture without connectivity

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Quick-repeat roast templates | Helpful but not required for initial validation |
| Batch yield planner | Depends on enough loss % history |
| Low-inventory alerts | Nice-to-have; not critical for v1 |
| Photo capture | Adds storage/UX complexity without core value gain |
| Hardware integration for live curves | High device variability for a single-user MVP |
| Multi-user roles and permissions | Single-user tool by design |
| E-commerce or fulfillment management | Out of domain for a roast timer |
| Enterprise traceability/compliance | Too heavy for v1 scope |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TIME-01 | Phase TBD | Pending |
| TIME-02 | Phase TBD | Pending |
| TIME-03 | Phase TBD | Pending |
| TIME-04 | Phase TBD | Pending |
| TIME-05 | Phase TBD | Pending |
| LOG-01 | Phase TBD | Pending |
| LOG-02 | Phase TBD | Pending |
| LOG-03 | Phase TBD | Pending |
| LOG-04 | Phase TBD | Pending |
| INVT-01 | Phase TBD | Pending |
| INVT-02 | Phase TBD | Pending |
| INVT-03 | Phase TBD | Pending |
| INVT-04 | Phase TBD | Pending |
| INS-01 | Phase TBD | Pending |

**Coverage:**
- v1 requirements: 14 total
- Mapped to phases: 0
- Unmapped: 14 ⚠️

---
*Requirements defined: 2026-02-12*
*Last updated: 2026-02-12 after initial definition*
