"use client";

import { useMemo } from "react";

import type { RoastEvent } from "@/domain/roast-session/types";

import { formatElapsedMs } from "@/shared/format/time";

import { useTimerStore } from "@/features/timer/timerStore";

const markerLabels: Record<"FIRST_CRACK" | "DROP", string> = {
  FIRST_CRACK: "First Crack",
  DROP: "Drop",
};

const isMarkerEvent = (
  event: RoastEvent
): event is RoastEvent & { type: "FIRST_CRACK" | "DROP" } =>
  event.type === "FIRST_CRACK" || event.type === "DROP";

export const MarkerList = () => {
  const events = useTimerStore((state) => state.events);
  const startAt = useTimerStore((state) => state.startAt);
  const focusedEventId = useTimerStore((state) => state.focusedEventId);
  const focusMarker = useTimerStore((state) => state.focusMarker);
  const deleteMarker = useTimerStore((state) => state.deleteMarker);

  const markers = useMemo(() => {
    return events
      .filter(isMarkerEvent)
      .slice()
      .sort((a, b) => b.at - a.at);
  }, [events]);

  if (markers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#d9cabb] bg-white/60 px-4 py-6 text-center text-sm text-[#9a8774]">
        No markers yet. Add First Crack or Drop.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {markers.map((marker) => {
        const elapsed = startAt != null ? marker.at - startAt : 0;
        const isFocused = focusedEventId === marker.type;

        return (
          <div
            key={marker.type}
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
              isFocused
                ? "border-[#b5542f] bg-[#fff5ef]"
                : "border-[#e0d3c3] bg-white/80"
            }`}
          >
            <button
              type="button"
              onClick={() => focusMarker(marker.type)}
              className="flex flex-1 flex-col text-left"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-[#9a8774]">
                {markerLabels[marker.type]}
              </p>
              <p className="text-lg font-semibold text-[#2c2218]">
                {formatElapsedMs(elapsed)}
              </p>
            </button>
            <button
              type="button"
              onClick={() => deleteMarker(marker.type)}
              className="rounded-full border border-[#d8c6b5] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#8a7360] transition hover:bg-[#f5efe6]"
            >
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
};
