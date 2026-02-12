"use client";

import { liveQuery } from "dexie";
import { useEffect, useMemo, useState } from "react";

import { listCoffees } from "@/data/coffees";
import { listLots } from "@/data/lots";
import { saveRoast } from "@/data/roasts";
import { type Coffee, type Lot } from "@/domain/inventory/types";
import { derivePhaseTimes, deriveYieldPercent } from "@/domain/roast-session/derive";
import { RoastEvent } from "@/domain/roast-session/types";
import { useTimerStore } from "@/features/timer/timerStore";
import { formatElapsedMsOrPlaceholder } from "@/shared/format/time";

const getEventTimestamp = (events: RoastEvent[], type: RoastEvent["type"]) =>
  events.find((event) => event.type === type)?.at ?? null;

const formatYield = (yieldPercent: number | null) => {
  if (yieldPercent == null) {
    return "--";
  }

  return `${yieldPercent.toFixed(1)}%`;
};

export const ReviewScreen = () => {
  const events = useTimerStore((state) => state.events);
  const roastLevel = useTimerStore((state) => state.roastLevel);
  const greenWeightGrams = useTimerStore((state) => state.greenWeightGrams);
  const roastedWeightGrams = useTimerStore((state) => state.roastedWeightGrams);
  const selectedLotId = useTimerStore((state) => state.selectedLotId);
  const notes = useTimerStore((state) => state.notes);
  const setNotes = useTimerStore((state) => state.setNotes);
  const resetSession = useTimerStore((state) => state.resetSession);

  const [discardArmed, setDiscardArmed] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lots, setLots] = useState<Lot[]>([]);
  const [coffees, setCoffees] = useState<Coffee[]>([]);

  useEffect(() => {
    const subscription = liveQuery(() => listLots()).subscribe({
      next: (results) => setLots(results),
      error: (error) => console.error(error),
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = liveQuery(() => listCoffees()).subscribe({
      next: (results) => setCoffees(results),
      error: (error) => console.error(error),
    });

    return () => subscription.unsubscribe();
  }, []);

  const phaseTimes = useMemo(() => derivePhaseTimes(events), [events]);
  const yieldPercent = useMemo(() => {
    if (greenWeightGrams == null || roastedWeightGrams == null) {
      return null;
    }

    return deriveYieldPercent(greenWeightGrams, roastedWeightGrams);
  }, [greenWeightGrams, roastedWeightGrams]);

  const selectedLotLabel = useMemo(() => {
    if (selectedLotId == null) {
      return "--";
    }

    const lotMap = new Map(lots.map((lot) => [lot.id, lot]));
    const coffeeMap = new Map(coffees.map((coffee) => [coffee.id, coffee]));
    const lot = lotMap.get(selectedLotId);

    if (!lot) {
      return "Unknown lot";
    }

    const coffee = coffeeMap.get(lot.coffeeId);
    return `${coffee?.name ?? "Unknown coffee"} — ${lot.label}`;
  }, [coffees, lots, selectedLotId]);

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    if (
      roastLevel == null ||
      greenWeightGrams == null ||
      roastedWeightGrams == null
    ) {
      setSaveError("Missing roast details. Please restart the roast.");
      return;
    }

    if (selectedLotId == null) {
      setSaveError("Select a lot before saving this roast.");
      return;
    }

    const startedAt = getEventTimestamp(events, "START");
    const endedAt = getEventTimestamp(events, "STOP");
    const computedYield = deriveYieldPercent(greenWeightGrams, roastedWeightGrams);

    if (startedAt == null || endedAt == null || computedYield == null) {
      setSaveError("Missing timer data. Please restart the roast.");
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    try {
      await saveRoast({
        lotId: selectedLotId,
        startedAt,
        endedAt,
        roastLevel,
        greenWeightGrams,
        roastedWeightGrams,
        yieldPercent: computedYield,
        notes: notes.trim() ? notes.trim() : undefined,
        events,
      });
      resetSession();
    } catch (error) {
      console.error(error);
      setSaveError("Failed to save roast. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (!discardArmed) {
      setDiscardArmed(true);
      return;
    }

    resetSession();
  };

  return (
    <section className="mt-10 rounded-[36px] border border-[#eadfce] bg-white/90 px-6 py-8 shadow-[0_24px_60px_-40px_rgba(44,34,24,0.7)]">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#8f7d6a]">
          Review
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#2c2218]">
          Roast summary
        </h2>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#eadfce] bg-white/80 px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#9a8774]">
            Roast level
          </p>
          <p className="mt-2 text-lg font-semibold text-[#2c2218]">
            {roastLevel ?? "--"}
          </p>
        </div>
        <div className="rounded-2xl border border-[#eadfce] bg-white/80 px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#9a8774]">
            Lot
          </p>
          <p className="mt-2 text-base font-semibold text-[#2c2218]">
            {selectedLotLabel}
          </p>
        </div>
        <div className="rounded-2xl border border-[#eadfce] bg-white/80 px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#9a8774]">
            Yield %
          </p>
          <p className="mt-2 text-lg font-semibold text-[#2c2218]">
            {formatYield(yieldPercent)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#eadfce] bg-white/80 px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#9a8774]">
            Total
          </p>
          <p className="mt-2 text-lg font-semibold">
            {formatElapsedMsOrPlaceholder(phaseTimes.totalMs)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#eadfce] bg-white/80 px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#9a8774]">
            Development
          </p>
          <p className="mt-2 text-lg font-semibold">
            {formatElapsedMsOrPlaceholder(phaseTimes.developmentMs)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#eadfce] bg-white/80 px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#9a8774]">
            Cooling
          </p>
          <p className="mt-2 text-lg font-semibold">
            {formatElapsedMsOrPlaceholder(phaseTimes.coolingMs)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#eadfce] bg-white/80 px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#9a8774]">
            Green weight
          </p>
          <p className="mt-2 text-lg font-semibold">
            {greenWeightGrams != null ? `${greenWeightGrams} g` : "--"}
          </p>
        </div>
        <div className="rounded-2xl border border-[#eadfce] bg-white/80 px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#9a8774]">
            Roasted weight
          </p>
          <p className="mt-2 text-lg font-semibold">
            {roastedWeightGrams != null ? `${roastedWeightGrams} g` : "--"}
          </p>
        </div>
      </div>

      <label className="mt-6 flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
          Notes (optional)
        </span>
        <textarea
          rows={4}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Aroma, color, any tweaks for next time..."
          className="rounded-2xl border border-[#e0d3c3] bg-white px-4 py-3 text-sm text-[#2c2218] shadow-sm focus:border-[#2c2218] focus:outline-none"
        />
      </label>

      {saveError ? (
        <p className="mt-3 text-sm text-[#b5542f]">{saveError}</p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="h-12 flex-1 rounded-full bg-[#2c2218] text-sm font-semibold uppercase tracking-[0.18em] text-[#f7f2ea] transition hover:bg-[#20170f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save roast"}
        </button>
        <button
          type="button"
          onClick={handleDiscard}
          className={`h-12 flex-1 rounded-full border text-sm font-semibold uppercase tracking-[0.18em] transition ${
            discardArmed
              ? "border-[#b5542f] bg-[#b5542f] text-white hover:bg-[#a34927]"
              : "border-[#c8b8a5] text-[#2c2218] hover:bg-[#f5efe6]"
          }`}
        >
          {discardArmed ? "Confirm discard" : "Discard"}
        </button>
      </div>
    </section>
  );
};
