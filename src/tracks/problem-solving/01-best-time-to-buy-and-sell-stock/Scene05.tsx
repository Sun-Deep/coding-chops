import type { Caption } from "@remotion/captions";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../../shared/brand/theme";
import { Ink } from "../../../shared/ink/Ink";
import type { InkMark } from "../../../shared/ink/types";
import { CARET, COLUMN, EQUATION, SLOT } from "../../../shared/page/layout";
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
import captionData from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/audio/captions/scene-05.json";
import circleMark from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/circle-03.json";

const captions = captionData as Caption[];
const circle = circleMark as unknown as InkMark;

const at = {
  // Whisper heard "Same walk" as one word and the caption correction can fix
  // the spelling but not split the token, so the beat is anchored on what
  // follows it.
  reset: phraseFrame(captions, "this time carry"),
  day1: phraseFrame(captions, "day 1"),
  isCheapest: phraseFrame(captions, "so it's the cheapest"),
  bestSlot: phraseFrame(captions, "so your best profit"),
  zero: phraseFrame(captions, "nothing 0"),
  day2: phraseFrame(captions, "day 2"),
  sellDay2: phraseFrame(captions, "sell today and you would lose"),
  lose6: phraseFrame(captions, "lose 6"),
  cheaperThan7: phraseFrame(captions, "but 1 is cheaper"),
  nowOne: phraseFrame(captions, "cheapest so far is now 1"),
  day3: phraseFrame(captions, "day 3"),
  whatWouldYouMake: phraseFrame(captions, "what would you make"),
  fiveMinus: phraseFrame(captions, "5 - 1"),
  minusOne3: phraseFrame(captions, "5 - 1", { end: true }),
  four: phraseFrame(captions, "4 beats 0"),
  bestFour: phraseFrame(captions, "so 4 is your best profit"),
  day4: phraseFrame(captions, "day 4"),
  sellDay4: phraseFrame(captions, "sell today and you make"),
  make2: phraseFrame(captions, "make 2"),
  doesTwoBeat: phraseFrame(captions, "does 2 beat 4"),
  no: phraseFrame(captions, "no so nothing changes"),
  stillFour: phraseFrame(captions, "best profit is still 4"),
  watchThat: phraseFrame(captions, "watch that"),
  day5: phraseFrame(captions, "day 5"),
  yourTurn: phraseFrame(captions, "your turn"),
  sixMinus: phraseFrame(captions, "6 - 1 is 5"),
  bestFive: phraseFrame(captions, "best profit is now 5"),
  day6: phraseFrame(captions, "day 6"),
  fourMinus: phraseFrame(captions, "4 - 1 is 3"),
  doesntBeat: phraseFrame(captions, "3 doesn't beat 5"),
  outOfDays: phraseFrame(captions, "nothing changes and you are out"),
  answer: phraseFrame(captions, "that's the answer"),
};

const PRICES = [7, 1, 5, 3, 6, 4] as const;

const ramp = (frame: number, from: number, over: number) =>
  interpolate(frame, [from, from + over], [0, 1], EASE_OUT);

/**
 * The walk. Six stops, and the frame each one is named on.
 *
 * `lit` runs until the next day arrives, except day 4, which stays lit through
 * the beat where nothing happens, and day 6, which lets go when the walk runs
 * out of days.
 */
const STEPS = [
  { day: 1, from: at.day1 },
  { day: 2, from: at.day2 },
  { day: 3, from: at.day3 },
  { day: 4, from: at.day4 },
  { day: 5, from: at.day5 },
  { day: 6, from: at.day6 },
] as const;
const TRAVEL = 16;

/**
 * Every day's arithmetic: today's price minus the cheapest price carried in.
 *
 * Day 2 subtracts $7, not $1, because the profit is computed before the
 * cheapest price moves. That order is not a trap. It is the order the walk
 * runs in, and Act 6 shows the same two lines in the same order.
 *
 * Where the narration says the terms out loud, each term lands on its own
 * word. Where it does not, the left side assembles on a stagger and only the
 * result waits for the number to be spoken.
 */
type Equation = {
  sell: number;
  buy: number;
  result: number;
  /** Left side, term by term. */
  when: readonly [number, number, number, number];
  resultAt: number;
  /** When it leaves. */
  until: number;
};

const step = (from: number): readonly [number, number, number, number] => [
  from,
  from + 5,
  from + 10,
  from + 15,
];

const EQUATIONS: Equation[] = [
  {
    sell: 1,
    buy: 7,
    result: -6,
    when: step(at.sellDay2),
    resultAt: at.lose6 + 8,
    until: at.cheaperThan7,
  },
  {
    sell: 5,
    buy: 1,
    result: 4,
    when: [at.fiveMinus, at.fiveMinus + 6, at.minusOne3 - 4, at.minusOne3 + 6],
    resultAt: at.four,
    until: at.day4,
  },
  {
    sell: 3,
    buy: 1,
    result: 2,
    when: step(at.sellDay4),
    resultAt: at.make2 + 8,
    until: at.no + 16,
  },
  {
    sell: 6,
    buy: 1,
    result: 5,
    when: step(at.sixMinus),
    resultAt: at.sixMinus + 33,
    until: at.day6,
  },
  {
    sell: 4,
    buy: 1,
    result: 3,
    when: step(at.fourMinus),
    resultAt: at.fourMinus + 32,
    until: at.outOfDays,
  },
];

/**
 * What each slot holds, in order.
 *
 * The cheapest slot arrives holding Act 4's $1 and lets go of it during the
 * reset, because "same walk" means starting over rather than continuing.
 */
type Held = { value: string; from: number; leaves?: number };

const CHEAPEST: Held[] = [
  { value: "$1", from: -20, leaves: 30 },
  { value: "$7", from: at.isCheapest, leaves: at.nowOne - 6 },
  { value: "$1", from: at.nowOne + 4 },
];
const BEST: Held[] = [
  { value: "$0", from: at.zero },
  { value: "$4", from: at.bestFour },
  { value: "$5", from: at.bestFive },
];

export const BuyAndSellScene05: React.FC<{ tone?: "paper" | "black" }> = ({
  tone = "black",
}) => {
  const frame = useCurrentFrame();
  const dark = tone === "black";
  const ink = dark ? theme.colors.chalk : theme.colors.ink;
  const quiet = dark ? theme.colors.grayDark : theme.colors.gray;

  /**
   * Act 4 parked the marker on day 4. It does not slide back: left to right is
   * forward in time for the whole episode, so the walk restarting is a
   * dissolve, the same way Act 4 restarted.
   */
  const inherited = 1 - ramp(frame, at.reset, 18);
  const walking = ramp(frame, at.day1, 12);

  const markerX = interpolate(
    frame,
    [
      // Act 4 parked it on day 4. It holds there until it has fully faded,
      // then moves to day 1 while invisible, because a marker travelling left
      // would say time ran backwards.
      -20,
      at.reset + 18,
      at.reset + 19,
      ...STEPS.flatMap((s, i) =>
        i === 0 ? [s.from] : [s.from - TRAVEL, s.from],
      ),
      at.outOfDays + 51,
      at.outOfDays + 91,
    ],
    [
      dayX(4),
      dayX(4),
      dayX(1),
      ...STEPS.flatMap((s, i) =>
        i === 0 ? [dayX(s.day)] : [dayX(STEPS[i - 1].day), dayX(s.day)],
      ),
      dayX(6),
      dayX(6) + 210,
    ],
    EASE_IN_OUT,
  );
  // Off the right edge, because the days ran out rather than because the walk
  // stopped caring.
  const markerOn =
    Math.max(inherited, walking) * (1 - ramp(frame, at.outOfDays + 60, 26));

  const litWindow = (day: number): readonly [number, number] | null => {
    const index = STEPS.findIndex((s) => s.day === day);
    if (index < 0) return null;
    const next = STEPS[index + 1];
    // Day 4 holds through the beat where nothing happens, and day 6 lets go
    // when the walk runs out of days rather than when a day 7 arrives.
    return [STEPS[index].from, next ? next.from : at.outOfDays];
  };

  const lit = (day: number) => {
    const window = litWindow(day);
    if (!window) return 0;
    return ramp(frame, window[0], 10) * (1 - ramp(frame, window[1], 12));
  };

  const labelLevel = (day: number) =>
    M.opacity.resting + (1 - M.opacity.resting) * lit(day);

  /** The push-in that ends the act on the number it was looking for. */
  const camera = interpolate(
    frame,
    [at.answer, at.answer + 40],
    [1, 1.08],
    EASE_IN_OUT,
  );

  const heldState = (entries: Held[], index: number) => {
    const entry = entries[index];
    const next = entries[index + 1];
    const s = store(frame, entry.from);
    const goes = entry.leaves ?? (next ? next.from - 8 : undefined);
    const leaving = goes === undefined ? 0 : ramp(frame, goes, 12);
    return { opacity: s.opacity * (1 - leaving), y: s.y - 34 * leaving };
  };

  const Slot: React.FC<{
    x: number;
    label: string;
    on: number;
    held: Held[];
    /** Drops out of the way when the circle is drawn over it. */
    dim?: number;
  }> = ({ x, label, on, held, dim = 1 }) => (
    <>
      <div
        style={{
          position: "absolute",
          left: x - 300,
          top: SLOT.labelY,
          width: 600,
          textAlign: "center",
          fontFamily: theme.fontFamily,
          fontSize: SLOT.labelSize,
          fontWeight: 600,
          letterSpacing: "0.14em",
          color: quiet,
          opacity: on * dim,
        }}
      >
        {label}
      </div>
      {held.map((entry, i) => {
        const s = heldState(held, i);
        if (s.opacity * on <= 0.01) return null;
        return (
          <Mono
            key={i}
            x={x}
            y={SLOT.valueY}
            width={400}
            size={SLOT.valueSize}
            weight={700}
            color={ink}
            opacity={s.opacity * on}
            dy={s.y}
          >
            {entry.value}
          </Mono>
        );
      })}
    </>
  );

  return (
    <SceneShell
      captions={captions}
      narration="problem-solving/01-best-time-to-buy-and-sell-stock/scene-05"
      tone={tone}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${camera})`,
          transformOrigin: "61.7% 80.7%",
        }}
      >
        <PriceChart
          points={PRICES.map((price, i) => ({
            day: i + 1,
            price,
            active: lit(i + 1),
            label: labelLevel(i + 1),
          }))}
          tone={tone}
        />

        {markerOn > 0.01 && (
          <svg
            width={1920}
            height={1080}
            viewBox="0 0 1920 1080"
            style={{ position: "absolute", inset: 0, opacity: markerOn }}
          >
            <polygon
              points={`${markerX - CARET.half},${CARET.base} ${markerX + CARET.half},${CARET.base} ${markerX},${CARET.apex}`}
              fill={ink}
            />
          </svg>
        )}

        {EQUATIONS.map((eq) => {
          const on =
            ramp(frame, eq.when[0], 10) * (1 - ramp(frame, eq.until, 14));
          if (on <= 0.01) return null;
          const won = eq.result > 0;
          return (
            <div key={`${eq.sell}-${eq.buy}-${eq.result}`}>
              <Term
                x={COLUMN.sell}
                from={eq.when[0]}
                frame={frame}
                color={ink}
                opacity={on}
              >
                ${eq.sell}
              </Term>
              <Term
                x={COLUMN.minus}
                from={eq.when[1]}
                frame={frame}
                color={ink}
                opacity={on}
              >
                -
              </Term>
              <Term
                x={COLUMN.buy}
                from={eq.when[2]}
                frame={frame}
                color={ink}
                opacity={on}
              >
                ${eq.buy}
              </Term>
              <Term
                x={COLUMN.equals}
                from={eq.when[3]}
                frame={frame}
                color={ink}
                opacity={on}
              >
                =
              </Term>
              <Term
                x={COLUMN.result}
                from={eq.resultAt}
                frame={frame}
                color={won ? theme.colors.gain : theme.colors.loss}
                opacity={on}
              >
                {won ? `$${eq.result}` : `-$${Math.abs(eq.result)}`}
              </Term>
            </div>
          );
        })}

        <Slot
          x={SLOT.cheapest}
          label="cheapest so far"
          on={1}
          held={CHEAPEST}
        />
        <Slot
          x={SLOT.best}
          label="best profit so far"
          on={ramp(frame, at.bestSlot, 14)}
          held={BEST}
          dim={1 - ramp(frame, at.answer + 10, 14) * 0.55}
        />

        {/* The only mark in the act, on the only number that was the point. */}
        <Ink
          mark={circle}
          progress={inkProgress(frame, at.answer + 10, M.circle.duration)}
          // Sized to the number, not to the slot. At 148 the top of the arc
          // crossed "best profit so far" and cut the heading in half.
          at={{ x: SLOT.best, y: SLOT.valueY + 34 }}
          size={106}
          color={ink}
          tone={tone}
        />
      </div>
    </SceneShell>
  );
};

/** One term of an equation, arriving with `store` and holding its column. */
const Term: React.FC<{
  children: React.ReactNode;
  x: number;
  from: number;
  frame: number;
  color: string;
  opacity: number;
}> = ({ children, x, from, frame, color, opacity }) => {
  const s = store(frame, from);
  const on = s.opacity * opacity;
  if (on <= 0.01) return null;
  return (
    <Mono
      x={x}
      y={EQUATION.y}
      width={160}
      size={EQUATION.size}
      color={color}
      opacity={on}
      dy={s.y}
    >
      {children}
    </Mono>
  );
};
