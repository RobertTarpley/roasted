---
status: resolved
trigger: "Investigate issue: build-type-errors"
created: 2026-02-13T21:31:05Z
updated: 2026-02-13T21:32:40Z
---

## Current Focus

hypothesis: MarkerList filter does not narrow RoastEventType, so marker.type stays RoastEventType and fails FocusedEventId
test: Run `npm run build`
expecting: Build completes without the MarkerList type error
next_action: Run `npm run build` to verify

## Symptoms

expected: Build completes with no errors
actual: Build fails with TypeScript errors
errors: ./src/features/timer/MarkerList.tsx:53:42 Type error: Argument of type 'RoastEventType' is not assignable to parameter of type 'FocusedEventId'. Type '"START"' is not assignable to type 'FocusedEventId'.
reproduction: Run `npm run build`
started: Started when pushing to Vercel; now reproducible locally

## Eliminated

## Evidence

- timestamp: 2026-02-13T21:31:40Z
  checked: src/features/timer/MarkerList.tsx
  found: markers array is filtered by type but inferred as RoastEvent[], so marker.type remains RoastEventType
  implication: focusMarker(marker.type) can be "START"/"STOP" in types, causing mismatch
- timestamp: 2026-02-13T21:31:40Z
  checked: src/features/timer/timerStore.ts
  found: FocusedEventId is "FIRST_CRACK" | "DROP" | null
  implication: marker.type must be narrowed to the marker-only union to satisfy focusMarker/deleteMarker

## Resolution

root_cause: "MarkerList filters marker events without a type guard, so marker.type remains RoastEventType and fails FocusedEventId expectations"
fix: "Added a marker event type guard so the filtered list narrows to FIRST_CRACK/DROP"
verification: "npm run build completed successfully"
files_changed:
  - "src/features/timer/MarkerList.tsx"
