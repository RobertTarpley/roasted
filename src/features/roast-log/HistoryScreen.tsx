"use client";

import Link from "next/link";
import { liveQuery } from "dexie";
import { useEffect, useMemo, useState } from "react";

import { listCoffees } from "@/data/coffees";
import { listLots } from "@/data/lots";
import { deleteRoast, listRoastsFiltered } from "@/data/roasts";
import { type Coffee, type Lot } from "@/domain/inventory/types";
import { derivePhaseTimes } from "@/domain/roast-session/derive";
import { CompletedRoast, type RoastLevel } from "@/domain/roast-session/types";
import { formatElapsedMsOrPlaceholder } from "@/shared/format/time";
import { formatYieldPercent, resolveYieldPercent } from "@/shared/format/yield";

const formatDateTime = (timestamp: number) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));

const parseDateInput = (value: string): Date | null => {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    !year ||
    !month ||
    !day
  ) {
    return null;
  }

  return new Date(year, month - 1, day);
};

const toStartOfDay = (value: string): number | undefined => {
  const date = parseDateInput(value);

  if (!date) {
    return undefined;
  }

  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const toEndOfDay = (value: string): number | undefined => {
  const date = parseDateInput(value);

  if (!date) {
    return undefined;
  }

  date.setHours(23, 59, 59, 999);
  return date.getTime();
};

export const HistoryScreen = () => {
  const [roasts, setRoasts] = useState<CompletedRoast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [selectedLotId, setSelectedLotId] = useState<number | null>(null);
  const [roastLevelFilter, setRoastLevelFilter] = useState<RoastLevel | null>(
    null
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filterParams = useMemo(() => {
    return {
      lotId: selectedLotId ?? undefined,
      roastLevel: roastLevelFilter ?? undefined,
      startAt: toStartOfDay(startDate),
      endAt: toEndOfDay(endDate),
    };
  }, [selectedLotId, roastLevelFilter, startDate, endDate]);

  const lotOptions = useMemo(() => {
    const coffeeMap = new Map(coffees.map((coffee) => [coffee.id, coffee]));

    return lots
      .filter((lot) => lot.id != null)
      .map((lot) => {
        const coffee = coffeeMap.get(lot.coffeeId);
        return {
          id: lot.id as number,
          label: `${coffee?.name ?? "Unknown coffee"} — ${lot.label}`,
        };
      });
  }, [coffees, lots]);

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

  useEffect(() => {
    const subscription = liveQuery(() => listRoastsFiltered(filterParams)).subscribe({
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
  }, [filterParams]);

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

  const latestRoast = roasts[0];
  const canDeleteLatest = latestRoast?.id != null;
  const latestLotLabel = latestRoast
    ? lotLabelById.get(latestRoast.lotId) ?? "Unknown lot"
    : null;
  const hasActiveFilters = Boolean(
    selectedLotId || roastLevelFilter || startDate || endDate
  );

  const handleDeleteLatest = async () => {
    if (!latestRoast || latestRoast.id == null) {
      return;
    }

    const confirmed = window.confirm(
      "Delete the most recent roast? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    await deleteRoast(latestRoast.id);
  };

  const summaryRows = useMemo(
    () =>
      roasts.map((roast) => ({
        roast,
        times: derivePhaseTimes(roast.events),
      })),
    [roasts]
  );

  return (
    <div className="min-h-screen bg-[#f7f2ea] text-[#2c2218]">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 pb-24 pt-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#8f7d6a]">
              Roast history
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[#2c2218]">
              Recent roasts
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/compare"
              className="text-xs uppercase tracking-[0.2em] text-[#8f7d6a] transition hover:text-[#2c2218]"
            >
              Compare
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
                Filters
              </p>
              <p className="mt-2 text-lg font-semibold">Refine the history</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedLotId(null);
                setRoastLevelFilter(null);
                setStartDate("");
                setEndDate("");
              }}
              disabled={!hasActiveFilters}
              className="h-10 rounded-full border border-[#c8b8a5] px-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#2c2218] transition hover:bg-[#f5efe6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear filters
            </button>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
                Coffee & lot
              </span>
              <select
                value={selectedLotId?.toString() ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  const nextValue = value ? Number(value) : null;
                  setSelectedLotId(Number.isNaN(nextValue) ? null : nextValue);
                }}
                className="h-11 rounded-2xl border border-[#e0d3c3] bg-white px-4 text-base text-[#2c2218] shadow-sm focus:border-[#2c2218] focus:outline-none"
              >
                <option value="">All lots</option>
                {lotOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
                Roast level
              </span>
              <select
                value={roastLevelFilter ?? ""}
                onChange={(event) => {
                  const value = event.target.value as RoastLevel;
                  setRoastLevelFilter(value ? value : null);
                }}
                className="h-11 rounded-2xl border border-[#e0d3c3] bg-white px-4 text-base text-[#2c2218] shadow-sm focus:border-[#2c2218] focus:outline-none"
              >
                <option value="">All levels</option>
                <option value="Light">Light</option>
                <option value="Medium">Medium</option>
                <option value="Dark">Dark</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
                Start date
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="h-11 rounded-2xl border border-[#e0d3c3] bg-white px-4 text-base text-[#2c2218] shadow-sm focus:border-[#2c2218] focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
                End date
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="h-11 rounded-2xl border border-[#e0d3c3] bg-white px-4 text-base text-[#2c2218] shadow-sm focus:border-[#2c2218] focus:outline-none"
              />
            </label>
          </div>
        </section>

        <section className="mt-6 rounded-[32px] border border-[#eadfce] bg-white/90 px-6 py-6 shadow-[0_20px_60px_-40px_rgba(44,34,24,0.6)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
                Latest roast
              </p>
              <p className="mt-2 text-lg font-semibold">
                {latestRoast
                  ? `${latestRoast.roastLevel} · ${formatDateTime(latestRoast.startedAt)}`
                  : "No roasts saved yet"}
              </p>
              {latestLotLabel ? (
                <p className="mt-1 text-sm text-[#8f7d6a]">{latestLotLabel}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleDeleteLatest}
              disabled={!canDeleteLatest}
              className="h-11 rounded-full border border-[#c8b8a5] px-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#2c2218] transition hover:bg-[#f5efe6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete last roast
            </button>
          </div>
        </section>

        <section className="mt-6 flex flex-col gap-4">
          {isLoading ? (
            <div className="rounded-2xl border border-dashed border-[#d9cabb] bg-white/60 px-4 py-6 text-center text-sm text-[#9a8774]">
              Loading roasts...
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border border-dashed border-[#d9cabb] bg-white/60 px-4 py-6 text-center text-sm text-[#9a8774]">
              {loadError}
            </div>
          ) : summaryRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d9cabb] bg-white/60 px-4 py-6 text-center text-sm text-[#9a8774]">
              No roasts recorded yet.
            </div>
          ) : (
            summaryRows.map(({ roast, times }) => (
              <article
                key={roast.id ?? roast.startedAt}
                className="rounded-3xl border border-[#eadfce] bg-white/90 px-5 py-5 shadow-[0_14px_40px_-32px_rgba(44,34,24,0.6)]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
                      {roast.roastLevel} roast
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {formatDateTime(roast.startedAt)}
                    </p>
                    <p className="mt-1 text-sm text-[#8f7d6a]">
                      {lotLabelById.get(roast.lotId) ?? "Unknown lot"}
                    </p>
                  </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
                        Yield %
                      </p>
                      <p className="mt-2 text-lg font-semibold">
                        {formatYieldPercent(resolveYieldPercent(roast))}
                      </p>
                    </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#eadfce] bg-white/80 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-[#9a8774]">
                      Total
                    </p>
                    <p className="mt-1 text-base font-semibold">
                      {formatElapsedMsOrPlaceholder(times.totalMs)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#eadfce] bg-white/80 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-[#9a8774]">
                      Green
                    </p>
                    <p className="mt-1 text-base font-semibold">
                      {roast.greenWeightGrams} g
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#eadfce] bg-white/80 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-[#9a8774]">
                      Roasted
                    </p>
                    <p className="mt-1 text-base font-semibold">
                      {roast.roastedWeightGrams} g
                    </p>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
};
