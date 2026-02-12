"use client";

import Link from "next/link";
import { liveQuery } from "dexie";
import { useEffect, useMemo, useState } from "react";

import { derivePhaseTimes } from "@/domain/roast-session/derive";
import { CompletedRoast } from "@/domain/roast-session/types";
import { deleteRoast, listRoasts } from "@/data/roasts";
import { formatElapsedMsOrPlaceholder } from "@/shared/format/time";

const formatDateTime = (timestamp: number) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));

const resolveYieldPercent = (roast: CompletedRoast): number | null => {
  if (roast.yieldPercent != null) {
    return roast.yieldPercent;
  }

  if (roast.lossPercent != null) {
    return 100 - roast.lossPercent;
  }

  return null;
};

const formatYield = (yieldPercent: number | null) =>
  yieldPercent == null ? "--" : `${yieldPercent.toFixed(1)}%`;

export const HistoryScreen = () => {
  const [roasts, setRoasts] = useState<CompletedRoast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  const latestRoast = roasts[0];
  const canDeleteLatest = latestRoast?.id != null;

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
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-[#8f7d6a] transition hover:text-[#2c2218]"
          >
            Back to timer
          </Link>
        </div>

        <section className="mt-8 rounded-[32px] border border-[#eadfce] bg-white/90 px-6 py-6 shadow-[0_20px_60px_-40px_rgba(44,34,24,0.6)]">
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
                  </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
                        Yield %
                      </p>
                      <p className="mt-2 text-lg font-semibold">
                        {formatYield(resolveYieldPercent(roast))}
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
