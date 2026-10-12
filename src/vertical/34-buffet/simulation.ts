/** Same arrivals, dish choices and serving times under both rules. */
export const DISHES = 8;
export const PEOPLE = 60;
export const SEED = 13;
export const DT = 0.25;
export const WALK = 0.8;
export const SPACE = 0.5;
export type Rule = "line" | "skip";
export type Person = {
  id: number;
  arrive: number;
  slow: boolean;
  wants: number[];
  service: number[];
};
export type Pose = {
  x: number;
  dish: number;
  state: "away" | "walk" | "wait" | "serve" | "done";
  blocked: boolean;
  portions: number;
  queue: number;
};
export type Run = {
  people: readonly Person[];
  finished: number[];
  samples: Pose[][];
  end: number;
};
const rng = (seed: number) => {
  let n = seed >>> 0;
  const next = () =>
    (n = (Math.imul(n, 1664525) + 1013904223) >>> 0) / 4294967296;
  for (let k = 0; k < 12; k++) next();
  return next;
};
export const crowd = (
  seed = SEED,
  {
    people = PEOPLE,
    gap = 8,
    slowShare = 1 / 7,
    slowFactor = 5,
    choiceShare = 0.4,
  } = {},
): Person[] => {
  const random = rng(seed * 31 + 7);
  let arrive = 0;
  return Array.from({ length: people }, (_, id) => {
    if (id) arrive += -Math.log(1 - random()) * gap;
    const slow = random() < slowShare;
    const wants = Array.from({ length: DISHES }, (_, d) => d).filter(
      () => random() < choiceShare,
    );
    if (!wants.length) wants.push(Math.floor(random() * DISHES));
    const service = Array.from({ length: DISHES }, () =>
      Math.round((3 + random() * 4) * (slow ? slowFactor : 1)),
    );
    return { id, arrive, slow, wants, service };
  });
};

/**
 * One serving position per dish. In the line people walk past every dish
 * without passing anyone. In skip they walk in a separate aisle and join
 * each dish's first-come queue. Nobody interrupts someone serving food.
 * Positions are metres along the counter; each dish is one metre apart.
 */
export const run = (
  people: readonly Person[],
  rule: Rule,
  record = false,
): Run => {
  const poses: Pose[] = people.map(() => ({
    x: -SPACE,
    dish: 0,
    state: "away",
    blocked: false,
    portions: 0,
    queue: -1,
  }));
  const remaining = people.map(() => 0);
  const arrivedAt = people.map(() => Infinity);
  const finished = people.map(() => Infinity);
  const samples: Pose[][] = [];
  let t = 0;
  let done = 0;
  while (done < people.length && t < 7200) {
    const oldX = poses.map((p) => p.x);
    // People reach a dish before service starts, so every queue orders by
    // that arrival, then the person's id to resolve simultaneous arrivals.
    for (const p of people) {
      const a = poses[p.id];
      a.blocked = false;
      if (a.state === "away" && p.arrive <= t) {
        a.state = "walk";
        a.dish = rule === "line" ? 0 : p.wants[0];
        a.x =
          rule === "line" && p.id > 0
            ? Math.min(-SPACE, oldX[p.id - 1] - SPACE)
            : -SPACE;
      }
      if (a.state === "away" || a.state === "done") continue;
      if (a.state === "serve") {
        remaining[p.id] -= DT;
        if (remaining[p.id] > 0) continue;
        a.portions++;
        a.state = "walk";
        a.dish =
          rule === "line"
            ? a.dish + 1
            : (p.wants.find((d) => d > a.dish) ?? DISHES);
      }
      if (a.state !== "walk") continue;
      const target = a.dish < DISHES ? a.dish + 0.5 : DISHES + 1;
      const limit =
        rule === "line" && p.id > 0 && poses[p.id - 1].state !== "done"
          ? oldX[p.id - 1] - SPACE
          : Infinity;
      const x = Math.min(target, a.x + WALK * DT, limit);
      a.blocked = x < Math.min(target, a.x + WALK * DT) - 0.001;
      a.x = Math.max(a.x, x);
      if (a.x < target - 0.001) continue;
      if (a.dish === DISHES) {
        a.state = "done";
        finished[p.id] = t + DT;
        done++;
      } else if (p.wants.includes(a.dish)) {
        a.state = "wait";
        arrivedAt[p.id] = t;
      } else {
        a.dish++;
      }
    }
    for (let d = 0; d < DISHES; d++) {
      const waiting = people
        .filter((p) => poses[p.id].dish === d && poses[p.id].state === "wait")
        .sort((a, b) => arrivedAt[a.id] - arrivedAt[b.id] || a.id - b.id);
      const occupied = poses.some((a) => a.dish === d && a.state === "serve");
      waiting.forEach((p, i) => {
        poses[p.id].queue = i;
      });
      if (!occupied && waiting.length) {
        const p = waiting[0];
        poses[p.id].state = "serve";
        poses[p.id].queue = -1;
        remaining[p.id] = p.service[d];
      }
    }
    if (record) samples.push(poses.map((p) => ({ ...p })));
    t += DT;
  }
  if (done !== people.length) throw new Error("Buffet did not drain");
  return { people, finished, samples, end: t };
};
export const mean = (r: Run) =>
  r.finished.reduce((sum, end, i) => sum + end - r.people[i].arrive, 0) /
  r.people.length;
export const comparison = (people: readonly Person[], record = false) => {
  const line = run(people, "line", record);
  const skip = run(people, "skip", record);
  const worse = people.filter(
    (p) => skip.finished[p.id] > line.finished[p.id] + DT,
  );
  return { line, skip, worse, ratio: mean(line) / mean(skip) };
};
