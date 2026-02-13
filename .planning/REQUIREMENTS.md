# Requirements: Roast Timer

**Defined:** 2026-02-13
**Core Value:** Make it effortless to time a roast and capture the key metrics and notes so I can track results over time.

## v1 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### Access Gate

- [ ] **ACCESS-01**: User must enter a passcode before any app content is shown
- [ ] **ACCESS-02**: Passcode is validated using a server-side env var (no client-visible secret)
- [ ] **ACCESS-03**: User can lock the app and the unlock persists for the current session

### PWA Install

- [ ] **PWA-01**: App is installable as a PWA on iPhone and desktop (manifest + icons)
- [ ] **PWA-02**: App loads offline to a cached app shell
- [ ] **PWA-03**: App provides iOS Add to Home Screen guidance

### Private Use Guidance

- [ ] **PRIV-01**: App displays a brief privacy notice explaining the passcode is a personal gate

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Security

- **SEC-01**: User can log in with email/password
- **SEC-02**: App encrypts stored roast data with a user-managed key

### Sync

- **SYNC-01**: Roasts sync across devices

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Multi-user accounts | Personal tool by design |
| Public sharing | Not needed for private use |
| App Store distribution | PWA install preferred for now |
| Enterprise security/compliance | Out of scope for personal prototype |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ACCESS-01 | Phase 4 | Pending |
| ACCESS-02 | Phase 4 | Pending |
| ACCESS-03 | Phase 4 | Pending |
| PWA-01 | Phase 5 | Pending |
| PWA-02 | Phase 5 | Pending |
| PWA-03 | Phase 5 | Pending |
| PRIV-01 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0

---
*Requirements defined: 2026-02-13*
*Last updated: 2026-02-13 after v1.0 Private PWA requirements*
