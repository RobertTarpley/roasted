# Feature Research

**Domain:** Coffee roasting timer + green coffee inventory (single-user, iPhone-first)
**Researched:** 2026-02-12
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Roast timer with phase splits (drying/maillard/development) | Roast software commonly shows phase timing and development windows | MEDIUM | Use a timer + manual phase markers aligned to first crack and drop; show phase % and times. Cropster includes modulation timer and auto-marking events. |
| Event markers: first crack, color change, drop/end | Roast profiling tools record key events during a roast | LOW | Provide quick buttons and timestamps; keep editable for corrections. Cropster supports auto-mark events and roast curve notes. |
| Roast log with notes and roast level | Roasters expect to capture roast notes tied to a batch | LOW | Free-text notes + roast level/target; keep lightweight. |
| Start/end weights with roast loss % | Standard roast tracking includes weight loss | LOW | Input grams; compute loss %, retain green weight for inventory deduction. Cropster tracks pre/post-roast weights and weight loss. |
| Coffee catalog + lot selection | Roasts are tied to a specific coffee/lot | MEDIUM | Coffee records include origin, process, lot name, bag size, and green weight. |
| Green inventory tracking (weights, adjustments) | Inventory management is core to roasting operations | MEDIUM | Track pounds for stock, convert from gram roast inputs; adjust for deliveries/usage. Cropster highlights green inventory management and reporting. |
| Roast history list + basic filters | Users need to find past roasts quickly | LOW | Filter by coffee/lot, date, roast level. |
| Offline-first data capture | Roasting spaces often have spotty connectivity | MEDIUM | Local-first storage with background sync; Cropster highlights offline functionality for roasting intelligence. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Inventory auto-deduction per roast (gram -> pound conversions) | Removes manual stock math and keeps green inventory accurate | MEDIUM | Compute usage from roast weight + loss, convert units, update lot. Cropster auto-updates inventory from roasting. |
| Quick-repeat roast templates | Reduces setup time for repeat batches | MEDIUM | Save default phase targets, events, and notes per coffee/lot. |
| Roast comparison view (phase times + loss %) | Helps users iterate and dial in roasts | MEDIUM | Compare 2-3 roasts by phase timing and loss %, not full curves. Cropster supports roast compare reports. |
| Low-inventory alerts per coffee | Prevents running out and supports planning | LOW | Thresholds in pounds; optional notifications. Cropster provides inventory level alerts. |
| Batch yield planner (desired roasted output -> green input) | Simplifies production planning for small roasters | MEDIUM | Use loss % history to estimate required green weight. Cropster offers batch calculation tools and output planning. |
| Photo capture of green/roast labels | Speeds manual labeling and visual recall | LOW | Attach photos to coffee and roast records. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Hardware integration for real-time temperature curves | Perceived as "pro" roasting software | High device variability, setup/support burden for single-user app | Manual timers + event markers; keep space for future integrations. |
| Multi-user roles and permissions | Teams want shared access | Adds complexity for a single-user tool and iPhone-first UX | Single-account with optional export/share of roast logs. |
| Full e-commerce order and fulfillment management | Some products bundle it (e.g., production + order mgmt) | Scope creep and domain mismatch for a timer/inventory tool | Keep inventory per coffee and export data; integrate later if needed. |
| Enterprise-grade traceability and compliance audits | Seen in large roastery platforms | Complex workflows, low value for single-user MVP | Simple lot history and notes; avoid compliance features. |

## Feature Dependencies

```
Roast Timer
    └──requires──> Coffee Catalog / Lots
                   └──requires──> Inventory Tracking (green weight per lot)

Roast Loss %
    └──requires──> Start/End Weights

Inventory Auto-Deduction
    └──requires──> Roast Loss % + Inventory Tracking

Batch Yield Planner
    └──requires──> Roast Loss % History

Roast Comparison
    └──requires──> Roast History + Phase Split Data
```

### Dependency Notes

- **Roast Timer requires Coffee Catalog/Lots:** Each roast must link to a specific coffee to keep notes and inventory consistent.
- **Inventory Auto-Deduction requires Roast Loss % + Inventory Tracking:** Deducting green weight needs accurate usage and unit conversion.
- **Batch Yield Planner requires Roast Loss % History:** Estimates depend on historical loss for the same coffee/lot.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] Roast timer with phase splits and event markers — core roasting workflow.
- [ ] Roast log with notes, roast level, start/end weights, loss % — captures the essential roast record.
- [ ] Coffee catalog + green inventory in pounds, roast weights in grams — ties roasts to lots and tracks stock.

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Inventory auto-deduction per roast — remove manual stock adjustments.
- [ ] Roast comparison view — supports iterative dialing in.

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Batch yield planner — depends on enough historical data.
- [ ] Low-inventory alerts — valuable but not critical for MVP.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Roast timer + phase splits + events | HIGH | MEDIUM | P1 |
| Roast log + notes + roast level + weights | HIGH | LOW | P1 |
| Coffee catalog + inventory | HIGH | MEDIUM | P1 |
| Inventory auto-deduction | HIGH | MEDIUM | P2 |
| Roast comparison view | MEDIUM | MEDIUM | P2 |
| Batch yield planner | MEDIUM | MEDIUM | P3 |
| Low-inventory alerts | MEDIUM | LOW | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Competitor A | Competitor B | Our Approach |
|---------|--------------|--------------|--------------|
| Roast profiling with event markers | Cropster Roast: real-time data, roast profiling, auto-mark events | Artisan: roasting software with automation and device support | Manual timer + event markers optimized for mobile use. |
| Inventory management | Cropster Roast/Origin: green inventory management, lot tracking | Cropster Commerce: inventory planning and traceability | Lightweight per-lot inventory with gram/pound conversions. |
| Roast comparison/analysis | Cropster: roast compare reports and profile analysis | Artisan: replay/automation focus | Simple phase-time and loss % comparisons. |

## Sources

- https://www.cropster.com/products/roast/features/ (roast profiling, event markers, weights, inventory integration)
- https://www.cropster.com/products/commerce/ (inventory planning, traceability)
- https://www.cropster.com/products/origin/features/ (inventory management capabilities)
- https://artisan-scope.org/ (roasting software ecosystem)

---
*Feature research for: coffee roasting timer + green coffee inventory*
*Researched: 2026-02-12*
