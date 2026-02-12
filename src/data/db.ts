import Dexie, { Table } from "dexie";

import { CompletedRoast } from "@/domain/roast-session/types";

export class RoastTimerDatabase extends Dexie {
  roasts!: Table<CompletedRoast, number>;

  constructor() {
    super("RoastTimer");

    this.version(1).stores({
      roasts: "++id, startedAt, roastLevel",
    });
  }
}

export const db = new RoastTimerDatabase();
