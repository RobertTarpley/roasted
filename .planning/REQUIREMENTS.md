# Requirements: Roast Timer

**Defined:** 2026-02-12
**Core Value:** Make it effortless to time a roast and capture the key metrics and notes so I can track results over time.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Roast Timing

- [x] **TIME-01**: User can start a roast timer that tracks overall elapsed time
- [x] **TIME-02**: User can mark "First Crack" to start development time from that event
- [x] **TIME-03**: User can mark "Drop/Bean Dump" to start cooling time from that event
- [x] **TIME-04**: User can stop a roast to finalize overall, development, and cooling times
- [x] **TIME-05**: User can add/remove First Crack and Drop markers with timestamps (corrections by delete and re-add)

### Roast Records

- [x] **LOG-01**: User can save a roast log with notes and roast level
- [x] **LOG-02**: User can enter green weight (grams) and roasted weight (grams)
- [x] **LOG-03**: System calculates roast yield % as (roasted / green) * 100
- [ ] **LOG-04**: User can view roast history and filter by coffee/lot, date, and roast level

### Inventory

- [ ] **INVT-01**: User can create coffee records and select a lot for each roast
- [ ] **INVT-02**: User can track green inventory per lot in pounds
- [ ] **INVT-03**: User can record inventory adjustments (purchases or corrections)
- [ ] **INVT-04**: System auto-deducts green inventory per roast using the entered green weight with gram-to-pound conversion

### Insights

- [ ] **INS-01**: User can compare 2-3 roasts by phase times and yield %

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
| TIME-01 | Phase 1 | Complete |
| TIME-02 | Phase 1 | Complete |
| TIME-03 | Phase 1 | Complete |
| TIME-04 | Phase 1 | Complete |
| TIME-05 | Phase 1 | Complete |
| LOG-01 | Phase 1 | Complete |
| LOG-02 | Phase 1 | Complete |
| LOG-03 | Phase 1 | Complete |
| LOG-04 | Phase 2 | Pending |
| INVT-01 | Phase 2 | Pending |
| INVT-02 | Phase 2 | Pending |
| INVT-03 | Phase 2 | Pending |
| INVT-04 | Phase 2 | Pending |
| INS-01 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0

---
*Requirements defined: 2026-02-12*
*Last updated: 2026-02-12 after Phase 1 completion*
