# Roast Timer

## What This Is

A mobile-friendly app to time coffee roasts, log key roast splits, and save roast history with notes. It also tracks green coffee inventory so each roast is tied to a specific coffee and usage is recorded.

## Core Value

Make it effortless to time a roast and capture the key metrics and notes so I can track results over time.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Roast timer with split phases (overall, development, cooling) and saved metrics
- [ ] Green coffee inventory with per-roast usage tracking
- [ ] Roast history with notes, roast level, and roast yield %

### Out of Scope

- Multi-user accounts or sharing — single-user tool for now
- App Store distribution — prefer mobile-friendly web app initially
- Advanced analytics or automation — keep to basic tracking in v1

## Context

- Primary use on iPhone; open to a mobile-friendly web app to avoid App Store overhead
- Roast flow includes a split timer at first crack, then another split at bean dump to track cooling
- Inventory is stored in pounds but roast inputs are captured in grams

## Constraints

- **Platform**: Must be usable on iPhone — web app is acceptable
- **Units**: Inventory in pounds; roast input/output weights in grams
- **Scope**: Single user; no collaboration features

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Mobile-friendly web app for v1 | Avoid App Store friction while still working on iPhone | — Pending |

---
*Last updated: 2026-02-12 after initialization*
