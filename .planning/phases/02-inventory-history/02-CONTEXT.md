# Phase 2: Inventory + History - Context

**Gathered:** 2026-02-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Manage green coffee lots with inventory in pounds, connect each roast to a lot, auto-deduct inventory using green weight (grams), and enable history filtering by coffee/lot, date, and roast level. No roast comparison or analytics beyond filters in this phase.

</domain>

<decisions>
## Implementation Decisions

### Inventory model
- Coffee record fields: Name (required; typically farm/producer), Origin (optional; country), Process (required: Natural, Washed, Honey/Pulped Natural, Experimental, Other)
- Lots are created under a coffee record with a lot name/label and starting inventory (lbs)
- Inventory is tracked in pounds with decimal precision; grams convert to pounds using 1 lb = 453.592 g

### Inventory adjustments
- User can add adjustments for purchases or corrections
- Each adjustment records: lot, amount (+/- lbs), and reason (purchase or correction)
- Adjustments update current inventory immediately and are visible in lot detail

### Roast linkage
- Pre-roast flow requires selecting a lot for each roast
- Selected lot appears in history and on the saved roast record
- Saving a roast auto-deducts green weight from the selected lot

### History filters
- Filters include: coffee/lot (single select), date range (start/end optional), and roast level
- Filters are optional; default history shows all roasts

### Claude's Discretion
- Exact UI layout for lot management and adjustment entry
- Empty-state and validation copy

</decisions>

<specifics>
## Specific Ideas

- Use a simple inventory screen with a list of coffees and their lots
- Place filters at the top of the history screen with a clear-reset action

</specifics>

<deferred>
## Deferred Ideas

- Low-inventory alerts
- Lot-level analytics or projections

</deferred>

---

*Phase: 02-inventory-history*
*Context gathered: 2026-02-12*
