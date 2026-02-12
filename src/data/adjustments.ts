import { db } from "./db";

import { normalizeLbs } from "@/domain/inventory/convert";
import { Adjustment } from "@/domain/inventory/types";

export type AdjustmentInsert = Omit<Adjustment, "id" | "createdAt">;

export const addAdjustment = async (input: AdjustmentInsert): Promise<number> => {
  return db.transaction("rw", db.adjustments, db.lots, async () => {
    const lot = await db.lots.get(input.lotId);

    if (!lot) {
      throw new Error("Lot not found.");
    }

    const nextInventory = normalizeLbs(lot.currentInventoryLbs + input.amountLbs);
    const adjustmentId = await db.adjustments.add({
      ...input,
      createdAt: Date.now(),
    });

    await db.lots.update(input.lotId, {
      currentInventoryLbs: nextInventory,
    });

    return adjustmentId;
  });
};

export const listAdjustmentsForLot = async (
  lotId: number
): Promise<Adjustment[]> => {
  const adjustments = await db.adjustments.where("lotId").equals(lotId).toArray();

  return adjustments.sort((a, b) => b.createdAt - a.createdAt);
};
