"use client";

import { type FormEvent, useState } from "react";

import { addAdjustment } from "@/data/adjustments";
import {
  AdjustmentInputSchema,
  AdjustmentReasonSchema,
} from "@/domain/inventory/validation";

type AdjustmentFormErrors = {
  amountLbs?: string;
  reason?: string;
  lotId?: string;
};

type AdjustmentFormProps = {
  lotId: number | undefined;
};

const reasonOptions = AdjustmentReasonSchema.options;

export const AdjustmentForm = ({ lotId }: AdjustmentFormProps) => {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState(reasonOptions[0] ?? "purchase");
  const [errors, setErrors] = useState<AdjustmentFormErrors>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedAmount = amount.trim() === "" ? Number.NaN : Number(amount);

    const result = AdjustmentInputSchema.safeParse({
      lotId: lotId ?? Number.NaN,
      amountLbs: parsedAmount,
      reason,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        lotId:
          fieldErrors.lotId?.[0] ??
          (lotId === undefined ? "Select a lot to adjust." : undefined),
        amountLbs:
          fieldErrors.amountLbs?.[0] ??
          (Number.isNaN(parsedAmount)
            ? "Enter an adjustment amount."
            : undefined),
        reason: fieldErrors.reason?.[0],
      });
      return;
    }

    setErrors({});
    await addAdjustment(result.data);
    setAmount("");
    setReason(reasonOptions[0] ?? "purchase");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
      {errors.lotId ? (
        <p className="text-sm text-[#b5542f]">{errors.lotId}</p>
      ) : null}
      <label className="flex flex-col gap-2">
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#9a8774]">
          Adjustment (lbs)
        </span>
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="h-10 rounded-2xl border border-[#e0d3c3] bg-white px-3 text-sm text-[#2c2218] shadow-sm focus:border-[#2c2218] focus:outline-none"
          placeholder="+5 or -0.5"
        />
        {errors.amountLbs ? (
          <p className="text-sm text-[#b5542f]">{errors.amountLbs}</p>
        ) : null}
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#9a8774]">
          Reason
        </span>
        <select
          value={reason}
          onChange={(event) => {
            const parsed = AdjustmentReasonSchema.safeParse(event.target.value);
            if (parsed.success) {
              setReason(parsed.data);
            }
          }}
          className="h-10 rounded-2xl border border-[#e0d3c3] bg-white px-3 text-sm text-[#2c2218] shadow-sm focus:border-[#2c2218] focus:outline-none"
        >
          {reasonOptions.map((option) => (
            <option key={option} value={option}>
              {option === "purchase" ? "Purchase" : "Correction"}
            </option>
          ))}
        </select>
        {errors.reason ? (
          <p className="text-sm text-[#b5542f]">{errors.reason}</p>
        ) : null}
      </label>

      <button
        type="submit"
        className="h-10 rounded-full border border-[#2c2218] text-[11px] font-semibold uppercase tracking-[0.25em] text-[#2c2218] transition hover:bg-[#f5efe6]"
      >
        Add adjustment
      </button>
    </form>
  );
};
