import { db } from "./db";

import { CompletedRoast } from "@/domain/roast-session/types";

export type RoastInsert = Omit<CompletedRoast, "id">;

export const saveRoast = async (roast: RoastInsert): Promise<number> => {
  return db.roasts.add(roast);
};

export const getLatestRoast = async (): Promise<CompletedRoast | undefined> => {
  return db.roasts.orderBy("startedAt").reverse().first();
};

export const listRoasts = async (): Promise<CompletedRoast[]> => {
  return db.roasts.orderBy("startedAt").reverse().toArray();
};

export const deleteRoast = async (id: number): Promise<void> => {
  await db.roasts.delete(id);
};
