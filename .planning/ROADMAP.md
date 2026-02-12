# Roadmap: Roast Timer

## Overview

This roadmap delivers a mobile-friendly roast timer and logging workflow first, then adds lot-level inventory tracking tied to roasts, and finally introduces roast comparison for iterative improvement. Phases are organized around user-visible capabilities so each milestone is usable on its own.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Roast Capture + Logs** - Time roasts with phase splits and save core roast records
- [ ] **Phase 2: Inventory + History** - Manage lots/inventory and connect roasts to inventory-aware history
- [ ] **Phase 3: Roast Comparison** - Compare roasts by phase timing and loss

## Phase Details

### Phase 1: Roast Capture + Logs
**Goal**: Users can time a roast with phase splits and save complete roast records
**Depends on**: Nothing (first phase)
**Requirements**: TIME-01, TIME-02, TIME-03, TIME-04, TIME-05, LOG-01, LOG-02, LOG-03
**Success Criteria** (what must be TRUE):
  1. User can start a roast timer and see overall elapsed time
  2. User can mark First Crack and Drop/Bean Dump and see development and cooling times derived from those events
  3. User can add or edit event markers with timestamps during a roast
  4. User can stop a roast and save notes, roast level, weights in grams, and a calculated loss %
**Plans**: TBD

Plans:
- [ ] 01-01: TBD

### Phase 2: Inventory + History
**Goal**: Users can manage green coffee lots and see inventory-aware roast history
**Depends on**: Phase 1
**Requirements**: LOG-04, INVT-01, INVT-02, INVT-03, INVT-04
**Success Criteria** (what must be TRUE):
  1. User can create coffee lots and set inventory in pounds
  2. User can adjust lot inventory for purchases or corrections
  3. User can select a lot for each roast and see it associated in history
  4. Inventory auto-deducts using the roast green weight with gram-to-pound conversion
  5. User can filter roast history by coffee/lot, date, and roast level
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: Roast Comparison
**Goal**: Users can compare roasts to improve consistency
**Depends on**: Phase 2
**Requirements**: INS-01
**Success Criteria** (what must be TRUE):
  1. User can select 2-3 roasts to compare
  2. Comparison shows phase times and loss % for each selected roast
  3. Changing the selection updates the comparison view
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 1.1 → 1.2 → 2 → 2.1 → 2.2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Roast Capture + Logs | 0/TBD | Not started | - |
| 2. Inventory + History | 0/TBD | Not started | - |
| 3. Roast Comparison | 0/TBD | Not started | - |
