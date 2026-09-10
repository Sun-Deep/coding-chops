import { seconds } from "../../shared/video/timing";

/**
 * The shot map, in frames. Thirty seconds, five shots, no title card.
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
  fetch: { from: 0, to: 230 },
  /** The same query, carrying `amount`, entirely inside the index. */
  covering: { from: 230, to: 430 },
  /** The catch. One percent updated, no VACUUM, and the table is back. */
  stale: { from: 430, to: 620 },
  /** Three lanes, and the sequential scan appears for the only time. */
  verdict: { from: 620, to: 770 },
  endCard: { from: 770, to: 900 },
} as const;

export const DURATION = SHOTS.endCard.to;

export const length = (shot: { from: number; to: number }) =>
  shot.to - shot.from;

/** Sanity: the cut is inside the twenty to thirty second band the format asks for. */
export const RUNTIME_SECONDS = DURATION / seconds(1);
