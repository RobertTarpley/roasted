# Phase 4: Private Access Gate - Context

**Gathered:** 2026-02-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can privately access the app behind a passcode gate, with session-based unlocking and a brief privacy notice. No new capabilities beyond the gate.

</domain>

<decisions>
## Implementation Decisions

### Passcode entry UX
- Full-screen modal before any app UI is shown
- Single password field (not PIN keypad)
- Show app branding with a short line ("Private Roast Timer")
- Include a "show passcode" toggle

### Unlock persistence
- Unlock persists for the browser session only (until tab/window is closed)
- No manual lock action
- Re-locks on tab close (no inactivity timer)
- Unlock applies to all tabs in the same browser session

### Failure handling
- No lockout; unlimited retries
- Error message: "Incorrect passcode"
- Clear the passcode field after a failed attempt
- Allow paste into the passcode field

### Privacy notice
- Show on the passcode screen only

### Claude's Discretion
- Exact layout, spacing, and visual styling within existing design language
- Error state styling and animation

</decisions>

<specifics>
## Specific Ideas

- "Private Roast Timer" line on the gate screen

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-private-access-gate*
*Context gathered: 2026-02-13*
