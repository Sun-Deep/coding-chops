import {
  CARVE_END,
  carvedAt,
  DURATION,
  LONG_WALK_FROM,
  LONG_WALK_TO,
  routeDoneAt,
  routeDrawnAt,
  SHORT_WALK_FROM,
  SHORT_WALK_TO,
  SHUFFLE_EVERY,
  SHUFFLE_FROM,
  SHUFFLES,
  walkedAt,
} from "./beats";
import { CH, CW, GENERATORS } from "./maze";
import { PASSAGES, RUNS } from "./measurements";

/**
 * The digging, made audible, on VR10's voice and scale.
 *
 * A `probe` every twelfth wall a panel knocks down, pitched by how far the room
 * it opened is from the entrance, on a major pentatonic over two octaves. A
 * method that digs outward from the corner is a rising run, the two that go
 * row by row climb and fall back once a row, and Kruskal's, which opens walls
 * anywhere, jumps about. You can hear which is which before reading a label.
 *
 * VR10's settings carried over unchanged, which is the point of having written
 * them down: a plucked tone that holds a note, two octaves, panels out of
 * phase with each other, about twenty notes a second.
 */

export type Pulse = {
  readonly id: string;
  readonly frame: number;
  readonly rate: number;
};

const STRIDE = 12;

const DEGREES = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const BASE_RATE = 0.65;

const note = (t: number) => {
  const i = Math.max(
    0,
    Math.min(DEGREES.length - 1, Math.round(t * (DEGREES.length - 1))),
  );
  return BASE_RATE * 2 ** (DEGREES[i] / 12);
};

/** How far a drawing cell is from the entrance, 0 to 1. */
const fromEntrance = (cell: number) =>
  ((cell % CW) + Math.floor(cell / CW)) / (CW + CH - 2);

/** The frame the i-th wall comes down, read off the same clock the panels use. */
const frameOfPassage = (() => {
  const carved = Array.from({ length: DURATION }, (_, f) => carvedAt(f));
  return (i: number) => {
    for (let f = 0; f < DURATION; f++) if (carved[f] > i) return f;
    return DURATION - 1;
  };
})();

/**
 * The wall each passage knocked down, in the order they came down.
 *
 * Pitched by the wall rather than the room it opened, because Kruskal's often
 * joins two rooms that are both open already, and there every passage has
 * exactly one wall of its own. A wall sits between two rooms, so its row or
 * its column is even.
 */
const knockedWalls = (openedAt: Int32Array) => {
  const out: number[] = [];
  openedAt.forEach((at, c) => {
    const x = c % CW;
    const y = Math.floor(c / CW);
    if (at < 0 || x === 0 || x === CW - 1) return;
    if (x % 2 === 1 && y % 2 === 1) return;
    out[at] = c;
  });
  if (out.length !== PASSAGES || out.some((c) => c === undefined)) {
    throw new Error("a passage has no wall of its own");
  }
  return out;
};

/**
 * Panels fire out of phase. All six have knocked down the same number of walls
 * on every frame, so a stride counted from zero would put six notes on one
 * frame and then nothing, which VR10 found is a chord struck over and over
 * rather than a run.
 */
export const DIGS: readonly Pulse[] = GENERATORS.flatMap((generator, panel) => {
  const walls = knockedWalls(generator.maze.openedAt);
  const pulses: Pulse[] = [];
  let last = -1;
  const offset = Math.round((panel * STRIDE) / GENERATORS.length);
  for (let i = offset; i < walls.length; i += STRIDE) {
    const frame = frameOfPassage(i);
    if (frame <= 0 || frame === last) continue;
    last = frame;
    pulses.push({
      id: `${generator.key}-${i}`,
      frame,
      rate: note(fromEntrance(walls[i])),
    });
  }
  return pulses;
});

/**
 * The routes drawing. Each panel climbs the scale as its route draws, every
 * fourth frame and out of phase with the others, and stops when its route
 * reaches the exit. Six runs start together and drop out shortest first, so
 * the last one still sounding is depth-first's, which is the route the verdict
 * opens on. One note a frame at most, so the start is a run and not a chord.
 */
export const ROUTE_NOTES: readonly Pulse[] = (() => {
  const taken = new Set<number>();
  const out: Pulse[] = [];
  GENERATORS.forEach((generator, panel) => {
    const rooms = generator.maze.route.length;
    for (
      let frame = CARVE_END + panel;
      frame <= routeDoneAt(rooms);
      frame += 4
    ) {
      if (taken.has(frame)) continue;
      taken.add(frame);
      out.push({
        id: `route-${generator.key}-${frame}`,
        frame,
        rate: note(routeDrawnAt(frame, rooms) / rooms),
      });
    }
  });
  return out;
})();

/**
 * The two walks, one note every other frame, pitched by how far along the route
 * the walker is. Same pace for both, so depth-first is a long climb and binary
 * tree is a short one, and the difference is audible with the screen off.
 */
const walk = (
  key: "depthFirst" | "binaryTree",
  from: number,
  to: number,
): Pulse[] => {
  const rooms = RUNS[key].route;
  const out: Pulse[] = [];
  for (let frame = from; frame <= to; frame += 2) {
    out.push({
      id: `walk-${key}-${frame}`,
      frame,
      rate: note(walkedAt(frame, rooms, from, to) / rooms),
    });
  }
  return out;
};

export const WALKS: readonly Pulse[] = [
  ...walk("depthFirst", LONG_WALK_FROM, LONG_WALK_TO),
  ...walk("binaryTree", SHORT_WALK_FROM, SHORT_WALK_TO),
];

/**
 * One note per new maze, and the same note every time. The maze changes and
 * the route does not, so the sound does not either.
 */
export const SHUFFLE_NOTES: readonly Pulse[] = Array.from(
  { length: SHUFFLES },
  (_, k) => ({
    id: `shuffle-${k}`,
    frame: SHUFFLE_FROM + k * SHUFFLE_EVERY,
    rate: note(1),
  }),
);
