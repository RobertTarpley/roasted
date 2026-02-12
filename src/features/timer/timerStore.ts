import { create } from "zustand";

import { derivePhaseTimes } from "@/domain/roast-session/derive";
import {
  RoastEvent,
  RoastEventType,
  RoastLevel,
  RoastPhaseTimes,
} from "@/domain/roast-session/types";
import { RoastEventLogSchema } from "@/domain/roast-session/validation";

type FocusedEventId = "FIRST_CRACK" | "DROP" | null;
type RoastFlowStep = "idle" | "preRoast" | "running" | "postRoast" | "review";

type TimerState = {
  isRunning: boolean;
  startAt: number | null;
  events: RoastEvent[];
  focusedEventId: FocusedEventId;
  flowStep: RoastFlowStep;
  roastLevel: RoastLevel | null;
  greenWeightGrams: number | null;
  roastedWeightGrams: number | null;
  notes: string;
  selectedLotId: number | null;
};

type TimerActions = {
  openPreRoast: () => void;
  cancelPreRoast: () => void;
  beginRoast: (input: {
    greenWeightGrams: number;
    selectedLotId: number;
  }) => void;
  markFirstCrack: () => void;
  markDrop: () => void;
  stop: () => void;
  deleteMarker: (type: "FIRST_CRACK" | "DROP") => void;
  focusMarker: (type: FocusedEventId) => void;
  recordPostRoast: (input: {
    roastLevel: RoastLevel;
    roastedWeightGrams: number;
  }) => void;
  setNotes: (notes: string) => void;
  setSelectedLotId: (lotId: number | null) => void;
  resetSession: () => void;
};

export type TimerStore = TimerState & TimerActions;

const eventOrder: RoastEventType[] = [
  "START",
  "FIRST_CRACK",
  "DROP",
  "STOP",
];

const getLastTimestamp = (events: RoastEvent[]): number | null => {
  if (events.length === 0) {
    return null;
  }

  return events[events.length - 1]?.at ?? null;
};

const createEvent = (type: RoastEventType, events: RoastEvent[]): RoastEvent => {
  const now = Date.now();
  const lastTimestamp = getLastTimestamp(events);
  const at = lastTimestamp != null ? Math.max(now, lastTimestamp) : now;

  return { type, at };
};

const canAppendEvent = (events: RoastEvent[], type: RoastEventType): boolean => {
  const candidate = createEvent(type, events);
  const validation = RoastEventLogSchema.safeParse([...events, candidate]);

  return validation.success;
};

const appendEvent = (events: RoastEvent[], type: RoastEventType): RoastEvent[] | null => {
  const candidate = createEvent(type, events);
  const nextEvents = [...events, candidate];

  if (!RoastEventLogSchema.safeParse(nextEvents).success) {
    return null;
  }

  return nextEvents;
};

const deriveStartAt = (events: RoastEvent[]): number | null => {
  const startEvent = events.find((event) => event.type === "START");
  return startEvent?.at ?? null;
};

const isRunningFromEvents = (events: RoastEvent[]): boolean => {
  const hasStart = events.some((event) => event.type === "START");
  const hasStop = events.some((event) => event.type === "STOP");
  return hasStart && !hasStop;
};

export const useTimerStore = create<TimerStore>((set) => ({
  isRunning: false,
  startAt: null,
  events: [],
  focusedEventId: null,
  flowStep: "idle",
  roastLevel: null,
  greenWeightGrams: null,
  roastedWeightGrams: null,
  notes: "",
  selectedLotId: null,
  openPreRoast: () => {
    set((state) => {
      if (state.isRunning || state.flowStep === "preRoast") {
        return state;
      }

      return {
        ...state,
        flowStep: "preRoast",
      };
    });
  },
  cancelPreRoast: () => {
    set((state) => ({
      ...state,
      flowStep: "idle",
      selectedLotId: null,
    }));
  },
  beginRoast: ({ greenWeightGrams, selectedLotId }) => {
    set((state) => {
      if (state.isRunning) {
        return state;
      }

      const startEvent: RoastEvent = { type: "START", at: Date.now() };

      return {
        isRunning: true,
        startAt: startEvent.at,
        events: [startEvent],
        focusedEventId: null,
        flowStep: "running",
        roastLevel: null,
        greenWeightGrams,
        roastedWeightGrams: null,
        notes: state.notes,
        selectedLotId,
      };
    });
  },
  markFirstCrack: () => {
    set((state) => {
      if (!state.isRunning) {
        return state;
      }

      const nextEvents = appendEvent(state.events, "FIRST_CRACK");

      if (!nextEvents) {
        return state;
      }

      return {
        ...state,
        events: nextEvents,
      };
    });
  },
  markDrop: () => {
    set((state) => {
      if (!state.isRunning) {
        return state;
      }

      const nextEvents = appendEvent(state.events, "DROP");

      if (!nextEvents) {
        return state;
      }

      return {
        ...state,
        events: nextEvents,
      };
    });
  },
  stop: () => {
    set((state) => {
      if (!state.isRunning) {
        return state;
      }

      const nextEvents = appendEvent(state.events, "STOP");

      if (!nextEvents) {
        return state;
      }

      return {
        ...state,
        isRunning: false,
        events: nextEvents,
        flowStep: "postRoast",
      };
    });
  },
  deleteMarker: (type) => {
    set((state) => {
      const cutoffIndex = eventOrder.indexOf(type);

      if (cutoffIndex === -1) {
        return state;
      }

      const nextEvents = state.events.filter((event) => {
        const eventIndex = eventOrder.indexOf(event.type);
        return eventIndex > -1 && eventIndex < cutoffIndex;
      });

      const startAt = deriveStartAt(nextEvents);
      const isRunning = isRunningFromEvents(nextEvents);

      return {
        ...state,
        events: nextEvents,
        startAt,
        isRunning,
        focusedEventId: state.focusedEventId === type ? null : state.focusedEventId,
      };
    });
  },
  focusMarker: (type) => {
    set((state) => ({
      ...state,
      focusedEventId: type,
    }));
  },
  recordPostRoast: ({ roastLevel, roastedWeightGrams }) => {
    set((state) => ({
      ...state,
      roastLevel,
      roastedWeightGrams,
      flowStep: "review",
    }));
  },
  setNotes: (notes) => {
    set((state) => ({
      ...state,
      notes,
    }));
  },
  setSelectedLotId: (lotId) => {
    set((state) => ({
      ...state,
      selectedLotId: lotId,
    }));
  },
  resetSession: () => {
    set(() => ({
      isRunning: false,
      startAt: null,
      events: [],
      focusedEventId: null,
      flowStep: "idle",
      roastLevel: null,
      greenWeightGrams: null,
      roastedWeightGrams: null,
      notes: "",
      selectedLotId: null,
    }));
  },
}));

export const selectPhaseTimes = (state: TimerState): RoastPhaseTimes =>
  derivePhaseTimes(state.events);

export const selectTotalElapsedMs = (state: TimerState): number | null => {
  const phaseTimes = derivePhaseTimes(state.events);

  if (state.isRunning && state.startAt != null) {
    return Math.max(0, Date.now() - state.startAt);
  }

  return phaseTimes.totalMs;
};

export const selectDevelopmentMs = (state: TimerState): number | null =>
  derivePhaseTimes(state.events).developmentMs;

export const selectCoolingMs = (state: TimerState): number | null =>
  derivePhaseTimes(state.events).coolingMs;

export const selectCanMarkFirstCrack = (state: TimerState): boolean =>
  state.isRunning && canAppendEvent(state.events, "FIRST_CRACK");

export const selectCanMarkDrop = (state: TimerState): boolean =>
  state.isRunning && canAppendEvent(state.events, "DROP");

export const selectCanStop = (state: TimerState): boolean =>
  state.isRunning && canAppendEvent(state.events, "STOP");
