"use client";

import Link from "next/link";
import { liveQuery } from "dexie";
import { Fragment, useEffect, useMemo, useState } from "react";

import { listCoffees } from "@/data/coffees";
import { listLots } from "@/data/lots";
import { listRoasts } from "@/data/roasts";
import { type Coffee, type Lot } from "@/domain/inventory/types";
import { derivePhaseTimes } from "@/domain/roast-session/derive";
import { CompletedRoast } from "@/domain/roast-session/types";
import { formatElapsedMsOrPlaceholder } from "@/shared/format/time";
import { formatYieldPercent, resolveYieldPercent } from "@/shared/format/yield";

const formatDateTime = (timestamp: number) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));

const getRoastKey = (roast: CompletedRoast): number =>
  roast.id ?? roast.startedAt;

type CompareEntry = {
  roast: CompletedRoast;
  times: ReturnType<typeof derivePhaseTimes>;
};

export const CompareScreen = () => {
  const [roasts, setRoasts] = useState<CompletedRoast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [selectedRoastIds, setSelectedRoastIds] = useState<number[]>([]);

  useEffect(() => {
    const subscription = liveQuery(() => listRoasts()).subscribe({
      next: (results) => {
        setRoasts(results);
        setIsLoading(false);
        setLoadError(null);
      },
      error: (error) => {
        console.error(error);
        setLoadError("Unable to load roast history.");
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = liveQuery(() => listLots()).subscribe({
      next: (results) => setLots(results),
      error: (error) => console.error(error),
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = liveQuery(() => listCoffees()).subscribe({
      next: (results) => setCoffees(results),
      error: (error) => console.error(error),
    });

    return () => subscription.unsubscribe();
  }, []);

  const lotLabelById = useMemo(() => {
    const coffeeMap = new Map(coffees.map((coffee) => [coffee.id, coffee]));
    return new Map(
      lots
        .filter((lot) => lot.id != null)
        .map((lot) => {
          const coffee = coffeeMap.get(lot.coffeeId);
          const label = `${coffee?.name ?? "Unknown coffee"} — ${lot.label}`;
          return [lot.id as number, label] as const;
        })
    );
  }, [coffees, lots]);

  const selectedRoastEntries = useMemo<CompareEntry[]>(() => {
    const roastMap = new Map(roasts.map((roast) => [getRoastKey(roast), roast]));

    return selectedRoastIds
      .map((id) => roastMap.get(id))
      .filter((roast): roast is CompletedRoast => Boolean(roast))
      .map((roast) => ({
        roast,
        times: derivePhaseTimes(roast.events),
      }));
  }, [roasts, selectedRoastIds]);

  const comparisonRows = [
    {
      label: "Total",
      value: (entry: CompareEntry) =>
        formatElapsedMsOrPlaceholder(entry.times.totalMs),
    },
    {
      label: "Development",
      value: (entry: CompareEntry) =>
        formatElapsedMsOrPlaceholder(entry.times.developmentMs),
    },
    {
      label: "Cooling",
      value: (entry: CompareEntry) =>
        formatElapsedMsOrPlaceholder(entry.times.coolingMs),
    },
    {
      label: "Yield %",
      value: (entry: CompareEntry) =>
        formatYieldPercent(resolveYieldPercent(entry.roast)),
    },
  ];

  const handleToggleRoast = (roastId: number) => {
    setSelectedRoastIds((current) => {
      if (current.includes(roastId)) {
        return current.filter((id) => id !== roastId);
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, roastId];
    });
  };

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `minmax(130px, 1fr) repeat(${Math.max(
        selectedRoastEntries.length,
        1
      )}, minmax(160px, 1fr))`,
    }),
    [selectedRoastEntries.length]
  );

  return (
    <div className="min-h-screen bg-[#f7f2ea] text-[#2c2218]">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 pb-24 pt-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#8f7d6a]">
              Roast comparison
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[#2c2218]">
              Compare roasts
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/history"
              className="text-xs uppercase tracking-[0.2em] text-[#8f7d6a] transition hover:text-[#2c2218]"
            >
              Back to history
            </Link>
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.2em] text-[#8f7d6a] transition hover:text-[#2c2218]"
            >
              Back to timer
            </Link>
          </div>
        </div>

        <section className="mt-8 rounded-[32px] border border-[#eadfce] bg-white/90 px-6 py-6 shadow-[0_20px_60px_-40px_rgba(44,34,24,0.6)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
                Select roasts
              </p>
              <p className="mt-2 text-lg font-semibold">
                Pick 2-3 roasts to compare
              </p>
              {selectedRoastIds.length < 2 ? (
                <p className="mt-1 text-sm text-[#8f7d6a]">
                  Choose at least two roasts to populate the comparison grid.
                </p>
              ) : null}
            </div>
            <div className="rounded-full border border-[#c8b8a5] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2c2218]">
              {selectedRoastIds.length} selected
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {isLoading ? (
              <div className="rounded-2xl border border-dashed border-[#d9cabb] bg-white/60 px-4 py-6 text-center text-sm text-[#9a8774]">
                Loading roasts...
              </div>
            ) : loadError ? (
              <div className="rounded-2xl border border-dashed border-[#d9cabb] bg-white/60 px-4 py-6 text-center text-sm text-[#9a8774]">
                {loadError}
              </div>
            ) : roasts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d9cabb] bg-white/60 px-4 py-6 text-center text-sm text-[#9a8774]">
                No roasts available yet. Save a roast to compare.
              </div>
            ) : (
              roasts.map((roast) => {
                const roastId = getRoastKey(roast);
                const isSelected = selectedRoastIds.includes(roastId);
                const isDisabled = !isSelected && selectedRoastIds.length >= 3;
                const lotLabel = lotLabelById.get(roast.lotId) ?? "Unknown lot";

                return (
                  <label
                    key={roastId}
                    className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 shadow-sm transition sm:gap-6 ${
                      isSelected
                        ? "border-[#2c2218] bg-[#f5efe6]"
                        : "border-[#eadfce] bg-white"
                    } ${isDisabled ? "opacity-60" : "hover:border-[#c8b8a5]"}`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => handleToggleRoast(roastId)}
                        className="h-4 w-4 rounded border-[#c8b8a5] text-[#2c2218] focus:ring-[#2c2218]"
                      />
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
                          {roast.roastLevel} roast
                        </p>
                        <p className="mt-1 text-base font-semibold">
                          {formatDateTime(roast.startedAt)}
                        </p>
                        <p className="mt-1 text-sm text-[#8f7d6a]">{lotLabel}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-[#8f7d6a]">
                      <p className="text-xs uppercase tracking-[0.3em]">Yield</p>
                      <p className="mt-1 text-base font-semibold text-[#2c2218]">
                        {formatYieldPercent(resolveYieldPercent(roast))}
                      </p>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </section>

        <section className="mt-6 rounded-[32px] border border-[#eadfce] bg-white/90 px-6 py-6 shadow-[0_20px_60px_-40px_rgba(44,34,24,0.6)]">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
              Comparison grid
            </p>
            <p className="text-lg font-semibold">Phase splits side by side</p>
            {selectedRoastEntries.length < 2 ? (
              <p className="text-sm text-[#8f7d6a]">
                Select at least two roasts to unlock the comparison metrics.
              </p>
            ) : null}
          </div>

          <div className="mt-6 overflow-x-auto">
            <div className="min-w-[520px]">
              <div className="grid gap-4" style={gridStyle}>
                <div className="text-[11px] uppercase tracking-[0.3em] text-[#9a8774]">
                  Metric
                </div>
                {selectedRoastEntries.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#d9cabb] bg-white/70 px-4 py-4 text-sm text-[#9a8774]">
                    Select roasts to populate the comparison columns.
                  </div>
                ) : (
                  selectedRoastEntries.map((entry) => (
                    <div
                      key={getRoastKey(entry.roast)}
                      className="rounded-2xl border border-[#eadfce] bg-white/80 px-4 py-4"
                    >
                      <p className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
                        {entry.roast.roastLevel} roast
                      </p>
                      <p className="mt-2 text-base font-semibold">
                        {formatDateTime(entry.roast.startedAt)}
                      </p>
                    </div>
                  ))
                )}

                {selectedRoastEntries.length > 0
                  ? comparisonRows.map((row) => (
                      <Fragment key={row.label}>
                        <div className="rounded-2xl border border-[#eadfce] bg-[#f5efe6] px-4 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#8f7d6a]">
                          {row.label}
                        </div>
                        {selectedRoastEntries.map((entry) => (
                          <div
                            key={`${row.label}-${getRoastKey(entry.roast)}`}
                            className="rounded-2xl border border-[#eadfce] bg-white/80 px-4 py-4 text-base font-semibold"
                          >
                            {row.value(entry)}
                          </div>
                        ))}
                      </Fragment>
                    ))
                  : null}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
