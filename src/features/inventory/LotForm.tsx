"use client";

import { type FormEvent, useState } from "react";

import { addLot } from "@/data/lots";
import { LotInputSchema } from "@/domain/inventory/validation";

type LotFormErrors = {
  coffeeId?: string;
  label?: string;
  startingInventoryLbs?: string;
};

type LotFormProps = {
  coffeeId: number | undefined;
};

export const LotForm = ({ coffeeId }: LotFormProps) => {
  const [label, setLabel] = useState("");
  const [startingInventory, setStartingInventory] = useState("");
  const [errors, setErrors] = useState<LotFormErrors>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedInventory =
      startingInventory.trim() === ""
        ? Number.NaN
        : Number(startingInventory);

    const result = LotInputSchema.safeParse({
      coffeeId: coffeeId ?? Number.NaN,
      label: label.trim(),
      startingInventoryLbs: parsedInventory,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        coffeeId: fieldErrors.coffeeId?.[0],
        label: fieldErrors.label?.[0],
        startingInventoryLbs: fieldErrors.startingInventoryLbs?.[0],
      });
      return;
    }

    setErrors({});
    await addLot(result.data);
    setLabel("");
    setStartingInventory("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 grid gap-4 rounded-3xl border border-dashed border-[#d9cabb] bg-white/70 px-4 py-4"
    >
      <div className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
        New lot
      </div>
      {errors.coffeeId ? (
        <p className="text-sm text-[#b5542f]">{errors.coffeeId}</p>
      ) : null}
      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
          Lot label
        </span>
        <input
          type="text"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          className="h-11 rounded-2xl border border-[#e0d3c3] bg-white px-4 text-base text-[#2c2218] shadow-sm focus:border-[#2c2218] focus:outline-none"
          placeholder="e.g. Lot A"
        />
        {errors.label ? (
          <p className="text-sm text-[#b5542f]">{errors.label}</p>
        ) : null}
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
          Starting inventory (lbs)
        </span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.1"
          value={startingInventory}
          onChange={(event) => setStartingInventory(event.target.value)}
          className="h-11 rounded-2xl border border-[#e0d3c3] bg-white px-4 text-base text-[#2c2218] shadow-sm focus:border-[#2c2218] focus:outline-none"
          placeholder="e.g. 12.5"
        />
        {errors.startingInventoryLbs ? (
          <p className="text-sm text-[#b5542f]">{errors.startingInventoryLbs}</p>
        ) : null}
      </label>

      <button
        type="submit"
        className="h-11 rounded-full bg-[#2c2218] text-xs font-semibold uppercase tracking-[0.2em] text-[#f7f2ea] transition hover:bg-[#20170f]"
      >
        Add lot
      </button>
    </form>
  );
};
