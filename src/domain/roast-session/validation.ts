import { z } from "zod";

import { RoastEvent, RoastEventType } from "./types";

const roastEventOrder: RoastEventType[] = [
  "START",
  "FIRST_CRACK",
  "DROP",
  "STOP",
];

const isEventSequenceValid = (events: RoastEvent[]): boolean => {
  if (events.length > roastEventOrder.length) {
    return false;
  }

  let previousTimestamp: number | null = null;

  for (let index = 0; index < events.length; index += 1) {
    const expectedType = roastEventOrder[index];
    const event = events[index];

    if (event.type !== expectedType) {
      return false;
    }

    if (previousTimestamp != null && event.at < previousTimestamp) {
      return false;
    }

    previousTimestamp = event.at;
  }

  return true;
};

export const RoastLevelSchema = z.enum(["Light", "Medium", "Dark"]);

export const RoastEventSchema = z.object({
  type: z.enum(["START", "FIRST_CRACK", "DROP", "STOP"]),
  at: z.number().nonnegative(),
});

export const RoastEventLogSchema = z
  .array(RoastEventSchema)
  .min(1, "At least a START event is required.")
  .superRefine((events, context) => {
    if (!isEventSequenceValid(events)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Events must follow START → FIRST_CRACK → DROP → STOP in order with non-decreasing timestamps.",
      });
    }
  });

export const RoastWeightsSchema = z
  .object({
    greenWeightGrams: z.number().positive(),
    roastedWeightGrams: z.number().positive(),
  })
  .refine((data) => data.roastedWeightGrams <= data.greenWeightGrams, {
    message: "Roasted weight must be less than or equal to green weight.",
    path: ["roastedWeightGrams"],
  });

export const RoastNotesSchema = z.string().trim().min(1).optional();

export const RoastSessionSchema = z
  .object({
    events: RoastEventLogSchema,
    roastLevel: RoastLevelSchema.optional(),
    greenWeightGrams: z.number().positive().optional(),
    roastedWeightGrams: z.number().positive().optional(),
    notes: RoastNotesSchema,
  })
  .superRefine((data, context) => {
    if (
      data.roastedWeightGrams != null &&
      data.greenWeightGrams != null &&
      data.roastedWeightGrams > data.greenWeightGrams
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Roasted weight must be less than or equal to green weight.",
        path: ["roastedWeightGrams"],
      });
    }
  });

export type RoastEventInput = z.infer<typeof RoastEventSchema>;
export type RoastSessionInput = z.infer<typeof RoastSessionSchema>;
export type RoastWeightsInput = z.infer<typeof RoastWeightsSchema>;
export type RoastLevelInput = z.infer<typeof RoastLevelSchema>;
