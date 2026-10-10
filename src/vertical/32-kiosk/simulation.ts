/**
 * A burger counter in the lunch rush. One module, imported by both the reel
 * and `scripts/measure-kiosk.mjs`, so the frames and the committed run are
 * the same code.
 *
 * Customers arrive at random, seeded. Each one orders, waits for the kitchen,
 * and collects a tray. Two ways to take orders:
 *
 *   cashier  one till, one customer at a time, in the order they came in
 *   kiosks   KIOSKS self-order screens side by side; each customer takes the
 *            next free screen, and spends KIOSK_SLOWER times as long on it as
 *            they would at the till, reading the menu and the offers
 *
 * Behind both is the same kitchen: one line that makes orders one at a time,
 * in the order they were placed. The same customers, with the same order
 * sizes and the same cooking times, arrive at both counters at the same
 * moments, so the only difference is how orders are taken.
 *
 * Speeding up one stage of a pipeline only helps until another stage is the
 * slowest. The ordering gets six times the capacity; the time to food is set
 * by the kitchen. That limit is Amdahl's law.
 */

export type Rule = "cashier" | "kiosks";

/** Mean seconds between arrivals in the rush. */
export const GAP = 40;
/** Arrivals stop after this many seconds; the queue then drains. */
export const RUSH = 1500;
/** Mean seconds to order at the till. */
export const ORDER = 45;
export const KIOSKS = 6;
export const KIOSK_SLOWER = 1.4;
/** Mean seconds the kitchen spends on one order. */
export const COOK = 42;
/** Walking: door to the queue, till to the pickup counter. */
export const WALK_IN = 6;
export const WALK_TO_PICKUP = 5;
/** Seconds from a tray coming up to the customer noticing and taking it. */
export const COLLECT = 8;
export const SEED = 1;

export type Options = {
  readonly gap?: number;
  readonly order?: number;
  readonly kiosks?: number;
  readonly kioskSlower?: number;
  readonly cook?: number;
};

export type Customer = {
  readonly id: number;
  readonly arrive: number;
  /** Items on the order, 1 to 4. */
  readonly items: number;
  /** Order number on the board. */
  readonly number: number;
  /** Which till or screen, and when ordering starts and ends. */
  readonly station: number;
  readonly orderStart: number;
  readonly orderEnd: number;
  /** When the kitchen starts it and when it is up on the pass. */
  readonly cookStart: number;
  readonly ready: number;
  /** When the customer has the tray. */
  readonly served: number;
};

const rng = (seed: number) => {
  let s = seed >>> 0;
  const next = () =>
    (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 8; i++) next();
  return next;
};

/** Erlang-4: positive, mean 1, rarely more than twice the mean. */
const erlang = (random: () => number) => {
  let x = 0;
  for (let i = 0; i < 4; i++) x += -Math.log(1 - random());
  return x / 4;
};

export const run = (
  rule: Rule,
  seed: number = SEED,
  opts: Options = {},
): Customer[] => {
  const gap = opts.gap ?? GAP;
  const order = opts.order ?? ORDER;
  const kiosks = opts.kiosks ?? KIOSKS;
  const slower = opts.kioskSlower ?? KIOSK_SLOWER;
  const cook = opts.cook ?? COOK;
  // One generator per quantity, so changing one setting moves nothing else.
  const gaps = rng(seed * 7919 + 1);
  const sizes = rng(seed * 7919 + 2);
  const orders = rng(seed * 7919 + 3);
  const cooks = rng(seed * 7919 + 4);

  const people: {
    arrive: number;
    items: number;
    orderTime: number;
    cookTime: number;
  }[] = [];
  for (let t = -Math.log(1 - gaps()) * gap; t < RUSH; ) {
    const items = 1 + Math.floor(sizes() * 4);
    // Bigger orders take a little longer to say and to make.
    const orderTime = order * (0.8 + 0.1 * items) * erlang(orders);
    const cookTime = cook * (0.75 + 0.1 * items) * erlang(cooks);
    people.push({ arrive: t, items, orderTime, cookTime });
    t += -Math.log(1 - gaps()) * gap;
  }

  // Ordering, in arrival order.
  const free = new Array<number>(rule === "cashier" ? 1 : kiosks).fill(0);
  const ordered = people.map((p) => {
    let station = 0;
    for (let k = 1; k < free.length; k++)
      if (free[k] < free[station]) station = k;
    const start = Math.max(p.arrive + WALK_IN, free[station]);
    const length = rule === "cashier" ? p.orderTime : p.orderTime * slower;
    free[station] = start + length;
    return { station, orderStart: start, orderEnd: start + length };
  });

  // The kitchen takes orders in the order they were placed.
  const byPlaced = people
    .map((_, i) => i)
    .sort((a, b) => ordered[a].orderEnd - ordered[b].orderEnd);
  const cookStart = new Array<number>(people.length);
  const ready = new Array<number>(people.length);
  const number = new Array<number>(people.length);
  let kitchen = 0;
  byPlaced.forEach((i, n) => {
    cookStart[i] = Math.max(ordered[i].orderEnd, kitchen);
    ready[i] = cookStart[i] + people[i].cookTime;
    kitchen = ready[i];
    number[i] = 101 + n;
  });

  return people.map((p, id) => ({
    id,
    arrive: p.arrive,
    items: p.items,
    number: number[id],
    station: ordered[id].station,
    orderStart: ordered[id].orderStart,
    orderEnd: ordered[id].orderEnd,
    cookStart: cookStart[id],
    ready: ready[id],
    served: Math.max(
      ready[id] + COLLECT,
      ordered[id].orderEnd + WALK_TO_PICKUP,
    ),
  }));
};

/** Seconds from the door to holding the tray. */
export const toFood = (c: Customer) => c.served - c.arrive;
/** Seconds before the customer starts ordering, and after they finish. */
export const toOrder = (c: Customer) => c.orderStart - c.arrive - WALK_IN;
export const forFood = (c: Customer) => c.served - c.orderEnd;

/** Seeds and the window of arrivals the averages are taken over. */
export const SEEDS = 20;
export const WINDOW = [300, 1200] as const;

const inWindow = (c: Customer) => c.arrive > WINDOW[0] && c.arrive < WINDOW[1];

/** Mean seconds over SEEDS rushes: in line, waiting for food, door to tray. */
export const averages = (rule: Rule, opts: Options = {}) => {
  let n = 0;
  let line = 0;
  let food = 0;
  let total = 0;
  for (let seed = 1; seed <= SEEDS; seed++)
    for (const c of run(rule, seed, opts).filter(inWindow)) {
      n++;
      line += toOrder(c);
      food += forFood(c);
      total += toFood(c);
    }
  return { line: line / n, food: food / n, total: total / n };
};

/**
 * The customer the reel follows: in seed 1 at the till, the one whose wait in
 * line is closest to the average wait over all seeds. A typical customer, not
 * a lucky or an unlucky one.
 */
export const hero = (people: readonly Customer[], typicalLine: number) => {
  let best = people[0];
  for (const c of people)
    if (
      Math.abs(toOrder(c) - typicalLine) < Math.abs(toOrder(best) - typicalLine)
    )
      best = c;
  return best.id;
};
