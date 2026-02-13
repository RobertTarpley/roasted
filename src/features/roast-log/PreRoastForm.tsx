"use client";

import { liveQuery } from "dexie";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { listCoffees } from "@/data/coffees";
import { listLots } from "@/data/lots";
import { type Coffee, type Lot } from "@/domain/inventory/types";
import { useTimerStore } from "@/features/timer/timerStore";

const PreRoastSchema = z.object({
  selectedLotId: z.number().positive("Select a lot before starting this roast."),
  greenWeightGrams: z.number().positive("Green weight must be greater than 0."),
});

type PreRoastErrors = {
  selectedLotId?: string;
  greenWeightGrams?: string;
};

export const PreRoastForm = () => {
  const beginRoast = useTimerStore((state) => state.beginRoast);
  const cancelPreRoast = useTimerStore((state) => state.cancelPreRoast);
  const selectedLotId = useTimerStore((state) => state.selectedLotId);
  const setSelectedLotId = useTimerStore((state) => state.setSelectedLotId);

  const [greenWeight, setGreenWeight] = useState("");
  const [errors, setErrors] = useState<PreRoastErrors>({});
  const [lots, setLots] = useState<Lot[]>([]);
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const subscription = liveQuery(() => listLots()).subscribe({
      next: (results) => {
        setLots(results);
        setLoadError(null);
      },
      error: (error) => {
        console.error(error);
        setLoadError("Unable to load lots.");
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = liveQuery(() => listCoffees()).subscribe({
      next: (results) => {
        setCoffees(results);
      },
      error: (error) => {
        console.error(error);
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  const lotOptions = useMemo(() => {
    const coffeeMap = new Map(coffees.map((coffee) => [coffee.id, coffee]));

    return lots
      .filter((lot) => lot.id != null)
      .map((lot) => {
        const coffee = coffeeMap.get(lot.coffeeId);
        return {
          id: lot.id as number,
          label: `${coffee?.name ?? "Unknown coffee"} — ${lot.label}`,
        };
      });
  }, [coffees, lots]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const greenWeightGrams = Number(greenWeight);
    const resolvedLotId = selectedLotId ?? Number.NaN;

    const result = PreRoastSchema.safeParse({
      selectedLotId: resolvedLotId,
      greenWeightGrams,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        selectedLotId: fieldErrors.selectedLotId?.[0],
        greenWeightGrams: fieldErrors.greenWeightGrams?.[0],
      });
      return;
    }

    setErrors({});
    beginRoast(result.data);
  };

  return (
    <section className="mt-10 rounded-[32px] border border-[#eadfce] bg-white/90 px-6 py-6 shadow-[0_18px_50px_-36px_rgba(44,34,24,0.6)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#8f7d6a]">
            Pre-roast check
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#2c2218]">
            Add roast details
          </h2>
        </div>
        <button
          type="button"
          onClick={cancelPreRoast}
          className="text-xs uppercase tracking-[0.2em] text-[#8f7d6a] transition hover:text-[#2c2218]"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
            Lot selection
          </span>
          <select
            value={selectedLotId?.toString() ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              const nextValue = value ? Number(value) : null;
              setSelectedLotId(Number.isNaN(nextValue) ? null : nextValue);
            }}
            className="h-12 rounded-2xl border border-[#e0d3c3] bg-white px-4 text-base text-[#2c2218] shadow-sm focus:border-[#2c2218] focus:outline-none"
          >
            <option value="">Select a lot</option>
            {lotOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          {loadError ? (
            <p className="text-sm text-[#b5542f]">{loadError}</p>
          ) : null}
          {errors.selectedLotId ? (
            <p className="text-sm text-[#b5542f]">{errors.selectedLotId}</p>
          ) : null}
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
            Green weight (grams)
          </span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={greenWeight}
            onChange={(event) => setGreenWeight(event.target.value)}
            className="h-12 rounded-2xl border border-[#e0d3c3] bg-white px-4 text-base text-[#2c2218] shadow-sm focus:border-[#2c2218] focus:outline-none"
            placeholder="e.g. 350"
          />
          {errors.greenWeightGrams ? (
            <p className="text-sm text-[#b5542f]">{errors.greenWeightGrams}</p>
          ) : null}
        </label>

        <button
          type="submit"
          className="h-12 rounded-full bg-[#2c2218] text-sm font-semibold uppercase tracking-[0.18em] text-[#f7f2ea] transition hover:bg-[#20170f]"
        >
          Start roast
        </button>
      </form>
    </section>
  );
};
