import { RUN } from "./measurements";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * The strings: one between every pair of the 23, drawn from frame START
 * and all 253 down by THREADS_DONE. The count grows as the time to the
 * power 1.5, so the first strings can still be followed one by one and the
 * last hundred arrive in a rush, the way pairs pile up as people are added,
 * while the first second already has thirty strings landing.
 */
export const START = 2;
export const THREADS_DONE = 110;
const GROWTH = 1.5;
/** The one pair that shares a birthday turns orange; both raise a hand. */
export const MATCH = 120;
/** The date tags leave before the camera rises out of the room. */
export const TAGS_OUT = 178;
export const RISE = 182;
export const RISEN = 256;
/** Each room with a match lights in turn, nearest the first room first. */
export const ROOMS_START = 236;
export const ROOMS_END = 304;
export const VERDICT = 320;

export const threadAt = (k: number) =>
  START + (THREADS_DONE - START) * (k / RUN.pairs) ** (1 / GROWTH);

export const pairsAt = (f: number) =>
  f <= START
    ? 0
    : Math.min(
        RUN.pairs,
        Math.floor(
          RUN.pairs * ((f - START) / (THREADS_DONE - START)) ** GROWTH + 1e-6,
        ),
      );

/** The rooms laid out 10 by 10; the first room sits near the middle. */
export const COLS = 10;
export const HERO_CELL = 44;
export const cellOf = (room: number) => {
  if (room === RUN.heroRoom) return HERO_CELL;
  const k = room < RUN.heroRoom ? room : room - 1;
  return k < HERO_CELL ? k : k + 1;
};

const matched = Array.from(RUN.roomsShared, (c, i) => (c === "1" ? i : -1))
  .filter((i) => i >= 0)
  .map((room) => {
    const c = cellOf(room);
    const h = HERO_CELL;
    const d = Math.hypot(
      (c % COLS) - (h % COLS),
      Math.floor(c / COLS) - Math.floor(h / COLS),
    );
    return { room, d };
  })
  .sort((a, b) => a.d - b.d || a.room - b.room);

/** The frame each room with a match lights, by room number (null if none). */
export const roomLitAt = (room: number) => {
  const i = matched.findIndex((m) => m.room === room);
  if (i < 0) return null;
  return ROOMS_START + ((ROOMS_END - ROOMS_START) * i) / (matched.length - 1);
};

export const roomsLitAt = (f: number) =>
  matched.filter((m) => (roomLitAt(m.room) as number) <= f).length;
