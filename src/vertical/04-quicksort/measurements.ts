import { quickSort, selectionSort, shuffled } from "./sorting";

/**
 * The figures, one place.
 *
 * These are not a measurement of this machine. They are counts, and a count is
 * a property of the algorithm and the input, so they reproduce anywhere the
 * same array is fed in. That is why the seed is pinned here: quicksort's
 * comparison count moves with the input, so the input is committed and the
 * figure on screen is then exact rather than approximate.
 *
 * Selection sort's count does not move at all. It is n(n-1)/2 for every input,
 * shuffled, reversed or already sorted, which is the surprise the cut is built
 * on.
 */

export const N = 200;

/** Pinned. Change this and every number in the cut changes with it. */
export const SEED = 2026;

export const START = shuffled(N, SEED);

export const SELECTION = selectionSort(START);
export const QUICK = quickSort(START);

/** n(n-1)/2. Stated because it is the claim, not because it was observed. */
export const SELECTION_BOUND = (N * (N - 1)) / 2;

/**
 * How many complete quicksorts fit in one selection sort, by comparison count.
 *
 * The race runs both fields at the same comparisons per frame, so this ratio is
 * what the viewer sees as time rather than a figure on a card.
 */
export const RATIO = SELECTION.comparisons / QUICK.comparisons;
export const SORTS_PER_SELECTION = Math.floor(RATIO);

/** The array in order. Every shot after the race draws this. */
export const SORTED: readonly number[] = [...START].sort((a, b) => a - b);

/**
 * Selection sort run on an array that is already sorted.
 *
 * The comparison count is identical to the shuffled run and the swap count is
 * zero, which is the single most surprising true thing in the cut: the
 * algorithm cannot tell the difference and pays full price either way.
 */
export const SELECTION_SORTED = selectionSort(SORTED);

/** The catch, as a ratio. Quicksort moves about three times as much memory. */
export const WRITE_RATIO = QUICK.writes / SELECTION.writes;
