export type CoffeeProcess =
  | "Natural"
  | "Washed"
  | "Honey/Pulped Natural"
  | "Experimental"
  | "Other";

export type Coffee = {
  id?: number;
  name: string;
  origin?: string;
  process: CoffeeProcess;
  createdAt: number;
};

export type Lot = {
  id?: number;
  coffeeId: number;
  label: string;
  startingInventoryLbs: number;
  currentInventoryLbs: number;
  createdAt: number;
};

export type AdjustmentReason = "purchase" | "correction";

export type Adjustment = {
  id?: number;
  lotId: number;
  amountLbs: number;
  reason: AdjustmentReason;
  createdAt: number;
};
