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
import { problemSolvingMotion as M, store } from "../../../shared/page/motion";
import { SceneShell } from "../../../shared/primitives/SceneShell";
import { EASE_IN_OUT, EASE_OUT } from "../../../shared/video/motion";
import { phraseFrame } from "../../../shared/video/captions";
import captionData from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/audio/captions/scene-08.json";
import strikeMark from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/strike-x-04.json";

const captions = captionData as Caption[];
const strike = strikeMark as unknown as InkMark;

const at = {
  save: phraseFrame(captions, "what did that save"),
  bruteForce: phraseFrame(captions, "brute force checked"),
  fifteen: phraseFrame(captions, "that's 15"),
  hundredK: phraseFrame(captions, "for a 100000"),
  fiveBillion: phraseFrame(captions, "5 billion"),
  formula: phraseFrame(captions, "if you want the formula"),
  nTimes: phraseFrame(captions, "n times n minus"),
  growsLike: phraseFrame(captions, "which grows like"),
  walkTouches: phraseFrame(captions, "the walk touches"),
  once: phraseFrame(captions, "each price once"),
  hundredKPrices: phraseFrame(captions, "a 100000 prices"),
  holdsTwo: phraseFrame(captions, "and it holds two"),
  arrayGets: phraseFrame(captions, "the array gets"),
  operations: phraseFrame(captions, "5 billion operations"),
  orHundredK: phraseFrame(captions, "or 100000"),
  sameAnswer: phraseFrame(captions, "same answer"),
};

const PRICES = [7, 1, 5, 3, 6, 4] as const;
/** What Act 7 left on screen. */
const FALLING = [7, 6, 4, 3, 1] as const;

const ramp = (frame: number, from: number, over: number) =>
  interpolate(frame, [from, from + over], [0, 1], EASE_OUT);

/**
 * The example comes back out of Act 7's park position and settles a little
 * smaller than home, because this act needs a column on the right that the
 * full width chart does not leave room for.
 *
 * Expressed as translate-then-scale off the origin: the park is anchored at
 * the block's top-left and the pull-back at a point left of centre, and two
 * transform origins do not interpolate.
 */
const HOME = { scale: 0.72, originX: 672, originY: 497 } as const;
const PARK_TX = BLOCK.x - 330 * BLOCK.scale;
const PARK_TY = BLOCK.y - 214 * BLOCK.scale;
const HOME_TX = HOME.originX * (1 - HOME.scale);
const HOME_TY = HOME.originY * (1 - HOME.scale);

/**
 * The cost of each approach, as one table that fills in.
 *
 * Act 2 already showed the redundancy. This only puts the notation on it, so
 * the notation arrives as the consequence of something the viewer watched
 * rather than as a new subject.
 */
const COLUMN = { left: 1408, right: 1872 } as const;
const ROWS = {
  brute: { label: 236, value: 264, formula: 318, order: 296 },
  walk: { label: 420, value: 448, order: 444 },
  memory: { label: 700, value: 728, order: 724 },
} as const;

const LINES = [
  "function maxProfit(prices: number[]): number {",
  "  let minPrice = prices[0];",
  "  let maxProfit = -Infinity;",
  "",
  "  for (let i = 1; i < prices.length; i++) {",
  "    maxProfit = Math.max(maxProfit, prices[i] - minPrice);",
  "    minPrice = Math.min(minPrice, prices[i]);",
  "  }",
  "",
  "  return maxProfit;",
  "}",
];

export const BuyAndSellScene08: React.FC<{ tone?: "paper" | "black" }> = ({
  tone = "black",
}) => {
  const frame = useCurrentFrame();
  const dark = tone === "black";
  const ink = dark ? theme.colors.chalk : theme.colors.ink;
  const quiet = dark ? theme.colors.grayDark : theme.colors.gray;

  /**
   * Act 7 ends on the broken version, because its last line is about the
   * broken version and the take leaves fifteen frames after it. Clearing that
   * is this act's first job, and "So what did that save us?" is five seconds
   * with nothing else in it.
   */
  const clear = ramp(frame, at.save, 65);
  const scale = BLOCK.scale + (HOME.scale - BLOCK.scale) * clear;
  const tx = PARK_TX + (HOME_TX - PARK_TX) * clear;
  const ty = PARK_TY + (HOME_TY - PARK_TY) * clear;

  // The chart goes back to the six prices the whole episode was about.
  const CHANGE = at.save + 6;
  const leaving = 1 - ramp(frame, CHANGE, 9);
  const arriving = ramp(frame, CHANGE + 7, 17);

  /** The walk replayed as one sweep, to say it touches each price once. */
  const caretX = interpolate(
    frame,
    [at.walkTouches + 10, at.once],
    [dayX(1), dayX(6)],
    EASE_IN_OUT,
  );
  const caretOn =
    ramp(frame, at.walkTouches + 6, 12) * (1 - ramp(frame, at.once + 40, 16));

  const slotLift = ramp(frame, at.holdsTwo, 14);
  const slotLevel =
    M.opacity.resting + (1 - M.opacity.resting) * Math.max(slotLift, 1 - clear);

  /**
   * The old value leaves before the new one arrives.
   *
   * Overlapped they were two different strings at half weight in the same
   * slot, which is the same muddle as two charts at once, just smaller.
   */
  const wrongOut = 1 - ramp(frame, at.save, 18);
  const rightIn = ramp(frame, at.save + 20, 18);

  /**
   * The code clears faster than the example arrives, because the example
   * expands across the space the panel is standing in.
   */
  const codeOut = 1 - ramp(frame, at.save, 26);

  /** Act 7's strike, on its way out with the rest of the broken state. */
  const strikeOn = 1 - ramp(frame, at.save, 20);

  const rowOn = (from: number) => ramp(frame, from, 14);
  /** The same answer, whichever way you paid for it. */
  const resolved = ramp(frame, at.sameAnswer, 16);

  const counted = (from: number, text: string, until?: number) => ({
    text,
    on:
      ramp(frame, from, 12) *
      (until === undefined ? 1 : 1 - ramp(frame, until, 12)),
  });

  const bruteCount = [
    counted(at.fifteen, "15", at.fiveBillion - 6),
    counted(at.fiveBillion, "5,000,000,000", at.sameAnswer - 4),
    counted(at.sameAnswer, "$5"),
  ];
  const walkCount = [
    counted(at.once + 6, "6", at.hundredKPrices - 6),
    counted(at.hundredKPrices, "100,000", at.sameAnswer - 4),
    counted(at.sameAnswer, "$5"),
  ];

  return (
    <SceneShell
      captions={captions}
      narration="problem-solving/01-best-time-to-buy-and-sell-stock/scene-08"
      tone={tone}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          transformOrigin: "0 0",
        }}
      >
        {leaving > 0.01 && (
          <PriceChart
            points={FALLING.map((price, i) => ({
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
            points={PRICES.map((price, i) => ({
              day: i + 1,
              price,
              reveal: arriving,
              label: M.opacity.resting,
            }))}
            line={arriving}
            tone={tone}
          />
        )}

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
          value="$1"
          on={slotLevel}
          ink={ink}
          quiet={quiet}
        />
        {/* Act 7 left this reading -$1. It goes back to the answer. */}
        <Slot
          x={SLOT.best}
          label="maxProfit"
          value="-$1"
          on={slotLevel * wrongOut}
          ink={ink}
          quiet={quiet}
        />
        <Slot
          x={SLOT.best}
          label="maxProfit"
          value="$5"
          on={slotLevel * rightIn}
          ink={ink}
          quiet={quiet}
        />

        <Ink
          mark={strike}
          progress={1}
          at={{ x: SLOT.best + 12, y: SLOT.valueY + 44 }}
          size={104}
          color={ink}
          opacity={strikeOn}
          tone={tone}
        />
      </div>

      {/* Act 7's code panel, on its way out. */}
      {codeOut > 0.01 &&
        LINES.map((text, i) => (
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
              opacity: codeOut * 0.5,
            }}
          >
            {text}
          </div>
        ))}

      {/* What each approach costs. */}
      <Row
        label="brute force"
        y={ROWS.brute}
        on={rowOn(at.bruteForce)}
        counts={bruteCount}
        order="O(n²)"
        orderOn={ramp(frame, at.growsLike, 14)}
        formula="n(n - 1) / 2"
        formulaOn={ramp(frame, at.nTimes, 14)}
        frame={frame}
        ink={ink}
        quiet={quiet}
        resolved={resolved}
      />
      <Row
        label="the walk"
        y={ROWS.walk}
        on={rowOn(at.walkTouches)}
        counts={walkCount}
        order="O(n)"
        orderOn={ramp(frame, at.hundredKPrices + 30, 14)}
        frame={frame}
        ink={ink}
        quiet={quiet}
        resolved={resolved}
      />
      <Row
        label="memory"
        y={ROWS.memory}
        on={rowOn(at.holdsTwo)}
        counts={[counted(at.holdsTwo + 6, "two numbers")]}
        order="O(1)"
        orderOn={ramp(frame, at.arrayGets, 14)}
        frame={frame}
        ink={ink}
        quiet={quiet}
        resolved={0}
      />
    </SceneShell>
  );
};

/** One line of the cost table: what it is, what it counted, what that is called. */
const Row: React.FC<{
  label: string;
  y: { label: number; value: number; order: number; formula?: number };
  on: number;
  counts: { text: string; on: number }[];
  order: string;
  orderOn: number;
  formula?: string;
  formulaOn?: number;
  frame: number;
  ink: string;
  quiet: string;
  /** The count gives way to the answer it bought. */
  resolved: number;
}> = ({
  label,
  y,
  on,
  counts,
  order,
  orderOn,
  formula,
  formulaOn = 0,
  frame,
  ink,
  quiet,
  resolved,
}) => {
  if (on <= 0.01) return null;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: COLUMN.left,
          top: y.label,
          fontFamily: theme.fontFamily,
          fontSize: 19,
          fontWeight: 600,
          letterSpacing: "0.14em",
          color: quiet,
          opacity: on,
        }}
      >
        {label}
      </div>
      {counts.map((count) => {
        const s = store(frame, 0);
        if (count.on * on <= 0.01) return null;
        const answer = count.text.startsWith("$");
        return (
          <div
            key={count.text}
            style={{
              position: "absolute",
              left: COLUMN.left,
              top: y.value,
              whiteSpace: "pre",
              fontFamily: theme.monoFamily,
              fontSize: 30,
              fontWeight: 700,
              color: answer ? theme.colors.gain : ink,
              opacity: count.on * on * (answer ? 1 : 1 - resolved * 0.6),
              transform: `translateY(${s.y}px)`,
            }}
          >
            {count.text}
          </div>
        );
      })}
      {formula && formulaOn > 0.01 && y.formula !== undefined && (
        <div
          style={{
            position: "absolute",
            left: COLUMN.left,
            top: y.formula,
            fontFamily: theme.monoFamily,
            fontSize: 26,
            color: quiet,
            opacity: formulaOn * on,
          }}
        >
          {formula}
        </div>
      )}
      {orderOn > 0.01 && (
        <Mono
          x={COLUMN.right - 90}
          y={y.order}
          width={220}
          size={38}
          weight={700}
          color={ink}
          opacity={orderOn * on}
        >
          {order}
        </Mono>
      )}
    </>
  );
};

const Slot: React.FC<{
  x: number;
  label: string;
  value: string;
  on: number;
  ink: string;
  quiet: string;
}> = ({ x, label, value, on, ink, quiet }) => {
  if (on <= 0.01) return null;
  return (
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
          opacity: on,
        }}
      >
        {label}
      </div>
      <Mono
        x={x}
        y={SLOT.valueY}
        width={400}
        size={SLOT.valueSize}
        weight={700}
        color={ink}
        opacity={on}
      >
        {value}
      </Mono>
    </>
  );
};
