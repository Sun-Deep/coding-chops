# Ink format

The technical contract for captured graphite strokes. What ink means lives in
section 9 of `docs/problem-solving-visual-language.md`. This file covers how a
stroke is stored and how it renders.

Every constant here comes from measurements taken on an XP-Pen Deco in Chrome
on macOS. The reference numbers are at the end.

## File shape

```ts
type InkPoint =
  | [x: number, y: number, pressure: number, t: number]
  | [
      x: number,
      y: number,
      pressure: number,
      t: number,
      tiltX: number,
      tiltY: number,
    ];

type InkStroke = {
  points: InkPoint[];
};

type InkFile = {
  version: 1;
  /** The pixel size the strokes were drawn against. */
  viewport: { width: number; height: number };
  strokes: InkStroke[];
};
```

Flat tuples rather than objects. A captured mark runs 50 to 150 points, and
`{"x":0.1234,"y":0.5678,"p":0.312,"t":140}` costs 42 bytes where
`[0.1234,0.5678,0.312,140]` costs 24. Across seventy marks that is the
difference between a file you commit without thinking and one you argue about.

Tilt is optional and off by default. A six-element point is self-describing by
length, so a file that carries tilt needs no flag and a file that does not pays
nothing for it. Nothing renders from tilt today.

## Coordinates

Normalised 0 to 1 against `viewport`, four decimal places. At 1920 wide that is
0.19px of precision, which is finer than any stroke we draw.

Normalised rather than absolute because section 15 of the visual-language
contract leaves a move to 4K open. Absolute pixels would silently break on that
day. Recording `viewport` alongside means the original pixel positions are still
recoverable, so nothing is lost by normalising.

## Point ordering

Recorded order, which is drawing order. Never sort, never reverse, never
optimise the path.

This matters more than it sounds. The reason a hand-drawn circle reads as
hand-drawn is that it overshoots where it closes, and the overshoot only exists
because those points come last. Reordering a stroke turns it back into a shape.

## Timing

`t` is milliseconds from the start of its own stroke, not from the start of the
file.

Per-stroke timing keeps every mark independently replayable. Strokes get
reordered, retimed and reused across scenes, and a file-relative clock would
make each of those a rewrite.

## Capture-time processing

The capture tool writes files at shipping resolution. Nothing downstream
decimates.

Trim first. Drop leading and trailing points with `pressure < 0.01`. The pen
reports before it meaningfully touches the surface, so a raw stroke opens with a
run of near-zero samples that render as an invisible tail.

Then decimate. Drop any point within 3px of the last point kept, then run
Ramer-Douglas-Peucker at 0.6px. Both distances are in `viewport` pixels, applied
before normalising.

Decimation drops the pressure sample along with the point it belonged to. At 3px
spacing pressure changes slowly enough that this is not worth correcting for.

Measured across fourteen captured marks, a circle lands at 34 to 39 points, an
arrow at 13 to 18, and a two-stroke X at 10 to 17. A whole mark is under a
kilobyte.

That is fewer points than it sounds. On a 100px circle, 35 points gives 9px
chords, and the widest gap between chord and arc is 0.2px. Sub-pixel at 1080p,
so nothing visible is lost. The rule is insurance against a slow deliberate
stroke rather than a compression pass.

## Where files live

```text
curriculum/<track>/<episode>/ink/<name>.json
```

Scenes import them directly with a relative path, the same way they already
import caption JSON. No `staticFile()`, no `public/`. The data is versioned with
the lesson it belongs to and typechecked at build.

Name a file for the mark it is, not the scene that uses it first:
`strike-backwards-trade.json`, not `scene-01-ink-3.json`. Marks get reused.

## Pressure to width

```text
t = clamp((pressure - lo) / (hi - lo), 0, 1)
w = minWidth + (maxWidth - minWidth) * t ** 0.6
```

Defaults at 1080p:

```text
lo         0.016
hi         0.282
gamma      0.6
minWidth   1.6px
maxWidth   5.0px
```

`hi` is 0.282, not 1.0, because that is where real annotation pressure lands.
Across 335 samples from fourteen captured marks the median is 0.118 and the 95th
percentile is 0.282. Nothing reached 0.4. A deliberate press-as-hard-as-you-can
test hit 0.902, which is why the device range is the wrong thing to map.

`lo` and `hi` are the 5th and 95th percentiles of the episode's own marks. Refit
them once the full set is captured. That costs nothing, because raw pressure
stays in the files.

The window is calibration, not a property of a stroke, so it belongs to the
renderer and can be set per episode. Raw pressure stays in the file. That way
the whole episode's ink weight can be retuned without redrawing anything.

Do not normalise per stroke. It would give every mark its full width range and
flatten the difference between a light circle and a deliberate heavy strike,
and that difference carries meaning.

The 0.6 exponent is not decoration. Graphite does not lighten in proportion to
pressure. It drops off fast and then plateaus, so a linear map makes light
passages thinner than a pencil ever goes.

## Geometry

Round cap, round join. A pencil nib is round, and butt caps read as vector
immediately.

Render one path per pair of adjacent points, each with its own width taken from
the second point. A 100-point stroke is 99 short paths, and three strokes on
screen at once is about 300 elements, which Remotion handles without complaint.

Building a filled outline polygon would give cleaner joins. At widths between
1.6 and 5px over 3px segments the difference is invisible, so it is not worth
the code. Revisit if a mark ever needs to be much heavier.

## Replay progress and frame binding

`Ink` takes `progress` from 0 to 1. It does not call `useCurrentFrame()`. The
scene owns timing and computes progress from a caption frame, the same
arrangement `Callout` already uses.

Two modes:

`recorded` uses `t`, scaled so the whole stroke fills the target duration.
Default, because it carries the hesitation and the acceleration into corners
that make a stroke look drawn.

`paced` ignores `t` and advances at constant speed by cumulative path length.
For strokes converted from vector paths, which have no recorded timing.

Cut the final segment proportionally rather than stepping point to point. At 10
frames and 100 points the difference is invisible, but it costs three lines and
it stops short reveals from looking chunky.

Section 2 of the visual-language contract sets the durations. Ink replays inside
the same 10 to 45 frame bounds as a typeset `draw`.

## Determinism

`Ink` is a pure function of its strokes and its progress. No `Math.random`, no
`Date.now`, no state, no refs. Same inputs, same pixels, on every render and
every machine.

Any wobble, taper or texture comes from the recorded data. None of it is
generated at render time. A stroke that looks different between two renders is a
bug.

## Scaling

The renderer multiplies normalised coordinates by the composition size, and
scales widths by `compositionHeight / 1080`. A mark drawn once keeps its
apparent weight if the canonical resolution ever changes.

## Timeline anchoring

Ink files carry no frame numbers and no absolute times. The scene computes
`progress` from caption frames using the existing helpers in
`src/shared/video/captions.ts`.

Recorded narration stays the timing authority. A stroke that hardcoded frames
would quietly outrank it after the first re-record.

## Measured reference

XP-Pen Deco, Chrome, macOS, three test sessions.

```text
pointerType              pen
sample rate              about 267 per second
coalesced per move       2 to 3, rising with speed
tilt                     reports, 14 to 24 x, 30 to 34 y
twist                    always 0

quick circle             47 points raw, about 0.2s
slow deliberate stroke   534 points raw, about 2s
cursive sentence         77 strokes for 20 words

pressure, circles        0.001 to 0.322
pressure, writing        0.000 to 0.447
pressure, deliberate     0.001 to 0.902
distinct values          86 to 210 per session
```

Two things fall out of this.

A natural circle takes about 0.2 seconds to draw and `circle` is specified at 10
frames, which is 0.33 seconds, so recorded timing needs almost no scaling to fit
the vocabulary.

And one cursive sentence costs 77 strokes, more than the whole episode's ink
budget. That number is why section 9 of the visual-language contract keeps the
hand to four commenting marks and gives every value, equation and sentence to
typeset. Ink that carries content is a whiteboard, and it is also the most
expensive thing you can draw.

## Captured set, PS01

Fourteen marks, 9.5KB on disk. Seventy marks would come to about 48KB.

```text
              points   duration      pressure p50 / p95 / max
circle x6      34-39   0.38-0.48s    0.125 / 0.216 / 0.306
arrow x4       13-18   0.29-0.34s    0.137 / 0.267 / 0.388
strike-x x4    10-17   0.15-0.22s    0.051 / 0.125 / 0.192
all            335 samples           0.118 / 0.282 / 0.388
```

Strikes are the lightest and the fastest, arrows the heaviest. One calibration
window across all of them keeps that difference, which is the reason the window
is not per stroke.

The six circles close at gaps of 3, 14, 15, 19, 31 and 37px between their first
and last point. Six genuinely different circles, not one drawn six times.
