import { z } from "zod";

export const CoffeeProcessSchema = z.enum([
  "Natural",
  "Washed",
  "Honey/Pulped Natural",
  "Experimental",
  "Other",
]);

export const AdjustmentReasonSchema = z.enum(["purchase", "correction"]);

export const CoffeeInputSchema = z.object({
  name: z.string().trim().min(1, "Coffee name is required."),
  origin: z.string().trim().optional(),
  process: CoffeeProcessSchema,
});

export const LotInputSchema = z.object({
  coffeeId: z.number().positive(),
  label: z.string().trim().min(1, "Lot label is required."),
  startingInventoryLbs: z
    .number()
    .min(0, "Starting inventory must be 0 or more."),
});

export const AdjustmentInputSchema = z.object({
  lotId: z.number().positive(),
  amountLbs: z
    .number()
    .refine((value) => value !== 0, "Adjustment amount must be non-zero."),
  reason: AdjustmentReasonSchema,
});

export type CoffeeInput = z.infer<typeof CoffeeInputSchema>;
export type LotInput = z.infer<typeof LotInputSchema>;
export type AdjustmentInput = z.infer<typeof AdjustmentInputSchema>;
