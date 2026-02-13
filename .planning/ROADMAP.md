# Roadmap: Roast Timer

## Overview

This milestone makes the app privately accessible and installable as a PWA for personal use. First deliver the passcode gate and privacy notice, then enable installability with offline app-shell support and iOS add-to-home guidance.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 4: Private Access Gate** - Passcode gate with session lock and privacy notice
- [x] **Phase 5: PWA Install + Offline Shell** - Installable PWA with offline launch and iOS guidance

## Phase Details

### Phase 4: Private Access Gate
**Goal**: Users can privately access the app behind a passcode gate
**Depends on**: Phase 3
**Requirements**: ACCESS-01, ACCESS-02, ACCESS-03, PRIV-01
**Success Criteria** (what must be TRUE):
  1. User sees a passcode prompt before any app content is shown
  2. User can unlock with the current passcode, and the unlock persists for the session until they lock
  3. Changing the server-configured passcode causes the previous passcode to fail on next unlock
  4. User sees a brief privacy notice explaining the passcode is a personal gate
**Plans**: 2 plans

Plans:
- [x] 04-01-PLAN.md — Passcode gate flow, session lock, and privacy notice
- [x] 04-02-PLAN.md — Add root proxy gate artifact for verification

### Phase 5: PWA Install + Offline Shell
**Goal**: Users can install and launch the app as a private PWA
**Depends on**: Phase 4
**Requirements**: PWA-01, PWA-02, PWA-03
**Success Criteria** (what must be TRUE):
  1. User can install the app on iPhone and desktop with correct name/icon and standalone launch
  2. App launches to a cached shell when offline
  3. User can view iOS Add to Home Screen guidance from within the app
**Plans**: 1 plan

Plans:
- [x] 05-01-PLAN.md — PWA manifest, offline shell, and iOS install guidance

## Progress

**Execution Order:**
Phases execute in numeric order: 4 → 4.1 → 4.2 → 5 → 5.1 → 5.2

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 4. Private Access Gate | 2/2 | Complete | 2026-02-13 |
| 5. PWA Install + Offline Shell | 1/1 | Complete | 2026-02-13 |
