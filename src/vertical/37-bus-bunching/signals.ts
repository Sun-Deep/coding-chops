import { interpolate } from "remotion";
import { clamp } from "../../shared/video/timing";
import { DURATION, frameAt, PASS_FRAMES, simAt } from "./beats";
import { RUN } from "./runs";
import { blockages } from "./simulation";

const stopWindows = [0, 1].map((id) => [
  ...RUN.visits
    .filter(
      (visit) =>
        visit.bus === id &&
        visit.arrival <= simAt(DURATION) &&
        (visit.departure === null || visit.departure >= simAt(0)),
    )
    .map((visit) => [
      frameAt(visit.arrival),
      visit.departure === null ? DURATION : frameAt(visit.departure),
    ]),
  ...blockages(RUN, id)
    .filter(({ from, to }) => from <= simAt(DURATION) && to >= simAt(0))
    .map(({ from, to }) => [frameAt(from), frameAt(to)]),
]);

const smooth = (value: number) => value * value * (3 - 2 * value);

/** Brake lamps rise before a modelled stop and release as the bus pulls away. */
export const brakeLightAt = (frame: number, bus: number) =>
  smooth(
    Math.max(
      0,
      ...stopWindows[bus].map(([from, to]) =>
        interpolate(frame, [from - 6, from, to, to + 4], [0, 1, 1, 0], clamp),
      ),
    ),
  );

/** High-beam pulses share the horn's repeated signal schedule. */
export const highBeamAt = (frame: number) =>
  smooth(
    Math.max(
      ...PASS_FRAMES.map((at) =>
        interpolate(frame, [at, at + 2, at + 5, at + 10], [0, 1, 1, 0], clamp),
      ),
    ),
  );
