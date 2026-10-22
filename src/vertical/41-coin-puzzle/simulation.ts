/** One lighter coin. All other coins have exactly the same mass. */
export const COINS = 9;
export const NORMAL_MASS = 100;
export const LIGHT_MASS = 99;
/** Follow the middle coin by rule, rather than selecting a favourable run. */
export const HERO = Math.floor(COINS / 2);

export type Outcome = "left" | "right" | "balanced";
export type Weighing = {
  left: number[];
  right: number[];
  outside: number[];
  outcome: Outcome;
  remaining: number[];
};

export const weigh = (
  left: readonly number[],
  right: readonly number[],
  target: number,
  normal = NORMAL_MASS,
  light = LIGHT_MASS,
): Outcome => {
  if (!(normal > light && light > 0))
    throw new Error("The exceptional coin must have a positive, lower mass.");
  const mass = (ids: readonly number[]) =>
    ids.reduce((sum, id) => sum + (id === target ? light : normal), 0);
  const difference = mass(left) - mass(right);
  return difference < 0 ? "left" : difference > 0 ? "right" : "balanced";
};

/** A balance has three outcomes, so keep one of three equal groups. */
export const solve = (
  target: number,
  count = COINS,
  normal = NORMAL_MASS,
  light = LIGHT_MASS,
) => {
  if (!Number.isInteger(target) || target < 0 || target >= count)
    throw new Error("The lighter coin must belong to the input.");
  let reduced = count;
  while (reduced > 1 && reduced % 3 === 0) reduced /= 3;
  if (count < 3 || !Number.isInteger(count) || reduced !== 1)
    throw new Error("This solver takes a power of three coins.");
  let candidates = Array.from({ length: count }, (_, id) => id);
  const steps: Weighing[] = [];
  while (candidates.length > 1) {
    const size = candidates.length / 3;
    // With three left, weigh the outside pair and leave the middle out.
    const left = candidates.slice(0, size);
    const right =
      size === 1 ? candidates.slice(-1) : candidates.slice(size, size * 2);
    const outside = candidates.filter(
      (id) => !left.includes(id) && !right.includes(id),
    );
    const outcome = weigh(left, right, target, normal, light);
    const remaining =
      outcome === "left" ? left : outcome === "right" ? right : outside;
    steps.push({ left, right, outside, outcome, remaining });
    candidates = remaining;
  }
  return { target, found: candidates[0], steps };
};
