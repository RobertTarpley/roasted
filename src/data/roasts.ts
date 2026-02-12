import { db } from "./db";

import { gramsToLbs, normalizeLbs } from "@/domain/inventory/convert";
import { CompletedRoast, RoastLevel } from "@/domain/roast-session/types";

export type RoastInsert = Omit<CompletedRoast, "id">;

export type RoastFilters = {
  lotId?: number;
  roastLevel?: RoastLevel;
  startAt?: number;
  endAt?: number;
};

export const saveRoast = async (roast: RoastInsert): Promise<number> => {
  const deductionLbs = normalizeLbs(gramsToLbs(roast.greenWeightGrams));

  return db.transaction("rw", db.roasts, db.lots, async () => {
    const lot = await db.lots.get(roast.lotId);

    if (!lot) {
      throw new Error("Lot not found.");
    }

    const nextInventory = normalizeLbs(lot.currentInventoryLbs - deductionLbs);
    const roastId = await db.roasts.add(roast);

    await db.lots.update(roast.lotId, {
      currentInventoryLbs: nextInventory,
    });

    return roastId;
  });
};

export const getLatestRoast = async (): Promise<CompletedRoast | undefined> => {
  return db.roasts.orderBy("startedAt").reverse().first();
};

export const listRoasts = async (): Promise<CompletedRoast[]> => {
  return db.roasts.orderBy("startedAt").reverse().toArray();
};

export const listRoastsFiltered = async (
  filters: RoastFilters
): Promise<CompletedRoast[]> => {
  const { lotId, roastLevel, startAt, endAt } = filters;

  if (startAt == null && endAt == null && lotId == null && roastLevel == null) {
    return listRoasts();
  }

  const rangeStart = startAt ?? 0;
  const rangeEnd = endAt ?? Number.MAX_SAFE_INTEGER;

  let results: CompletedRoast[];

  if (startAt != null || endAt != null) {
    results = await db.roasts
      .where("startedAt")
      .between(rangeStart, rangeEnd, true, true)
      .reverse()
      .toArray();
  } else if (lotId != null) {
    results = await db.roasts.where("lotId").equals(lotId).reverse().toArray();
  } else if (roastLevel != null) {
    results = await db.roasts
      .where("roastLevel")
      .equals(roastLevel)
      .reverse()
      .toArray();
  } else {
    results = await listRoasts();
  }

  if (lotId != null) {
    results = results.filter((roast) => roast.lotId === lotId);
  }

  if (roastLevel != null) {
    results = results.filter((roast) => roast.roastLevel === roastLevel);
  }

  return results;
};

export const deleteRoast = async (id: number): Promise<void> => {
  await db.transaction("rw", db.roasts, db.lots, async () => {
    const roast = await db.roasts.get(id);

    if (!roast) {
      return;
    }

    await db.roasts.delete(id);

    if (roast.lotId == null) {
      return;
    }

    const lot = await db.lots.get(roast.lotId);

    if (!lot) {
      return;
    }

    const restoredInventory = normalizeLbs(
      lot.currentInventoryLbs + gramsToLbs(roast.greenWeightGrams)
    );

    await db.lots.update(roast.lotId, {
      currentInventoryLbs: restoredInventory,
    });
  });
};
