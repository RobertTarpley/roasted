import { db } from "./db";

import { Coffee } from "@/domain/inventory/types";

export type CoffeeInsert = Omit<Coffee, "id" | "createdAt">;

export const addCoffee = async (input: CoffeeInsert): Promise<number> => {
  return db.coffees.add({
    ...input,
    createdAt: Date.now(),
  });
};

export const getCoffee = async (id: number): Promise<Coffee | undefined> => {
  return db.coffees.get(id);
};

export const listCoffees = async (): Promise<Coffee[]> => {
  return db.coffees.orderBy("name").toArray();
};
