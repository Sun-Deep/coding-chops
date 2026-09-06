import type { Caption } from "@remotion/captions";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../../shared/brand/theme";
import { Ink } from "../../../shared/ink/Ink";
import type { InkMark } from "../../../shared/ink/types";
import { Mono } from "../../../shared/page/Mono";
import {
  PriceChart,
  dayX,
  priceLabelSide,
  priceY,
} from "../../../shared/page/PriceChart";
import { TradePath } from "../../../shared/page/TradeMarks";
import { CARET, SLOT } from "../../../shared/page/layout";
import { problemSolvingMotion as M, store } from "../../../shared/page/motion";
import { SceneShell } from "../../../shared/primitives/SceneShell";
import { EASE_IN_OUT, EASE_OUT } from "../../../shared/video/motion";
import { phraseFrame } from "../../../shared/video/captions";
import captionData from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/audio/captions/scene-04.json";
import circleMark from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/circle-05.json";

const captions = captionData as Caption[];
/** Act 3 drew this one. It is inherited, not drawn again. */
const circle = circleMark as unknown as InkMark;

const at = {
  carry: phraseFrame(captions, "carry it with you"),
  notEvery: phraseFrame(captions, "not every old price"),
  startAgain: phraseFrame(captions, "start again from day 1"),
  day1: phraseFrame(captions, "day 1"),
  cheapest7: phraseFrame(captions, "cheapest so far is 7"),
  day2: phraseFrame(captions, "day 2"),
  sevenGoes: phraseFrame(captions, "so 7 goes"),
  cheapest1: phraseFrame(captions, "cheapest so far is 1"),
  day3: phraseFrame(captions, "day 3 is 5"),
  // "Nothing changes" is said twice on purpose, so that Act 5's step where
  // nothing updates lands as familiar rather than as a surprise. Which means
  // there is no phrase that tells the two apart, only their order.
  nothing3: phraseFrame(captions, "nothing changes"),
  day4: phraseFrame(captions, "day 4 is 3"),
  nothing4: phraseFrame(captions, "nothing changes", { occurrence: 2 }),
  wholeRule: phraseFrame(captions, "that's the whole rule"),
  findCheaper: phraseFrame(captions, "find something cheaper"),
  replaceIt: phraseFrame(captions, "replace it"),
  otherwise: phraseFrame(captions, "otherwise leave it alone"),
  neverLook: phraseFrame(captions, "and now you never look"),
};

const PRICES = [7, 1, 5, 3, 6, 4] as const;
const priceOn = (day: number) => PRICES[day - 1];

const ramp = (frame: number, from: number, over: number) =>
  interpolate(frame, [from, from + over], [0, 1], EASE_OUT);

/** Exactly where PriceChart puts a price label. */
const labelSpot = (day: number) => ({
  x: dayX(day),
  y:
    priceY(priceOn(day)) +
    (priceLabelSide(PRICES, day - 1) === "below" ? 26 : -62),
});

/** The walk, and where the marker rests on each step. */
const STEPS = [
  { from: at.day1, day: 1 },
  { from: at.day2, day: 2 },
  { from: at.day3, day: 3 },
  { from: at.day4, day: 4 },
] as const;
const TRAVEL = 16;

/**
 * What the slot holds, in order.
 *
 * It reads $1 first, because Act 3's compression lands there and this act
 * opens by finishing it. Then the walk restarts at day 1 and the slot goes
 * back to $7, which looks like going backwards until you hear the narration
 * say so. `beaten` is when a value is declared out-argued, which happens a
 * beat before it is actually replaced.
 */
const HELD = [
  { value: 1, from: 48 },
  { value: 7, from: at.cheapest7, beaten: at.sevenGoes },
  { value: 1, from: at.cheapest1 },
] as const;

/** Every pair Act 2 checked, for the one line that names what it cost. */
const PAIRS = ([] as { buy: number; sell: number }[]).concat(
  ...[1, 2, 3, 4, 5].map((buy) =>
    [2, 3, 4, 5, 6].filter((sell) => sell > buy).map((sell) => ({ buy, sell })),
  ),
);

export const BuyAndSellScene04: React.FC<{ tone?: "paper" | "black" }> = ({
  tone = "black",
}) => {
  const frame = useCurrentFrame();
  const dark = tone === "black";
  const ink = dark ? theme.colors.chalk : theme.colors.ink;
  const quiet = dark ? theme.colors.grayDark : theme.colors.gray;

  /**
   * Act 3 cut mid-compression, so this act opens on exactly that: the chart
   * receded to 0.35, three values 42% of the way to the $1, the circle drawn.
   * Finishing the movement is the first thing that happens.
   */
  const drift = interpolate(frame, [0, 52], [0.42, 1], EASE_IN_OUT);
  const driftOn = 1 - ramp(frame, 40, 24);
  const DRIFTING = [1, 3, 4];
  const target = labelSpot(2);

  /** The chart comes back up as the collapse finishes. */
  const chartBack = ramp(frame, at.notEvery, 24);
  const reset = ramp(frame, at.startAgain, 20);

  /**
   * Price labels.
   *
   * Before the reset the three collapsed values are gone, because Act 3 sent
   * them away. After it every price is back at resting and the day the marker
   * is on lifts. Days 5 and 6 never lift, which is the walk saying it has not
   * got there yet.
   */
  const LIT: Record<number, readonly [number, number]> = {
    1: [at.day1, at.day2],
    2: [at.day2, at.day3],
    3: [at.day3, at.nothing3],
    4: [at.day4, at.nothing4],
  };
  const labelLevel = (day: number) => {
    const before = DRIFTING.includes(day) ? 0 : 1;
    const window = LIT[day];
    const lit = window
      ? ramp(frame, window[0], 10) * (1 - ramp(frame, window[1], 12))
      : 0;
    const walking = M.opacity.resting + (1 - M.opacity.resting) * lit;
    return before + (walking - before) * reset;
  };

  const activeDot = (day: number) => {
    const window = LIT[day];
    const walking = window
      ? ramp(frame, window[0], 10) * (1 - ramp(frame, window[1], 12))
      : 0;
    // Day 2 arrives active, because Act 3 left it that way.
    const inherited = day === 2 ? 1 - reset : 0;
    return Math.max(walking * reset, inherited);
  };

  /** The marker holds on a day, then travels, then holds again. */
  const markerX = interpolate(
    frame,
    STEPS.flatMap((step, i) =>
      i === 0 ? [step.from] : [step.from - TRAVEL, step.from],
    ),
    STEPS.flatMap((step, i) =>
      i === 0 ? [dayX(step.day)] : [dayX(STEPS[i - 1].day), dayX(step.day)],
    ),
    EASE_IN_OUT,
  );
  const markerOn = ramp(frame, at.day1, 12);

  /**
   * The stored value.
   *
   * A replaced number leaves upward while its successor rises into the same
   * place, so the swap reads as one slot changing rather than as two numbers
   * sharing a line.
   */
  const heldState = (index: number) => {
    const entry = HELD[index];
    const next = HELD[index + 1];
    const s = store(frame, entry.from);
    const leaving = next ? ramp(frame, next.from - 8, 12) : 0;
    const dimmed =
      "beaten" in entry && entry.beaten !== undefined
        ? 1 - ramp(frame, entry.beaten, 14) * 0.55
        : 1;
    return {
      opacity: s.opacity * dimmed * (1 - leaving),
      y: s.y - 34 * leaving,
    };
  };

  /** The pull-back that makes room for the rule. */
  const camera = interpolate(
    frame,
    [at.wholeRule, at.wholeRule + 30, at.neverLook, at.neverLook + 40],
    [1, 0.84, 0.84, 1],
    EASE_IN_OUT,
  );
  const ruleOut = 1 - ramp(frame, at.neverLook, 16);

  /** Act 2's whole search, back for one line and then gone for good. */
  const ghosts =
    ramp(frame, at.neverLook + 6, 20) *
    (1 - ramp(frame, at.neverLook + 46, 30)) *
    0.16;

  return (
    <SceneShell
      captions={captions}
      narration="problem-solving/01-best-time-to-buy-and-sell-stock/scene-04"
      tone={tone}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${camera})`,
          transformOrigin: "50% 46%",
        }}
      >
        <PriceChart
          points={PRICES.map((price, i) => ({
            day: i + 1,
            price,
            active: activeDot(i + 1),
            label: labelLevel(i + 1),
          }))}
          opacity={0.35 + 0.65 * chartBack}
          tone={tone}
        />

        {PAIRS.map((pair) => (
          <TradePath
            key={`${pair.buy}-${pair.sell}`}
            buyDay={pair.buy}
            buyPrice={priceOn(pair.buy)}
            sellDay={pair.sell}
            sellPrice={priceOn(pair.sell)}
            progress={ramp(frame, at.neverLook + 6, 18)}
            opacity={ghosts}
          />
        ))}

        {/* Act 3's circle, still around the $1 it chose. */}
        <Ink
          mark={circle}
          progress={1}
          at={{ x: dayX(2), y: priceY(1) + 22 }}
          size={150}
          color={ink}
          opacity={1 - reset}
          tone={tone}
        />

        {/* The last of the collapse, and the number it collapses into. */}
        {driftOn > 0.01 && (
          <Mono
            x={target.x}
            y={target.y}
            width={120}
            size={34}
            color={ink}
            opacity={1 - chartBack}
          >
            $1
          </Mono>
        )}
        {driftOn > 0.01 &&
          DRIFTING.map((day) => {
            const from = labelSpot(day);
            return (
              <Mono
                key={day}
                x={from.x + (target.x - from.x) * drift}
                y={from.y + (target.y - from.y) * drift}
                width={120}
                size={34}
                color={ink}
                opacity={driftOn}
              >
                ${priceOn(day)}
              </Mono>
            );
          })}

        {/* The day the walk is standing on. */}
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

        {/* The state. One label, one number, no panel. */}
        <div
          style={{
            position: "absolute",
            left: SLOT.cheapest - 300,
            top: SLOT.labelY,
            width: 600,
            textAlign: "center",
            fontFamily: theme.fontFamily,
            fontSize: SLOT.labelSize,
            fontWeight: 600,
            letterSpacing: "0.14em",
            color: quiet,
            opacity: ramp(frame, 40, 16),
          }}
        >
          cheapest so far
        </div>
        {HELD.map((entry, i) => {
          const s = heldState(i);
          if (s.opacity <= 0.01) return null;
          return (
            <Mono
              key={i}
              x={SLOT.cheapest}
              y={SLOT.valueY}
              width={400}
              size={SLOT.valueSize}
              weight={700}
              color={ink}
              opacity={s.opacity}
              dy={s.y}
            >
              ${entry.value}
            </Mono>
          );
        })}
      </div>

      {/* The rule, in the two cases it has. */}
      <Mono
        x={960}
        y={860}
        size={30}
        color={ink}
        opacity={
          ramp(frame, at.findCheaper, 14) *
          (1 - ramp(frame, at.replaceIt, 10) * 0.45) *
          ruleOut
        }
      >
        cheaper &rarr; replace
      </Mono>
      <Mono
        x={960}
        y={900}
        size={30}
        color={ink}
        opacity={ramp(frame, at.otherwise, 14) * ruleOut}
      >
        otherwise &rarr; keep
      </Mono>
    </SceneShell>
  );
};
