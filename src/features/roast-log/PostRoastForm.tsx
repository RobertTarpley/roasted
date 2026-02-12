"use client";

import { type FormEvent, useState } from "react";

import { RoastWeightsSchema } from "@/domain/roast-session/validation";
import { useTimerStore } from "@/features/timer/timerStore";

type PostRoastErrors = {
  roastedWeightGrams?: string;
  general?: string;
};

export const PostRoastForm = () => {
  const greenWeightGrams = useTimerStore((state) => state.greenWeightGrams);
  const recordPostRoast = useTimerStore((state) => state.recordPostRoast);

  const [roastedWeight, setRoastedWeight] = useState("");
  const [errors, setErrors] = useState<PostRoastErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (greenWeightGrams == null) {
      setErrors({ general: "Missing green weight. Please restart the roast." });
      return;
    }

    const roastedWeightGrams = Number(roastedWeight);
    const result = RoastWeightsSchema.safeParse({
      greenWeightGrams,
      roastedWeightGrams,
    });

    if (!result.success) {
      const fieldErrors = result.error.formErrors.fieldErrors;
      setErrors({
        roastedWeightGrams: fieldErrors.roastedWeightGrams?.[0],
      });
      return;
    }

    setErrors({});
    recordPostRoast({ roastedWeightGrams: result.data.roastedWeightGrams });
  };

  return (
    <section className="mt-10 rounded-[32px] border border-[#eadfce] bg-white/90 px-6 py-6 shadow-[0_18px_50px_-36px_rgba(44,34,24,0.6)]">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#8f7d6a]">
          Post-roast
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#2c2218]">
          Record roasted weight
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
            Roasted weight (grams)
          </span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={roastedWeight}
            onChange={(event) => setRoastedWeight(event.target.value)}
            className="h-12 rounded-2xl border border-[#e0d3c3] bg-white px-4 text-base text-[#2c2218] shadow-sm focus:border-[#2c2218] focus:outline-none"
            placeholder="e.g. 290"
          />
          {errors.roastedWeightGrams ? (
            <p className="text-sm text-[#b5542f]">{errors.roastedWeightGrams}</p>
          ) : null}
        </label>

        {errors.general ? (
          <p className="text-sm text-[#b5542f]">{errors.general}</p>
        ) : null}

        <button
          type="submit"
          className="h-12 rounded-full bg-[#2c2218] text-sm font-semibold uppercase tracking-[0.18em] text-[#f7f2ea] transition hover:bg-[#20170f]"
        >
          Continue to review
        </button>
      </form>
    </section>
  );
};
