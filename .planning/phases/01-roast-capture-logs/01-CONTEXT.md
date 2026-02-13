# Phase 1: Roast Capture + Logs - Context

**Gathered:** 2026-02-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Time a roast with phase splits and save complete roast records (notes, roast level, weights, yield %). No inventory, history filters, or comparisons in this phase.

</domain>

<decisions>
## Implementation Decisions

### Timer screen flow
- Full-screen timer layout with minimal chrome
- Bottom-center sticky Start/Stop button
- Timer shows total time plus all phase durations once they exist, with placeholders before
- Split timers (development and cooling) count up live once started
- Controls must not obstruct split timers in mobile view
- Two-tier controls: Start/Stop primary, First Crack/Drop secondary

### Event markers
- Only two marker buttons: First Crack and Drop/Bean Dump
- Markers are not editable; delete and re-add only
- Marker list is compact under the timer, newest on top
- Tapping a marker jumps the display to show elapsed time at that marker

### Roast log capture
- Required fields to save: roast level + green weight + roasted weight
- Notes are optional and free-text only
- Roast level options: Light / Medium / Dark
- Green weight entered before roast; roasted weight entered after roast
- Roast level captured at end of roast alongside roasted weight

### Save/confirmation
- Flow: Stop ends cooling → enter roasted weight → review screen with Save or Discard
- Discard requires a second confirmation; if confirmed, nothing is saved
- After save, user returns to timer (reset state)
- “Delete last roast” action available in history (undo pattern)

### Claude's Discretion
- Exact placement/visual design of marker list and placeholders
- Wording of confirmation prompts

</decisions>

<specifics>
## Specific Ideas

- Show placeholders for phase durations before they exist

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-roast-capture-logs*
*Context gathered: 2026-02-12*
