import type { Caption } from "@remotion/captions";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../../shared/brand/theme";
import { Ink } from "../../../shared/ink/Ink";
import type { InkMark } from "../../../shared/ink/types";
import {
  BLOCK,
  CARET,
  CODE,
  COLUMN,
  EQUATION,
  SLOT,
  codeLineMid,
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
import captionData from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/audio/captions/scene-06.json";
import circleMark from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/circle-03.json";
import strikeMark from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/strike-x-01.json";
import arrow3 from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/arrow-03.json";

const captions = captionData as Caption[];
const mark = (m: unknown) => m as unknown as InkMark;
const walkArrow = mark(arrow3);
const circle = mark(circleMark);
const strike = mark(strikeMark);

const at = {
  asCode: phraseFrame(captions, "here's all of that"),
  morph1: phraseFrame(captions, "becomes minPrice"),
  morph2: phraseFrame(captions, "becomes maxProfit"),
  lineMin: phraseFrame(captions, "minPrice starts"),
  lineMax: phraseFrame(captions, "maxProfit starts"),
  lineFor: phraseFrame(captions, "the loop starts"),
  lineMathMax: phraseFrame(captions, "this line is the question"),
  lineMathMin: phraseFrame(captions, "and this line moves"),
  lineReturn: phraseFrame(captions, "then you hand back"),
  sixLines: phraseFrame(captions, "six lines"),
  oneThing: phraseFrame(captions, "one thing worth trying"),
  deleteIt: phraseFrame(captions, "delete the line"),
  neverMoves: phraseFrame(captions, "now it never moves"),
  answerZero: phraseFrame(captions, "the answer is 0"),
  nothingTells: phraseFrame(captions, "nothing tells you"),
};

const PRICES = [7, 1, 5, 3, 6, 4] as const;

const ramp = (frame: number, from: number, over: number) =>
  interpolate(frame, [from, from + over], [0, 1], EASE_OUT);

/**
 * The reference block is everything Act 5 ended on, shrunk and moved aside.
 * The same chart, the same two slots and the same circled answer, at the same
 * coordinates, under one transform. Rebuilding it at new coordinates would
 * mean the code was pointing at a diagram rather than at the walk the viewer
 * just did. Its park position lives in the shared layout, because Act 7 shows
 * the same pairing and the two must not disagree on the cut.
 */

/** Centre of the Math.min line, which is 45 characters wide. */
const STRIKE = { x: 435 } as const;

/**
 * The function, as it is on screen.
 *
 * Structure lines sit at a permanent low weight and never move, so the six
 * lines the narration walks through are the only things that change state.
 * Nothing here is syntax-highlighted: colour in this track means a buy, a
 * sell, a profit or a loss, and a keyword is none of those.
 */
const LINES = [
  "function maxProfit(prices: number[]): number {",
  "  let minPrice = prices[0];",
  "  let maxProfit = 0;",
  "",
  "  for (let i = 1; i < prices.length; i++) {",
  "    maxProfit = Math.max(maxProfit, prices[i] - minPrice);",
  "    minPrice = Math.min(minPrice, prices[i]);",
  "  }",
  "",
  "  return maxProfit;",
  "}",
];

/**
 * The six lines the act is about, and what each one already made happen.
 *
 * The storyboard wanted a hand arrow per line, six of them on screen together
 * by the end. At this distance they do not work: the code sits far left, the
 * targets far right and low, and a short arrow fanning out of one column
 * points at a direction rather than at a thing. Six of them overlapped into a
 * scribble. The connection is made by lifting the target instead, which is the
 * vocabulary the whole episode has been using for five acts.
 *
 * One arrow survives, on the `for` line, because "walks right" is a direction
 * and a direction is the one thing a pointer arrow says better than a lift.
 */
type Taught = {
  index: number;
  from: number;
  /** Which slot the line is about, if any. */
  lifts?: "cheapest" | "best";
};

const TAUGHT: Taught[] = [
  { index: 1, from: at.lineMin, lifts: "cheapest" },
  { index: 2, from: at.lineMax, lifts: "best" },
  { index: 4, from: at.lineFor },
  { index: 5, from: at.lineMathMax },
  { index: 6, from: at.lineMathMin, lifts: "cheapest" },
  { index: 9, from: at.lineReturn, lifts: "best" },
];

/** The walk replayed with the update line gone. Every profit is a loss. */
const BROKEN = [
  { sell: 1, at: 24 },
  { sell: 5, at: 50 },
  { sell: 3, at: 76 },
  { sell: 6, at: 102 },
  { sell: 4, at: 128 },
] as const;

export const BuyAndSellScene06: React.FC<{ tone?: "paper" | "black" }> = ({
  tone = "black",
}) => {
  const frame = useCurrentFrame();
  const dark = tone === "black";
  const ink = dark ? theme.colors.chalk : theme.colors.ink;
  const quiet = dark ? theme.colors.grayDark : theme.colors.gray;

  /**
   * Act 5 ended pushed in on the answer, so this act opens there and pulls the
   * whole thing aside in one move. Expressed as translate-then-scale off the
   * origin, because the push-in and the park have different anchor points and
   * interpolating two transform-origins does not compose.
   */
  const move = interpolate(
    frame,
    [at.asCode, at.asCode + 132],
    [0, 1],
    EASE_IN_OUT,
  );
  const blockScale = 1.08 + (BLOCK.scale - 1.08) * move;
  const startTx = -1184.64 * 0.08;
  const startTy = -871.56 * 0.08;
  const endTx = BLOCK.x - 330 * BLOCK.scale;
  const endTy = BLOCK.y - 214 * BLOCK.scale;
  const tx = startTx + (endTx - startTx) * move;
  const ty = startTy + (endTy - startTy) * move;

  /** The deletion test, and the walk it replays. */
  const broken = ramp(frame, at.neverMoves, 12);
  const restored = ramp(frame, at.nothingTells + 30, 22);
  const brokenNow = broken * (1 - restored);

  const caretX = interpolate(
    frame,
    [
      at.lineFor + 14,
      at.lineFor + 132,
      at.neverMoves + 15,
      at.neverMoves + 154,
    ],
    [dayX(1), dayX(6), dayX(1), dayX(6)],
    EASE_IN_OUT,
  );
  const caretOn = Math.max(
    ramp(frame, at.lineFor + 10, 12) * (1 - ramp(frame, at.lineMathMax, 16)),
    brokenNow,
  );

  /** One worked case, so the line about the question has a question on screen. */
  const exampleOn =
    ramp(frame, at.lineMathMax + 20, 14) *
    (1 - ramp(frame, at.lineMathMin, 16));

  /**
   * Slot weight.
   *
   * Both values arrive at full, because Act 5 ended on them. They sit back once
   * the code panel is there, then come up on the line that is about them. Two
   * lines touch minPrice and two touch maxProfit, which is the point.
   */
  const slotLift = (which: "cheapest" | "best") => {
    const settled = ramp(frame, at.lineMin - 60, 20);
    const windows = TAUGHT.filter((t) => t.lifts === which).map((t) => {
      const order = TAUGHT.indexOf(t);
      const next = TAUGHT[order + 1];
      return (
        ramp(frame, t.from, 12) *
        (1 - ramp(frame, next ? next.from : at.sixLines, 12))
      );
    });
    const together = ramp(frame, at.sixLines, 14);
    const lifted = Math.max(together, ...windows);
    const level = M.opacity.resting + (1 - M.opacity.resting) * lifted;
    return 1 + (level - 1) * settled;
  };

  const lineState = (index: number) => {
    const taught = TAUGHT.find((t) => t.index === index);
    if (!taught) return ramp(frame, at.lineMin - 46, 24) * 0.38;
    const order = TAUGHT.indexOf(taught);
    const next = TAUGHT[order + 1];
    const on = ramp(frame, taught.from, 12);
    const back = next ? ramp(frame, next.from, 10) * 0.45 : 0;
    // All six come up together on "six lines", then all but the update line
    // drop away while that one is put to the test.
    const together = ramp(frame, at.sixLines, 14) * 0.45;
    const kept = index === 6;
    const aside = ramp(frame, at.oneThing + 20, 14) * (kept ? 0 : 0.7);
    const backAgain = kept ? 0 : ramp(frame, at.nothingTells + 30, 20) * 0.7;
    return (
      on * Math.min(1, 1 - back + together) * Math.min(1, 1 - aside + backAgain)
    );
  };

  const strikeOn =
    inkProgress(frame, at.deleteIt, M.strike.duration) * (1 - restored);

  return (
    <SceneShell
      captions={captions}
      narration="problem-solving/01-best-time-to-buy-and-sell-stock/scene-06"
      tone={tone}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${tx}px, ${ty}px) scale(${blockScale})`,
          transformOrigin: "0 0",
        }}
      >
        <PriceChart
          points={PRICES.map((price, i) => ({
            day: i + 1,
            price,
            label: M.opacity.resting,
          }))}
          tone={tone}
        />

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

        {/* The question this code asks every day, as one worked case. */}
        <EquationRow
          sell={5}
          buy={1}
          result={4}
          on={exampleOn}
          frame={frame}
          from={at.lineMathMax + 20}
          ink={ink}
        />
        {/* The same question with the update line gone. Nothing ever wins. */}
        {BROKEN.map((b) => (
          <EquationRow
            key={b.sell}
            sell={b.sell}
            buy={7}
            result={b.sell - 7}
            // In, hold, out, and only then the next one. An eight frame
            // crossfade left two equations legible in the same row at once,
            // which read as one equation with the wrong answer in it.
            on={
              brokenNow *
              ramp(frame, at.neverMoves + b.at, 6) *
              (1 - ramp(frame, at.neverMoves + b.at + 20, 6))
            }
            frame={frame}
            from={at.neverMoves + b.at}
            stagger={0}
            ink={ink}
          />
        ))}

        <Slot
          x={SLOT.cheapest}
          was="cheapest so far"
          now="minPrice"
          morphAt={at.morph1}
          weight={slotLift("cheapest")}
          held="$1"
          broken="$7"
          brokenNow={brokenNow}
          frame={frame}
          ink={ink}
          quiet={quiet}
        />
        <Slot
          x={SLOT.best}
          was="best profit so far"
          now="maxProfit"
          // Act 5 dropped this one behind the circle it drew and this act opens
          // on that frame. The circle is still there, so the label stays back.
          labelDim={0.45}
          morphAt={at.morph2}
          weight={slotLift("best")}
          held="$5"
          broken="$0"
          brokenNow={brokenNow}
          frame={frame}
          ink={ink}
          quiet={quiet}
        />

        {/* Left to right, which is what the loop does and what a lift cannot say. */}
        <Ink
          mark={walkArrow}
          progress={inkProgress(frame, at.lineFor + 16, 12)}
          at={{ x: 960, y: 160 }}
          size={400}
          color={ink}
          opacity={
            ramp(frame, at.lineFor + 16, 12) *
            (1 - ramp(frame, at.lineMathMax, 16))
          }
          tone={tone}
        />

        {/* Act 5 drew this. It is inherited, not drawn again. */}
        <Ink
          mark={circle}
          progress={1}
          at={{ x: SLOT.best, y: SLOT.valueY + 34 }}
          size={106}
          color={ink}
          tone={tone}
        />
      </div>

      {LINES.map((text, i) => {
        const on = lineState(i);
        if (on <= 0.01) return null;
        return (
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
              opacity: on,
            }}
          >
            {text}
          </div>
        );
      })}

      {/* The line the test deletes.
          A hand X at its natural aspect is a small mark sitting in the middle
          of a 670px line, which reads as a smudge rather than as a deletion.
          Flattened, the same captured strokes read as what crossing out a line
          of text actually looks like. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: "scaleX(8.2) scaleY(0.6)",
          transformOrigin: `${STRIKE.x}px ${codeLineMid(6)}px`,
        }}
      >
        <Ink
          mark={strike}
          progress={strikeOn}
          at={{ x: STRIKE.x, y: codeLineMid(6) }}
          size={76}
          color={ink}
          opacity={strikeOn}
          tone={tone}
        />
      </div>
    </SceneShell>
  );
};

/** A slot whose label changes name without the box moving. */
const Slot: React.FC<{
  x: number;
  was: string;
  now: string;
  /** Held back where ink is drawn across it. */
  labelDim?: number;
  /** Resting or active, following the code line that is about this slot. */
  weight?: number;
  morphAt: number;
  held: string;
  broken: string;
  brokenNow: number;
  frame: number;
  ink: string;
  quiet: string;
}> = ({
  x,
  was,
  now,
  labelDim = 1,
  weight = 1,
  morphAt,
  held,
  broken,
  brokenNow,
  frame,
  ink,
  quiet,
}) => {
  const morph = interpolate(
    frame,
    [morphAt, morphAt + 12],
    [0, 1],
    EASE_IN_OUT,
  );
  const base = {
    position: "absolute" as const,
    left: x - 300,
    top: SLOT.labelY,
    width: 600,
    textAlign: "center" as const,
    color: quiet,
  };
  return (
    <>
      <div
        style={{
          ...base,
          fontFamily: "inherit",
          fontSize: SLOT.labelSize,
          fontWeight: 600,
          letterSpacing: "0.14em",
          opacity: (1 - morph) * labelDim * weight,
        }}
      >
        {was}
      </div>
      <div
        style={{
          ...base,
          fontFamily: theme.monoFamily,
          fontSize: SLOT.labelSize + 5,
          fontWeight: 500,
          opacity: morph * labelDim * weight,
        }}
      >
        {now}
      </div>
      <Mono
        x={x}
        y={SLOT.valueY}
        width={400}
        size={SLOT.valueSize}
        weight={700}
        color={ink}
        opacity={(1 - brokenNow) * weight}
      >
        {held}
      </Mono>
      <Mono
        x={x}
        y={SLOT.valueY}
        width={400}
        size={SLOT.valueSize}
        weight={700}
        color={ink}
        opacity={brokenNow * weight}
      >
        {broken}
      </Mono>
    </>
  );
};

/** One line of arithmetic in the block's equation row. */
const EquationRow: React.FC<{
  sell: number;
  buy: number;
  result: number;
  on: number;
  frame: number;
  from: number;
  /** Frames between terms. Zero for a replay that is too fast to read anyway. */
  stagger?: number;
  ink: string;
}> = ({ sell, buy, result, on, frame, from, stagger = 4, ink }) => {
  if (on <= 0.01) return null;
  const won = result > 0;
  const term = (
    x: number,
    delay: number,
    node: React.ReactNode,
    color: string,
  ) => {
    const s = store(frame, from + delay);
    return (
      <Mono
        x={x}
        y={EQUATION.y}
        width={160}
        size={EQUATION.size}
        color={color}
        opacity={s.opacity * on}
        dy={s.y}
      >
        {node}
      </Mono>
    );
  };
  return (
    <>
      {term(COLUMN.sell, 0, `$${sell}`, ink)}
      {term(COLUMN.minus, stagger, "-", ink)}
      {term(COLUMN.buy, stagger * 2, `$${buy}`, ink)}
      {term(COLUMN.equals, stagger * 3, "=", ink)}
      {term(
        COLUMN.result,
        stagger * 4,
        won ? `$${result}` : `-$${Math.abs(result)}`,
        won ? theme.colors.gain : theme.colors.loss,
      )}
    </>
  );
};
