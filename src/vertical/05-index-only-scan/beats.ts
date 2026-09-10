import { seconds } from "../../shared/video/timing";

/**
 * The shot map, in frames. Twenty-two seconds, five shots, no title card.
 *
 * It was thirty. Thirty is what the format standard allows for a mechanism and
 * its cost, and this has a mechanism, a cost and a caveat, so it took all of it.
 * At feed speed that is long: the page's best cuts are 27 seconds and under, and
 * a viewer decides in the first two.
 *
 * The binding constraint on the way down was words, not frames. Narration runs
 * at about two words a second and never above three, so 63 words cannot fit in
 * 22 seconds whatever the animation does. It is 44 now. Two lines went entirely,
 * and both were saying something the frame already said: the verdict's "Same
 * query. Same ten million rows." is that shot's own label, and the end card's
 * "Not free, and not automatic." is the card's own headline.
 *
 * The spine is one question asked three times: does Postgres open the table.
 * `fetch` says yes across most of it, `covering` says no, not once, and `stale`
 * says yes again with nothing changed but a missing `VACUUM`. Three shots share
 * one layout on purpose, which is the exception section 4 of the playbook
 * allows: the comparison is the point and the behaviour visibly differs.
 *
 * `stale` is the shortest of the three and its refill is the fastest thing in
 * the cut. That is deliberate. The other two shots are explanations and this
 * one is a relapse, so it should feel like the floor going out rather than like
 * another lesson.
 */
export const SHOTS = {
  /** A plain index finds the rows in 88 reads, then fetches 69,211 pages. */
  fetch: { from: 0, to: 190 },
  /** The same query, carrying `amount`, entirely inside the index. */
  covering: { from: 190, to: 345 },
  /** The catch. One percent updated, no VACUUM, and the table is back. */
  stale: { from: 345, to: 480 },
  /** Three lanes, and the sequential scan appears for the only time. */
  verdict: { from: 480, to: 570 },
  endCard: { from: 570, to: 660 },
} as const;

export const DURATION = SHOTS.endCard.to;

export const length = (shot: { from: number; to: number }) =>
  shot.to - shot.from;

/** Sanity: the cut is inside the twenty to thirty second band the format asks for. */
export const RUNTIME_SECONDS = DURATION / seconds(1);
