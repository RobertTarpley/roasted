"use client";

import {
  selectCanMarkDrop,
  selectCanMarkFirstCrack,
  selectCanStop,
  useTimerStore,
} from "@/features/timer/timerStore";

const buttonBase =
  "h-12 rounded-full px-5 text-sm font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-40";

export const TimerControls = () => {
  const isRunning = useTimerStore((state) => state.isRunning);
  const openPreRoast = useTimerStore((state) => state.openPreRoast);
  const stop = useTimerStore((state) => state.stop);
  const markFirstCrack = useTimerStore((state) => state.markFirstCrack);
  const markDrop = useTimerStore((state) => state.markDrop);
  const canMarkFirstCrack = useTimerStore(selectCanMarkFirstCrack);
  const canMarkDrop = useTimerStore(selectCanMarkDrop);
  const canStop = useTimerStore(selectCanStop);

  const handlePrimary = () => {
    if (isRunning) {
      stop();
      return;
    }

    openPreRoast();
  };

  return (
    <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 w-[min(480px,90vw)] -translate-x-1/2">
      <div className="rounded-[32px] border border-[#e0d3c3] bg-white/80 p-4 shadow-[0_24px_60px_-40px_rgba(44,34,24,0.7)] backdrop-blur">
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handlePrimary}
            disabled={isRunning ? !canStop : false}
            className={`${buttonBase} ${
              isRunning
                ? "bg-[#b5542f] text-white hover:bg-[#a34927]"
                : "bg-[#2c2218] text-[#f7f2ea] hover:bg-[#20170f]"
            }`}
          >
            {isRunning ? "Stop" : "Start"}
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={markFirstCrack}
              disabled={!canMarkFirstCrack}
              className={`${buttonBase} border border-[#c8b8a5] text-[#2c2218] hover:bg-[#f5efe6]`}
            >
              First Crack
            </button>
            <button
              type="button"
              onClick={markDrop}
              disabled={!canMarkDrop}
              className={`${buttonBase} border border-[#c8b8a5] text-[#2c2218] hover:bg-[#f5efe6]`}
            >
              Drop
            </button>
          </div>
          {isRunning && !canStop ? (
            <p className="text-center text-xs uppercase tracking-[0.2em] text-[#8f7d6a]">
              Add markers to unlock stop
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};
