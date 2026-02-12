"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { derivePhaseTimes } from "@/domain/roast-session/derive";
import { formatElapsedMsOrPlaceholder } from "@/shared/format/time";

import { PostRoastForm } from "@/features/roast-log/PostRoastForm";
import { PreRoastForm } from "@/features/roast-log/PreRoastForm";
import { ReviewScreen } from "@/features/roast-log/ReviewScreen";
import { MarkerList } from "@/features/timer/MarkerList";
import { TimerControls } from "@/features/timer/TimerControls";
import { useTimerStore } from "@/features/timer/timerStore";

export const TimerScreen = () => {
  const isRunning = useTimerStore((state) => state.isRunning);
  const startAt = useTimerStore((state) => state.startAt);
  const events = useTimerStore((state) => state.events);
  const focusedEventId = useTimerStore((state) => state.focusedEventId);
  const focusMarker = useTimerStore((state) => state.focusMarker);
  const flowStep = useTimerStore((state) => state.flowStep);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 300);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (focusedEventId == null) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      focusMarker(null);
    }, 2400);

    return () => window.clearTimeout(timeout);
  }, [focusedEventId, focusMarker]);

  const phaseTimes = useMemo(() => derivePhaseTimes(events), [events]);
  const livePhaseTimes = useMemo(() => {
    const firstCrackAt = events.find((event) => event.type === "FIRST_CRACK")?.at ?? null;
    const dropAt = events.find((event) => event.type === "DROP")?.at ?? null;
    const stopAt = events.find((event) => event.type === "STOP")?.at ?? null;

    const developmentMs =
      firstCrackAt == null
        ? null
        : dropAt != null
          ? Math.max(0, dropAt - firstCrackAt)
          : isRunning
            ? Math.max(0, now - firstCrackAt)
            : null;

    const coolingMs =
      dropAt == null
        ? null
        : stopAt != null
          ? Math.max(0, stopAt - dropAt)
          : isRunning
            ? Math.max(0, now - dropAt)
            : null;

    return {
      developmentMs,
      coolingMs,
    };
  }, [events, isRunning, now]);

  const totalMs =
    isRunning && startAt != null ? Math.max(0, now - startAt) : phaseTimes.totalMs;
  const focusedEvent = focusedEventId
    ? events.find((event) => event.type === focusedEventId)
    : null;
  const focusedMs =
    focusedEvent && startAt != null
      ? Math.max(0, focusedEvent.at - startAt)
      : null;
  const displayMs = focusedMs ?? totalMs;

  const showControls = flowStep === "idle" || flowStep === "running";

  return (
    <div className="min-h-screen bg-[#f7f2ea] text-[#2c2218]">
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 pb-44 pt-12 sm:pb-32">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-xs uppercase tracking-[0.3em] text-[#8f7d6a]">
              Roast Timer
            </p>
            <span className="rounded-full border border-[#e0d3c3] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-[#8f7d6a]">
              Live
            </span>
          </div>
          <Link
            href="/history"
            className="text-xs uppercase tracking-[0.2em] text-[#8f7d6a] transition hover:text-[#2c2218]"
          >
            History
          </Link>
        </div>

        {flowStep === "review" ? (
          <ReviewScreen />
        ) : (
          <>
            <section className="mt-10 rounded-[36px] border border-[#eadfce] bg-white/80 px-6 py-8 shadow-[0_24px_60px_-40px_rgba(44,34,24,0.7)]">
              <p className="text-[11px] uppercase tracking-[0.4em] text-[#a08c78]">
                {focusedMs != null ? "Marker" : "Elapsed"}
              </p>
              <div className="mt-4 text-6xl font-semibold tracking-tight text-[#2c2218]">
                {formatElapsedMsOrPlaceholder(displayMs)}
              </div>
              <p className="mt-3 text-sm text-[#8f7d6a]">
                {focusedMs != null
                  ? "Showing time at selected marker"
                  : isRunning
                    ? "Timer running"
                    : "Ready when you are"}
              </p>
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-[#eadfce] bg-white/70 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#9a8774]">
                  Total
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatElapsedMsOrPlaceholder(totalMs)}
                </p>
              </div>
              <div className="rounded-3xl border border-[#eadfce] bg-white/70 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#9a8774]">
                  Development
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatElapsedMsOrPlaceholder(livePhaseTimes.developmentMs)}
                </p>
              </div>
              <div className="rounded-3xl border border-[#eadfce] bg-white/70 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#9a8774]">
                  Cooling
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatElapsedMsOrPlaceholder(livePhaseTimes.coolingMs)}
                </p>
              </div>
            </section>

            <section className="mt-8">
              <p className="text-xs uppercase tracking-[0.3em] text-[#8f7d6a]">
                Markers
              </p>
              <div className="mt-3">
                <MarkerList />
              </div>
            </section>

            {flowStep === "preRoast" ? <PreRoastForm /> : null}
            {flowStep === "postRoast" ? <PostRoastForm /> : null}
          </>
        )}
      </main>
      {showControls ? <TimerControls /> : null}
    </div>
  );
};
