import { db } from "./db";

import { normalizeLbs } from "@/domain/inventory/convert";
import { Lot } from "@/domain/inventory/types";

export type LotInsert = Omit<Lot, "id" | "createdAt" | "currentInventoryLbs">;

export const addLot = async (input: LotInsert): Promise<number> => {
  const normalizedStarting = normalizeLbs(input.startingInventoryLbs);

  return db.lots.add({
    ...input,
    startingInventoryLbs: normalizedStarting,
    currentInventoryLbs: normalizedStarting,
    createdAt: Date.now(),
  });
};

export const getLot = async (id: number): Promise<Lot | undefined> => {
  return db.lots.get(id);
};

export const listLots = async (): Promise<Lot[]> => {
  return db.lots.orderBy("createdAt").reverse().toArray();
};

export const updateLot = async (
  id: number,
  updates: Partial<Pick<Lot, "label" | "startingInventoryLbs" | "currentInventoryLbs">>
): Promise<number> => {
  const normalizedUpdates: Partial<Lot> = { ...updates };

  if (updates.startingInventoryLbs != null) {
    normalizedUpdates.startingInventoryLbs = normalizeLbs(
      updates.startingInventoryLbs
    );
  }

  if (updates.currentInventoryLbs != null) {
    normalizedUpdates.currentInventoryLbs = normalizeLbs(
      updates.currentInventoryLbs
    );
  }

  return db.lots.update(id, normalizedUpdates);
};

export const updateLotInventory = async (
  id: number,
  currentInventoryLbs: number
): Promise<number> => {
  return db.lots.update(id, {
    currentInventoryLbs: normalizeLbs(currentInventoryLbs),
  });
};
