import { RoastEvent, RoastPhaseTimes } from "./types";

const getEventTimestamp = (
  events: RoastEvent[],
  type: RoastEvent["type"]
): number | null => {
  const match = events.find((event) => event.type === type);
  return match ? match.at : null;
};

export const derivePhaseTimes = (events: RoastEvent[]): RoastPhaseTimes => {
  const start = getEventTimestamp(events, "START");
  const firstCrack = getEventTimestamp(events, "FIRST_CRACK");
  const drop = getEventTimestamp(events, "DROP");
  const stop = getEventTimestamp(events, "STOP");

  const totalMs =
    start != null && stop != null && stop >= start ? stop - start : null;
  const developmentMs =
    firstCrack != null && drop != null && drop >= firstCrack
      ? drop - firstCrack
      : null;
  const coolingMs =
    drop != null && stop != null && stop >= drop ? stop - drop : null;

  return {
    totalMs,
    developmentMs,
    coolingMs,
  };
};

export const deriveLossPercent = (
  greenWeightGrams: number,
  roastedWeightGrams: number
): number | null => {
  if (greenWeightGrams <= 0 || roastedWeightGrams <= 0) {
    return null;
  }

  return ((greenWeightGrams - roastedWeightGrams) / greenWeightGrams) * 100;
};
