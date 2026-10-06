/**
 * The office microwave at lunch. One module, imported by both the reel and
 * `scripts/measure-microwave.mjs`, so the frames and the committed run are
 * the same code.
 *
 * One microwave, a line of people, each with something to heat for a known
 * time. Every use also costs HANDLE seconds to open the door, swap the dish
 * and set the timer. Two rules for who goes next:
 *
 *   fifo  whoever got there first, the way a line works
 *   sjf   whoever has the shortest heating time; ties go to whoever got
 *         there first. Nobody is interrupted once their food is in.
 *
 * The second is "shortest job first", the scheduling rule an operating system
 * uses when it knows how long each job will take. With everyone already in
 * line it gives the lowest average wait of any order (Smith 1956); the cost
 * is that the longest job always goes last.
 *
 * Times are whole seconds and the generator is seeded, so every run is the
 * same.
 */

export type Rule = "fifo" | "sjf";

/** What people heat, in seconds, and how common each is. */
export const MENU: readonly {
  readonly seconds: number;
  readonly weight: number;
}[] = [
  { seconds: 20, weight: 1 },
  { seconds: 30, weight: 3 },
  { seconds: 45, weight: 2 },
  { seconds: 60, weight: 3 },
  { seconds: 90, weight: 2 },
  { seconds: 120, weight: 3 },
  { seconds: 180, weight: 2 },
  { seconds: 300, weight: 2 },
];

export const HANDLE = 10;
export const PEOPLE = 8;
export const SEED = 1;

export type Person = {
  readonly id: number;
  /** Second they joined the line. */
  readonly arrive: number;
  /** Heating time, s. */
  readonly cook: number;
};

export type Served = Person & {
  /** Second they reached the microwave, and the second they walked away. */
  readonly start: number;
  readonly end: number;
  readonly wait: number;
};

const rng = (seed: number) => {
  let s = seed >>> 0;
  const next = () =>
    (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  // The first few outputs of a small seed are close together; skip them.
  for (let i = 0; i < 8; i++) next();
  return next;
};

const draw = (random: () => number) => {
  const total = MENU.reduce((a, m) => a + m.weight, 0);
  let r = random() * total;
  for (const m of MENU) {
    r -= m.weight;
    if (r < 0) return m.seconds;
  }
  return MENU[MENU.length - 1].seconds;
};

/**
 * The people. With `gap` 0 everyone is already in line at second 0, in the
 * order they arrived; otherwise they arrive with random gaps averaging `gap`
 * seconds.
 */
export const crowd = (
  seed: number = SEED,
  { people = PEOPLE, gap = 0 }: { people?: number; gap?: number } = {},
): Person[] => {
  const random = rng(seed * 31 + 7);
  const out: Person[] = [];
  let t = 0;
  for (let id = 0; id < people; id++) {
    if (gap > 0 && id > 0) t += Math.round(-Math.log(1 - random()) * gap);
    out.push({ id, arrive: t, cook: draw(random) });
  }
  return out;
};

export const serve = (people: readonly Person[], rule: Rule): Served[] => {
  const waiting: Person[] = [];
  const pending = [...people].sort(
    (a, b) => a.arrive - b.arrive || a.id - b.id,
  );
  const out: Served[] = [];
  let t = 0;
  while (pending.length || waiting.length) {
    while (pending.length && pending[0].arrive <= t)
      waiting.push(pending.shift() as Person);
    if (!waiting.length) {
      t = pending[0].arrive;
      continue;
    }
    waiting.sort((a, b) =>
      rule === "sjf"
        ? a.cook - b.cook || a.arrive - b.arrive || a.id - b.id
        : a.arrive - b.arrive || a.id - b.id,
    );
    const p = waiting.shift() as Person;
    const end = t + HANDLE + p.cook;
    out.push({ ...p, start: t, end, wait: t - p.arrive });
    t = end;
  }
  return out;
};

export const meanWait = (served: readonly Served[]) =>
  served.reduce((a, s) => a + s.wait, 0) / served.length;

/** Wait of the person with the longest heating time (the first if tied). */
export const longestJobWait = (served: readonly Served[]) => {
  const top = Math.max(...served.map((s) => s.cook));
  return served.filter((s) => s.cook === top).sort((a, b) => a.id - b.id)[0]
    .wait;
};
