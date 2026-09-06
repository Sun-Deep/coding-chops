import type { Caption } from "@remotion/captions";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../../shared/brand/theme";
import { Ink } from "../../../shared/ink/Ink";
import type { InkMark } from "../../../shared/ink/types";
import {
  BLOCK,
  CARET,
  CODE,
  SLOT,
  codeLineY,
} from "../../../shared/page/layout";
import { Mono } from "../../../shared/page/Mono";
import { PriceChart, dayX } from "../../../shared/page/PriceChart";
import {
  inkProgress,
  problemSolvingMotion as M,
  store,
} from "../../../shared/page/motion";
import { SceneShell } from "../../../shared/primitives/SceneShell";
import { EASE_IN_OUT, EASE_OUT } from "../../../shared/video/motion";
import { phraseFrame } from "../../../shared/video/captions";
import captionData from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/audio/captions/scene-07.json";
import circleMark from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/circle-03.json";
import strikeMark from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/strike-x-04.json";

const captions = captionData as Caption[];
const mark = (m: unknown) => m as unknown as InkMark;
const circle = mark(circleMark);
const strike = mark(strikeMark);

const at = {
  onlyFall: phraseFrame(captions, "prices that only fall"),
  cheapestMoves: phraseFrame(captions, "the cheapest keeps"),
  zeroRight: phraseFrame(captions, "zero is the right answer"),
  singleDay: phraseFrame(captions, "and one single day"),
  loopNever: phraseFrame(captions, "the loop never runs"),
  neither: phraseFrame(captions, "neither of those"),
  fallOut: phraseFrame(captions, "starting maxProfit"),
  startAt: phraseFrame(captions, "start it at negative"),
  infinity: phraseFrame(captions, "negative infinity"),
  fallingMarket: phraseFrame(captions, "the falling market"),
  lossNever: phraseFrame(captions, "a loss you never"),
};

const PRICES = [7, 1, 5, 3, 6, 4] as const;
/** LeetCode's own second example, not something invented for the video. */
const FALLING = [7, 6, 4, 3, 1] as const;
const SINGLE = [5] as const;

const ramp = (frame: number, from: number, over: number) =>
  interpolate(frame, [from, from + over], [0, 1], EASE_OUT);

const timeline = (
  frame: number,
  points: readonly (readonly [number, number])[],
) =>
  interpolate(
    frame,
    points.map((p) => p[0]),
    points.map((p) => p[1]),
    EASE_IN_OUT,
  );

/**
 * The four charts this act runs the function on, and when each takes over.
 *
 * Sequenced, never crossfaded. Act 1 shipped a version that held the outgoing
 * array's dots against the incoming array's line progress and drew six
 * disconnected points for a third of a second. The outgoing chart clears fully
 * drawn, and only then does the next one draw itself in.
 */
const REPLAY = phraseFrame(captions, "the falling market") - 46;
const SEGMENTS = [
  { from: 0, prices: PRICES },
  { from: at.onlyFall + 12, prices: FALLING },
  { from: at.singleDay + 30, prices: SINGLE },
  { from: REPLAY, prices: FALLING },
] as const;
const CLEAR = 9;
const DRAW = 17;

/** The two walks across the falling market, and the day the single one has. */
const WALK_ONE = at.cheapestMoves + 6;
const WALK_TWO = REPLAY + 30;
const STEP = 42;

/**
 * What the slots hold.
 *
 * The first walk is the function as written: the cheapest keeps dropping and
 * the best profit never leaves zero, which is the right answer. The second is
 * the same walk with maxProfit started at negative infinity, where the first
 * comparison has nothing to beat and a one dollar loss becomes the answer.
 */
type Held = { value: string; from: number };

const CHEAPEST: Held[] = [
  { value: "$1", from: -20 },
  { value: "$7", from: at.onlyFall + 20 },
  { value: "$6", from: WALK_ONE + STEP },
  { value: "$4", from: WALK_ONE + STEP * 2 },
  { value: "$3", from: WALK_ONE + STEP * 3 },
  { value: "$1", from: WALK_ONE + STEP * 4 },
  { value: "$5", from: at.singleDay + 56 },
  { value: "$7", from: WALK_TWO },
  { value: "$6", from: WALK_TWO + 15 },
  { value: "$4", from: WALK_TWO + 30 },
  { value: "$3", from: WALK_TWO + 45 },
  { value: "$1", from: WALK_TWO + 60 },
];
const BEST: Held[] = [
  { value: "$5", from: -20 },
  { value: "$0", from: at.onlyFall + 20 },
  { value: "-Infinity", from: WALK_TWO - 14 },
  { value: "-$1", from: WALK_TWO + 15 },
];

const PREFIX = "  let maxProfit ";
const TAIL_X = CODE.x + PREFIX.length * CODE.size * 0.6;

/**
 * Character for character what Act 6 ended on, in the same order.
 *
 * The maxProfit line is the subject here and putting it on top would have read
 * better on its own. It would also have swapped two lines on the cut, and this
 * act opens on Act 6's last frame.
 */
const LINES = [
  "function maxProfit(prices: number[]): number {",
  "  let minPrice = prices[0];",
  PREFIX,
  "",
  "  for (let i = 1; i < prices.length; i++) {",
  "    maxProfit = Math.max(maxProfit, prices[i] - minPrice);",
  "    minPrice = Math.min(minPrice, prices[i]);",
  "  }",
  "",
  "  return maxProfit;",
  "}",
];
const STRUCTURE = new Set([0, 3, 7, 8, 10]);
const MAX_LINE = 2;

export const BuyAndSellScene07: React.FC<{ tone?: "paper" | "black" }> = ({
  tone = "black",
}) => {
  const frame = useCurrentFrame();
  const dark = tone === "black";
  const ink = dark ? theme.colors.chalk : theme.colors.ink;
  const quiet = dark ? theme.colors.grayDark : theme.colors.gray;

  // Act 6 left every teaching line at full weight. They settle back once this
  // act has its own subject.
  const settle = ramp(frame, 20, 30);

  const current = SEGMENTS.reduce((best, seg) =>
    frame >= seg.from ? seg : best,
  );
  const index = SEGMENTS.indexOf(current);
  const previous = index > 0 ? SEGMENTS[index - 1] : null;
  const first = current.from === 0;
  const leaving = first ? 0 : 1 - ramp(frame, current.from, CLEAR);
  const arriving = first ? 1 : ramp(frame, current.from + CLEAR - 2, DRAW);

  /** The chart sits back while the beat is about the code, not the input. */
  const chartOn =
    1 - ramp(frame, at.neither, 16) * 0.65 + ramp(frame, REPLAY - 6, 14) * 0.65;

  const caretX = timeline(frame, [
    [WALK_ONE, dayX(1)],
    [WALK_ONE + STEP * 4, dayX(5)],
    [WALK_ONE + STEP * 4 + 60, dayX(5)],
    [WALK_ONE + STEP * 4 + 61, dayX(1)],
    [WALK_TWO, dayX(1)],
    [WALK_TWO + 60, dayX(5)],
  ]);
  const window = (a: number, b: number) =>
    ramp(frame, a, 12) * (1 - ramp(frame, b, 14));
  const caretOn = Math.max(
    window(WALK_ONE, WALK_ONE + STEP * 4 + 40),
    window(at.singleDay + 46, at.neither),
    window(WALK_TWO, WALK_TWO + 90),
  );

  /** The day the walk is standing on comes up; the rest stay at resting. */
  const labelLevel = (day: number) => {
    const near = 1 - Math.min(1, Math.abs(caretX - dayX(day)) / 60);
    return M.opacity.resting + (1 - M.opacity.resting) * near * caretOn;
  };

  const heldState = (entries: Held[], i: number) => {
    const entry = entries[i];
    const next = entries[i + 1];
    const s = store(frame, entry.from);
    const leaves = next ? ramp(frame, next.from - 8, 12) : 0;
    return { opacity: s.opacity * (1 - leaves), y: s.y - 34 * leaves };
  };

  // The initialiser: lifted, then changed, then shown to be wrong.
  const liftZero = window(at.fallOut, at.startAt + 10);
  const swap = ramp(frame, at.infinity, 16);
  const strikeOn = inkProgress(frame, at.lossNever, M.strike.duration);

  const lineLevel = (i: number) => {
    if (STRUCTURE.has(i)) return 0.38;
    const base = 1 - settle * (1 - M.opacity.resting);
    if (i === MAX_LINE) return Math.max(base, liftZero);
    return base;
  };

  const circleOn = 1 - ramp(frame, at.onlyFall, 16);

  return (
    <SceneShell
      captions={captions}
      narration="problem-solving/01-best-time-to-buy-and-sell-stock/scene-07"
      tone={tone}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${BLOCK.x - 330 * BLOCK.scale}px, ${BLOCK.y - 214 * BLOCK.scale}px) scale(${BLOCK.scale})`,
          transformOrigin: "0 0",
        }}
      >
        <div style={{ position: "absolute", inset: 0, opacity: chartOn }}>
          {previous && leaving > 0.01 && (
            <PriceChart
              points={previous.prices.map((price, i) => ({
                day: i + 1,
                price,
                label: M.opacity.resting,
              }))}
              opacity={leaving}
              tone={tone}
            />
          )}
          {arriving > 0.01 && (
            <PriceChart
              points={current.prices.map((price, i) => ({
                day: i + 1,
                price,
                reveal: first ? 1 : arriving,
                label: labelLevel(i + 1),
              }))}
              line={first ? 1 : arriving}
              tone={tone}
            />
          )}
        </div>

        {caretOn > 0.01 && (
          <svg
            width={1920}
            height={1080}
            viewBox="0 0 1920 1080"
            style={{ position: "absolute", inset: 0, opacity: caretOn }}
          >
            <polygon
              points={`${caretX - CARET.half},${CARET.base} ${caretX + CARET.half},${CARET.base} ${caretX},${CARET.apex}`}
              fill={ink}
            />
          </svg>
        )}

        <Slot
          x={SLOT.cheapest}
          label="minPrice"
          held={CHEAPEST}
          state={heldState}
          ink={ink}
          quiet={quiet}
        />
        <Slot
          x={SLOT.best}
          label="maxProfit"
          labelDim={1 - strikeOn * 0.55}
          held={BEST}
          state={heldState}
          ink={ink}
          quiet={quiet}
        />

        {/* Act 5's circle, on the answer this act is about to leave behind. */}
        <Ink
          mark={circle}
          progress={1}
          at={{ x: SLOT.best, y: SLOT.valueY + 34 }}
          size={106}
          color={ink}
          opacity={circleOn}
          tone={tone}
        />
        {/* The answer the broken version returns. */}
        <Ink
          mark={strike}
          progress={strikeOn}
          // Offset for the mark's own tail: this one hangs to the lower right,
          // so its box centre is not where its ink is.
          at={{ x: SLOT.best + 12, y: SLOT.valueY + 44 }}
          size={104}
          color={ink}
          opacity={strikeOn}
          tone={tone}
        />
      </div>

      {LINES.map((text, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: CODE.x,
            top: codeLineY(i),
            whiteSpace: "pre",
            fontFamily: theme.monoFamily,
            fontSize: CODE.size,
            fontWeight: 500,
            color: ink,
            opacity: lineLevel(i),
          }}
        >
          {text}
        </div>
      ))}

      {/* The initialiser, which is the whole act. */}
      <CodeTail
        x={TAIL_X}
        y={codeLineY(MAX_LINE)}
        on={(1 - swap) * lineLevel(MAX_LINE)}
        ink={ink}
      >
        = 0;
      </CodeTail>
      <CodeTail
        x={TAIL_X}
        y={codeLineY(MAX_LINE)}
        on={swap * lineLevel(MAX_LINE)}
        ink={ink}
      >
        = -Infinity;
      </CodeTail>
    </SceneShell>
  );
};

/** The end of a line of code, so one part of it can change without the rest. */
const CodeTail: React.FC<{
  children: React.ReactNode;
  x: number;
  y: number;
  on: number;
  ink: string;
}> = ({ children, x, y, on, ink }) => {
  if (on <= 0.01) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        whiteSpace: "pre",
        fontFamily: theme.monoFamily,
        fontSize: CODE.size,
        fontWeight: 500,
        color: ink,
        opacity: on,
      }}
    >
      {children}
    </div>
  );
};

const Slot: React.FC<{
  x: number;
  label: string;
  /** Held back where ink is drawn across it. */
  labelDim?: number;
  held: Held[];
  state: (entries: Held[], i: number) => { opacity: number; y: number };
  ink: string;
  quiet: string;
}> = ({ x, label, labelDim = 1, held, state, ink, quiet }) => (
  <>
    <div
      style={{
        position: "absolute",
        left: x - 300,
        top: SLOT.labelY,
        width: 600,
        textAlign: "center",
        fontFamily: theme.monoFamily,
        fontSize: SLOT.labelSize + 5,
        fontWeight: 500,
        color: quiet,
        opacity: labelDim,
      }}
    >
      {label}
    </div>
    {held.map((entry, i) => {
      const s = state(held, i);
      if (s.opacity <= 0.01) return null;
      return (
        <Mono
          key={i}
          x={x}
          y={SLOT.valueY}
          width={520}
          // A word is not a dollar amount and does not get a dollar amount's
          // size. Everything else in this slot has been two characters.
          size={entry.value.length > 3 ? 34 : SLOT.valueSize}
          weight={700}
          color={ink}
          opacity={s.opacity}
          dy={s.y + (entry.value.length > 3 ? 12 : 0)}
        >
          {entry.value}
        </Mono>
      );
    })}
  </>
);
