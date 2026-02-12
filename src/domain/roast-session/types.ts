export type RoastEventType = "START" | "FIRST_CRACK" | "DROP" | "STOP";

export type RoastEvent = {
  type: RoastEventType;
  at: number;
};

export type RoastPhaseTimes = {
  totalMs: number | null;
  developmentMs: number | null;
  coolingMs: number | null;
};

export type RoastLevel = "Light" | "Medium" | "Dark";

export type RoastSessionState = {
  events: RoastEvent[];
  roastLevel?: RoastLevel;
  greenWeightGrams?: number;
  roastedWeightGrams?: number;
  notes?: string;
};

export type CompletedRoast = {
  id?: number;
  startedAt: number;
  endedAt: number;
  roastLevel: RoastLevel;
  greenWeightGrams: number;
  roastedWeightGrams: number;
  lossPercent: number;
  notes?: string;
  events: RoastEvent[];
};
