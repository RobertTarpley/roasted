"use client";

import { type FormEvent, useState } from "react";
import { z } from "zod";

import { useTimerStore } from "@/features/timer/timerStore";

const PreRoastSchema = z.object({
  greenWeightGrams: z.number().positive("Green weight must be greater than 0."),
});

type PreRoastErrors = {
  greenWeightGrams?: string;
};

export const PreRoastForm = () => {
  const beginRoast = useTimerStore((state) => state.beginRoast);
  const cancelPreRoast = useTimerStore((state) => state.cancelPreRoast);

  const [greenWeight, setGreenWeight] = useState("");
  const [errors, setErrors] = useState<PreRoastErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const greenWeightGrams = Number(greenWeight);

    const result = PreRoastSchema.safeParse({ greenWeightGrams });

    if (!result.success) {
      const fieldErrors = result.error.formErrors.fieldErrors;
      setErrors({
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
