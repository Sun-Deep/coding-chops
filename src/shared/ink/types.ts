/**
 * A captured graphite stroke. The contract is `docs/ink-format.md`.
 *
 * Points are flat tuples rather than objects because a mark runs to a few
 * hundred of them and `[0.1234,0.5678,0.312,140]` costs 24 bytes where the
 * object form costs 42.
 */
export type InkPoint =
  | readonly [x: number, y: number, pressure: number, t: number]
  | readonly [
      x: number,
      y: number,
      pressure: number,
      t: number,
      tiltX: number,
      tiltY: number,
    ];

export type InkStroke = {
  readonly points: readonly InkPoint[];
};

export type InkMark = {
  readonly version: number;
  /** The pixel size the strokes were drawn against. Coordinates normalise to it. */
  readonly viewport: { readonly width: number; readonly height: number };
  readonly strokes: readonly InkStroke[];
};
