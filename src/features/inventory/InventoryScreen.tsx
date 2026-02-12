"use client";

import Link from "next/link";
import { liveQuery } from "dexie";
import { useEffect, useMemo, useState } from "react";

import { listCoffees } from "@/data/coffees";
import { listLots } from "@/data/lots";
import { Coffee, Lot } from "@/domain/inventory/types";
import { CoffeeForm } from "@/features/inventory/CoffeeForm";
import { LotForm } from "@/features/inventory/LotForm";

const formatInventory = (value: number) => `${value.toFixed(3)} lbs`;

type LotCardProps = {
  lot: Lot;
};

const LotCard = ({ lot }: LotCardProps) => {
  const isNegative = lot.currentInventoryLbs < 0;

  return (
    <div className="rounded-3xl border border-[#eadfce] bg-white/90 px-4 py-4 shadow-[0_14px_40px_-36px_rgba(44,34,24,0.5)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
            Lot
          </p>
          <p className="mt-1 text-lg font-semibold text-[#2c2218]">
            {lot.label}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
            Current inventory
          </p>
          <p
            className={`mt-1 text-lg font-semibold ${
              isNegative ? "text-[#b5542f]" : "text-[#2c2218]"
            }`}
          >
            {formatInventory(lot.currentInventoryLbs)}
          </p>
        </div>
      </div>
    </div>
  );
};

export const InventoryScreen = () => {
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const subscription = liveQuery(async () => {
      const [nextCoffees, nextLots] = await Promise.all([
        listCoffees(),
        listLots(),
      ]);
      return { nextCoffees, nextLots };
    }).subscribe({
      next: ({ nextCoffees, nextLots }) => {
        setCoffees(nextCoffees);
        setLots(nextLots);
        setIsLoading(false);
        setLoadError(null);
      },
      error: (error) => {
        console.error(error);
        setLoadError("Unable to load inventory.");
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  const lotsByCoffee = useMemo(() => {
    const map = new Map<number, Lot[]>();
    lots.forEach((lot) => {
      const coffeeId = lot.coffeeId;
      const bucket = map.get(coffeeId) ?? [];
      bucket.push(lot);
      map.set(coffeeId, bucket);
    });
    return map;
  }, [lots]);

  return (
    <div className="min-h-screen bg-[#f7f2ea] text-[#2c2218]">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 pb-24 pt-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#8f7d6a]">
              Inventory
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[#2c2218]">
              Coffees + lots
            </h1>
          </div>
          <nav className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-[#8f7d6a]">
            <Link
              href="/"
              className="transition hover:text-[#2c2218]"
            >
              Timer
            </Link>
            <Link
              href="/history"
              className="transition hover:text-[#2c2218]"
            >
              History
            </Link>
          </nav>
        </header>

        <section className="mt-8">
          <CoffeeForm />
        </section>

        <section className="mt-10 flex flex-col gap-5">
          {isLoading ? (
            <div className="rounded-2xl border border-dashed border-[#d9cabb] bg-white/60 px-4 py-6 text-center text-sm text-[#9a8774]">
              Loading inventory...
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border border-dashed border-[#d9cabb] bg-white/60 px-4 py-6 text-center text-sm text-[#9a8774]">
              {loadError}
            </div>
          ) : coffees.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d9cabb] bg-white/60 px-4 py-6 text-center text-sm text-[#9a8774]">
              Add your first coffee to start tracking lots.
            </div>
          ) : (
            coffees.map((coffee) => {
              const coffeeLots = lotsByCoffee.get(coffee.id ?? -1) ?? [];
              return (
                <article
                  key={coffee.id ?? coffee.createdAt}
                  className="rounded-3xl border border-[#eadfce] bg-white/90 px-6 py-6 shadow-[0_20px_60px_-40px_rgba(44,34,24,0.6)]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
                        Coffee
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-[#2c2218]">
                        {coffee.name}
                      </h2>
                      <p className="mt-2 text-sm text-[#7e6b58]">
                        {coffee.origin ? `${coffee.origin} · ` : ""}
                        {coffee.process}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#eadfce] bg-white/70 px-4 py-3 text-xs uppercase tracking-[0.3em] text-[#9a8774]">
                      {coffeeLots.length} {coffeeLots.length === 1 ? "Lot" : "Lots"}
                    </div>
                  </div>

                  <LotForm coffeeId={coffee.id} />

                  <div className="mt-6 grid gap-4">
                    {coffeeLots.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#d9cabb] bg-white/60 px-4 py-6 text-center text-sm text-[#9a8774]">
                        No lots yet for this coffee.
                      </div>
                    ) : (
                      coffeeLots.map((lot) => <LotCard key={lot.id} lot={lot} />)
                    )}
                  </div>
                </article>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
};
