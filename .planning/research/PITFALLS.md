# Pitfalls Research

**Domain:** Coffee roasting timer + green coffee inventory app
**Researched:** 2026-02-12
**Confidence:** LOW

## Critical Pitfalls

### Pitfall 1: Ambiguous roast events and phase boundaries

**What goes wrong:**
Roast logs are inconsistent because first crack, drop/dump, and cooling start are captured differently between sessions, making phase timing and comparisons unreliable.

**Why it happens:**
Developers treat phase changes as informal notes instead of explicit, timestamped events in a state machine.

**How to avoid:**
Define a strict event model: charge/start, first crack start, drop/dump, cooling start, cooling end. Store each as a timestamp and derive phase durations from those timestamps.

**Warning signs:**
Users ask to edit or clarify roast phases after the fact; phase durations do not sum to total roast time.

**Phase to address:**
Phase 1 - Core timer and roast logging.

---

### Pitfall 2: Unit mismatch between inventory and roast inputs

**What goes wrong:**
Inventory drifts because green coffee is tracked in pounds while roast inputs/outputs are recorded in grams, causing conversion errors and rounding loss.

**Why it happens:**
Separate parts of the app use different canonical units without a shared conversion rule or rounding policy.

**How to avoid:**
Store all weights in a single canonical unit (grams) in the data model; convert only at the UI layer with fixed rounding rules and precision.

**Warning signs:**
Inventory totals do not reconcile with physical stock; negative inventory appears after a few roasts.

**Phase to address:**
Phase 2 - Inventory modeling and linking roasts to coffees.

---

### Pitfall 3: Roast loss percentage calculated from the wrong base

**What goes wrong:**
Roast loss percent is inconsistent or misleading because it uses roasted weight as the denominator, or does not account for tare/container weight.

**Why it happens:**
The formula is not defined explicitly, and inputs are accepted without tare or measurement guidance.

**How to avoid:**
Define roast loss as (green_weight - roasted_weight) / green_weight. Require or guide tare handling and show the formula inline when entering weights.

**Warning signs:**
Loss % varies wildly for the same coffee; users report negative or extremely high loss values.

**Phase to address:**
Phase 1 - Roast data capture and validation.

---

### Pitfall 4: Inventory modeled only as a single total per coffee

**What goes wrong:**
Roasts cannot be traced to a specific purchase or lot, and inventory adjustments are hard to audit.

**Why it happens:**
Inventory is simplified to one number per coffee without lot/bag context or adjustment history.

**How to avoid:**
Model green inventory as lots (purchase date, vendor, weight, price) and consume lots when a roast is logged. Record adjustments as explicit events.

**Warning signs:**
Users cannot answer "which bag did I roast?" or "why did inventory drop?"

**Phase to address:**
Phase 2 - Inventory model and roast linkage.

---

### Pitfall 5: Timer accuracy breaks in mobile background

**What goes wrong:**
Roast timers drift or pause when the web app is backgrounded or the screen locks, causing inaccurate phase timings.

**Why it happens:**
Mobile browsers throttle timers; developers rely on setInterval alone without persisting timestamps.

**How to avoid:**
Persist start time and phase event timestamps; compute elapsed time from system time, not timer ticks. Provide a loud, manual "event" UI instead of relying on precise background timing.

**Warning signs:**
Elapsed time jumps forward or backward after unlocking the phone; users re-enter times manually.

**Phase to address:**
Phase 1 - Timer implementation and resilience.

---

### Pitfall 6: Cooling phase treated as a note, not a timed phase

**What goes wrong:**
Cooling duration is missing or inconsistent, and roast logs cannot compare total process time across roasts.

**Why it happens:**
Cooling is optional in the UI, and there is no explicit "cooling start" event.

**How to avoid:**
Include cooling as a first-class phase with its own start/end timestamps and default prompts after drop.

**Warning signs:**
Most logs show roast end but no cooling duration; cooling is entered as free text.

**Phase to address:**
Phase 1 - Timer flow and event model.

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Store weights as strings with units | Quick UI rendering | Parsing errors and unit drift | Never |
| Hardcode phase names and order | Fast MVP | Cannot support custom phases or edits | MVP only, if phase editing planned |
| Allow free-text weight fields | Faster data entry | Invalid numbers and broken analytics | Never |
| Skip inventory adjustments log | Less UI | No audit trail or reconciliation | MVP only for single user, but add soon |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| CSV import/export | Inconsistent units or missing headers | Standardize columns in grams and include unit column |
| Cloud backup (iCloud/Drive) | Silent failure or partial sync | Explicit export confirmation and versioned backups |
| Device notifications | Assuming notifications fire in background | Provide manual timers and in-app alerts when foregrounded |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading all roasts at once | Slow list and search | Paginate and lazy load | 1,000+ roasts |
| Rendering charts on every keystroke | Lag during note entry | Debounce and memoize | 200+ data points |
| Inventory recompute on every edit | Sluggish UI | Incremental updates | 500+ inventory events |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Sharing export files without redaction | Accidental disclosure of vendor pricing and notes | Offer "safe export" without cost fields |
| Storing backups unencrypted | Data exposure if device shared | Encrypt exports or require passcode |
| Public share links for roast logs | Unintentional public data | Default to private and require explicit share |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Timer UI hides critical events | Missed first crack logging | Large, single-tap event buttons |
| Weight entry expects grams everywhere | Confusion for inventory in pounds | Explicit unit toggle and auto conversion |
| No quick edit for event timestamps | Users abandon logging | Allow post-roast edits with audit note |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Roast log:** Has first crack and drop times and derived phase durations
- [ ] **Roast loss:** Uses green weight as base and accounts for tare
- [ ] **Inventory:** Lot-level tracking with adjustment history and roast linkage
- [ ] **Timer:** Resilient to backgrounding with persisted timestamps

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Ambiguous phase events | MEDIUM | Add an edit mode to set missing events and re-derive phases |
| Unit mismatch | MEDIUM | Normalize all stored weights to grams via one-time migration |
| Wrong roast loss formula | LOW | Recalculate loss for all roasts using corrected formula |
| Inventory drift | HIGH | Add a reconciliation flow with physical count and adjustment event |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Ambiguous roast events | Phase 1 | Phase durations sum to total and can be edited |
| Unit mismatch | Phase 2 | Inventory totals match physical count after conversion |
| Roast loss formula errors | Phase 1 | Loss % computed from green weight with visible formula |
| Inventory modeled as total only | Phase 2 | Roasts reference specific lots and have adjustment logs |
| Background timer drift | Phase 1 | Elapsed time stays accurate after lock/unlock tests |
| Cooling not timed | Phase 1 | Cooling phase appears in every roast log |

## Sources

- https://en.wikipedia.org/wiki/Coffee_roasting (process overview, first crack concept, roast mass loss; MEDIUM confidence)
- https://library.sweetmarias.com/coffee-roasting/ (roasting basics and terminology; LOW confidence)
- Personal experience with timer and inventory tooling in small roasting workflows (LOW confidence)

---
*Pitfalls research for: coffee roasting timer + green coffee inventory app*
*Researched: 2026-02-12*
