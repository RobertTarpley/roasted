import Dexie, { Table } from "dexie";

import { Adjustment, Coffee, Lot } from "@/domain/inventory/types";
import { CompletedRoast } from "@/domain/roast-session/types";

export class RoastTimerDatabase extends Dexie {
  roasts!: Table<CompletedRoast, number>;
  coffees!: Table<Coffee, number>;
  lots!: Table<Lot, number>;
  adjustments!: Table<Adjustment, number>;

  constructor() {
    super("RoastTimer");

    this.version(1).stores({
      roasts: "++id, startedAt, roastLevel",
    });

    this.version(2).stores({
      roasts: "++id, startedAt, roastLevel, lotId",
      coffees: "++id, name, origin, process",
      lots: "++id, coffeeId, label, currentInventoryLbs",
      adjustments: "++id, lotId, createdAt, reason",
    });
  }
}

export const db = new RoastTimerDatabase();
