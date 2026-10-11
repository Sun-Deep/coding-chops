import { DECIDE, LOOK_AT, TRAIL, WALK, YOU_ENTER, enterFrame } from "./beats";
import { ROOMS, YOU } from "./runs";
import { ROWS, SEATS, type Rule } from "./simulation";

/**
 * Where the rows, seats and aisles sit on screen, seen from the projection
 * booth: the screen at the top, the front row under it, the back row nearest
 * the camera at the bottom, a little larger. And the walk every person takes,
 * from a door at the back, up the nearer aisle, along their row to the seat.
 */

export const W = 780;
export const H = 380;
export const CX = W / 2;

/** Row 0 is the front row, under the screen. */
export const rowY = (r: number) => 112 + r * 36 + r * r * 0.6;
export const rowK = (r: number) => 0.86 + 0.05 * r;
export const pitch = (r: number) => 58 * rowK(r);
/** The walkway behind the back row, where people come in. */
export const WALKWAY_Y = 346;
export const seatX = (seat: number, r: number) =>
  CX + (seat - (SEATS - 1) / 2) * pitch(r);
/** Rows curve towards the screen at their ends, as cinema rows do. */
export const seatY = (seat: number, r: number) => {
  const u = (seatX(seat, r) - CX) / 330;
  return rowY(r) - 16 * u * u;
};
export const aisleX = (side: -1 | 1, r: number) =>
  seatX(side < 0 ? -1.15 : SEATS + 0.15, r);

type Point = { x: number; y: number };

export type Walker = {
  readonly group: number;
  readonly member: number;
  readonly row: number;
  readonly seat: number;
  readonly start: number;
  readonly seated: number;
  readonly path: readonly Point[];
  readonly lengths: readonly number[];
  /** The four friends stop at the back to look: distance along the path, and the frames they stand there. */
  readonly hold: { at: number; from: number; to: number } | null;
};

const walkersOf = (rule: Rule): Walker[] => {
  const out: Walker[] = [];
  for (const g of ROOMS[rule])
    g.seats.forEach((s, member) => {
      const side: -1 | 1 = s.seat < SEATS / 2 ? -1 : 1;
      const you = g.id === YOU;
      // The four come in together by the right-hand door and stop at the
      // back of the right aisle to look for seats.
      const doorSide: -1 | 1 = you ? 1 : side;
      const door = { x: doorSide < 0 ? -30 : W + 30, y: WALKWAY_Y + 6 };
      const base = { x: aisleX(side, ROWS - 1), y: WALKWAY_Y };
      // The four stand side by side on the walkway, in the middle, to look.
      // The four wait standing in the right-hand aisle, one per step.
      const lookRow = ROWS - 1 - member;
      const look = {
        x: aisleX(1, lookRow),
        y: seatY(SEATS + 0.15, lookRow) + 0.12 * pitch(lookRow),
      };
      const turn = {
        x: aisleX(side, s.row),
        y: seatY(side < 0 ? -1.15 : SEATS + 0.15, s.row) - 2,
      };
      const seat = { x: seatX(s.seat, s.row), y: seatY(s.seat, s.row) - 2 };
      const path = you
        ? [door, look, base, turn, seat]
        : [door, base, turn, seat];
      const lengths = [0];
      for (let i = 1; i < path.length; i++)
        lengths.push(
          lengths[i - 1] +
            Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y),
        );
      const total = lengths[lengths.length - 1];
      if (you) {
        const start = YOU_ENTER + member * 3;
        const go = DECIDE + member * TRAIL;
        out.push({
          group: g.id,
          member,
          row: s.row,
          seat: s.seat,
          start,
          seated: go + Math.ceil(((total - lengths[1]) / WALK) * 1.25),
          path,
          lengths,
          hold: { at: lengths[1], from: LOOK_AT + member * 3, to: go },
        });
        return;
      }
      const start = enterFrame(g.id) + member * TRAIL;
      out.push({
        group: g.id,
        member,
        row: s.row,
        seat: s.seat,
        start,
        seated: start + Math.ceil((total / WALK) * 1.25),
        path,
        lengths,
        hold: null,
      });
    });
  return out;
};

export const WALKERS: Record<Rule, Walker[]> = {
  spread: walkersOf("spread"),
  pack: walkersOf("pack"),
};

/** A walker's position at a frame: eased in and out along the path. */
export const walkerAt = (w: Walker, frame: number) => {
  if (frame < w.start) return null;
  const total = w.lengths[w.lengths.length - 1];
  const ease = (u: number) => u * u * (3 - 2 * u);
  let d: number;
  let moving: boolean;
  if (w.hold && frame < w.hold.to) {
    const u = Math.min(1, (frame - w.start) / (w.hold.from - w.start));
    d = ease(u) * w.hold.at;
    moving = u < 1;
  } else {
    const from = w.hold ? w.hold.to : w.start;
    const d0 = w.hold ? w.hold.at : 0;
    const u = Math.min(1, (frame - from) / (w.seated - from));
    d = d0 + ease(u) * (total - d0);
    moving = u > 0 && u < 1;
  }
  let i = 1;
  while (i < w.lengths.length - 1 && w.lengths[i] < d) i++;
  const a = w.path[i - 1];
  const b = w.path[i];
  const seg = w.lengths[i] - w.lengths[i - 1] || 1;
  const v = (d - w.lengths[i - 1]) / seg;
  return {
    x: a.x + (b.x - a.x) * v,
    y: a.y + (b.y - a.y) * v,
    sitting: frame >= w.seated,
    stride: d * 0.18,
    moving,
  };
};

/** Seats with someone in them at a frame. */
export const takenAt = (rule: Rule, frame: number, withoutYou = false) => {
  const taken = Array.from({ length: ROWS }, () =>
    new Array<number | null>(SEATS).fill(null),
  );
  for (const w of WALKERS[rule])
    if (frame >= w.seated && !(withoutYou && w.group === YOU))
      taken[w.row][w.seat] = w.group;
  return taken;
};

/**
 * Free seats and the longest free run in any row. With `withoutYou`, as the
 * four friends found it: their own seats count as free.
 */
export const roomAt = (rule: Rule, frame: number, withoutYou = false) => {
  const taken = takenAt(rule, frame, withoutYou);
  let free = 0;
  let longest = 0;
  for (const row of taken) {
    let run = 0;
    for (const t of row) {
      if (t === null) {
        free++;
        run++;
        longest = Math.max(longest, run);
      } else run = 0;
    }
  }
  return { free, longest, taken };
};
