import type { Caption } from "@remotion/captions";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../../shared/brand/theme";
import { Mono } from "../../../shared/page/Mono";
import { CHART, PriceChart, dayX } from "../../../shared/page/PriceChart";
import {
  TradeMarker,
  TradePath,
  markerAnchor,
  type MarkerAnchor,
} from "../../../shared/page/TradeMarks";
import { problemSolvingMotion as M, store } from "../../../shared/page/motion";
import { SceneShell } from "../../../shared/primitives/SceneShell";
import { Sfx } from "../../../shared/primitives/Sfx";
import { EASE_IN_OUT, EASE_OUT } from "../../../shared/video/motion";
import { phraseFrame } from "../../../shared/video/captions";
import captionData from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/audio/captions/scene-02.json";

const captions = captionData as Caption[];

/**
 * Every beat is the frame its phrase is spoken, read from the locked take.
 * Nothing here is a hand-picked frame, so a re-record moves the picture with
 * the voice instead of quietly desynchronising it.
 */
const at = {
  buyDay1: phraseFrame(captions, "start on day 1"),
  buyAt7: phraseFrame(captions, "you buy at 7"),
  sell2: phraseFrame(captions, "day 2"),
  sell3: phraseFrame(captions, "or 3"),
  sell4: phraseFrame(captions, "or 4"),
  tryAll: phraseFrame(captions, "so try them all"),
  allLose: phraseFrame(captions, "every option loses money"),
  bestDay1: phraseFrame(captions, "the best you can do"),
  moveBuy: phraseFrame(captions, "move the buy day forward"),
  buyAt1: phraseFrame(captions, "now you buy at 1"),
  tryAgain: phraseFrame(captions, "try every day after it again"),
  sellAt5: phraseFrame(captions, "sell at 5"),
  sellAt3: phraseFrame(captions, "sell at 3"),
  sellAt6: phraseFrame(captions, "sell at 6"),
  keepGoing: phraseFrame(captions, "keep going"),
  checkEvery: phraseFrame(captions, "check every buy day"),
  soItWorks: phraseFrame(captions, "so it works"),
  sixPrices: phraseFrame(captions, "6 prices"),
  hundred: phraseFrame(captions, "a hundred prices"),
  fiveK: phraseFrame(captions, "5000"),
  hundredK: phraseFrame(captions, "a hundred thousand"),
  fiveB: phraseFrame(captions, "5 billion"),
  answerRight: phraseFrame(captions, "the answer is right"),
  lookDay5: phraseFrame(captions, "look at day 5"),
};

const PRICES = [7, 1, 5, 3, 6, 4] as const;
const priceOn = (day: number) => PRICES[day - 1];

/** 0 to 1 across a window, eased. */
const ramp = (frame: number, from: number, over: number) =>
  interpolate(frame, [from, from + over], [0, 1], EASE_OUT);

/**
 * Every pair the search checks, in the order the search finds them.
 *
 * Buy day first, then every later sell day, which is how a beginner actually
 * reaches for it. Sweeping by sell day instead would give the triangular
 * numbers and would answer Act 3's question before Act 3 asks it.
 *
 * The counter is `filter(...).length` on this list rather than a second set of
 * numbers, so the count on screen cannot disagree with the paths on screen.
 */
type Pair = {
  buy: number;
  sell: number;
  from: number;
  /** Where focus goes, when the next pair arrives too late to take it. */
  back?: number;
};

const PAIRS: readonly Pair[] = [
  { buy: 1, sell: 2, from: at.sell2 },
  { buy: 1, sell: 3, from: at.sell3 },
  { buy: 1, sell: 4, from: at.sell4 },
  { buy: 1, sell: 5, from: at.tryAll + 4 },
  // Focus leaves this one on "every option loses money", where all five
  // become one set. Left to the default it would stay lit until day 2's
  // first trade, pointing at day 6 while the narration named day 5.
  { buy: 1, sell: 6, from: at.tryAll + 27, back: at.allLose },
  { buy: 2, sell: 3, from: at.sellAt5 },
  { buy: 2, sell: 4, from: at.sellAt3 },
  { buy: 2, sell: 5, from: at.sellAt6 },
  { buy: 2, sell: 6, from: at.keepGoing },
  { buy: 3, sell: 4, from: at.keepGoing + 5 },
  { buy: 3, sell: 5, from: at.keepGoing + 10 },
  { buy: 3, sell: 6, from: at.keepGoing + 15 },
  { buy: 4, sell: 5, from: at.keepGoing + 20 },
  { buy: 4, sell: 6, from: at.keepGoing + 25 },
  { buy: 5, sell: 6, from: at.keepGoing + 30 },
];

/**
 * Paths the narration picks back up after they have sat back.
 *
 * Without the first of these the brightest thing on screen during "the best you
 * can do buying at seven is lose a dollar" was the path to day 6, which is
 * where the three dollar loss was.
 */
const HIGHLIGHTS = [
  { buy: 1, sell: 5, from: at.bestDay1, until: at.moveBuy },
  { buy: 2, sell: 5, from: at.checkEvery, until: at.hundred },
] as const;

/** The four paths that end on day 5, lifted one at a time for Act 3. */
const LIFT_DAY5: Record<number, number> = {
  1: at.lookDay5 + 36,
  2: at.lookDay5 + 52,
  3: at.lookDay5 + 68,
  4: at.lookDay5 + 84,
};

/** Where the sell marker rests, and when it gets there. */
type Stop = { from: number; day: number };

const SWEEP_ONE: readonly Stop[] = [
  { from: at.sell2, day: 2 },
  { from: at.sell3, day: 3 },
  { from: at.sell4, day: 4 },
  { from: at.tryAll + 4, day: 5 },
  { from: at.tryAll + 27, day: 6 },
];
const SWEEP_TWO: readonly Stop[] = [
  { from: at.tryAgain + 5, day: 3 },
  { from: at.sellAt3, day: 4 },
  { from: at.sellAt6, day: 5 },
  { from: at.keepGoing, day: 6 },
];

const TRAVEL = 16;

/**
 * A marker that holds on a day, then slides to the next one and holds again.
 *
 * Interpolating straight across the stops would leave it drifting the whole
 * time and resting nowhere, which reads as a thing being dragged rather than a
 * search stepping forward. Each stop gets a hold segment and a travel segment.
 */
const sweepAnchor = (frame: number, stops: readonly Stop[]): MarkerAnchor => {
  const inputs: number[] = [];
  const places: MarkerAnchor[] = [];
  stops.forEach((stop, i) => {
    const place = markerAnchor(stop.day, priceOn(stop.day), "above", PRICES);
    if (i > 0) {
      inputs.push(stop.from - TRAVEL);
      places.push(places[places.length - 1]);
    }
    inputs.push(stop.from);
    places.push(place);
  });
  const along = (pick: (place: MarkerAnchor) => number) =>
    interpolate(frame, inputs, places.map(pick), EASE_IN_OUT);
  return {
    x: along((p) => p.x),
    markerY: along((p) => p.markerY),
    labelY: along((p) => p.labelY),
  };
};

/**
 * A hundred prices, then a hundred thousand, as an abstract band.
 *
 * The six-day chart cannot show either, and a chart with a hundred readable
 * days is a chart nobody reads. The band is a random walk rather than noise,
 * because a price series wanders and static does not, and it keeps the axis
 * exactly where the real chart had it so the pull-back reads as the same
 * picture getting further away.
 */
const wobble = (i: number) => {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

const BAND = { left: 380, right: 1540, top: 300, bottom: 560 } as const;

const bandWalk = (count: number) => {
  const out: number[] = [];
  let v = 0.5;
  for (let i = 0; i < count; i += 1) {
    v += (wobble(i + 1) - 0.5) * 0.34;
    if (v < 0.04) v = 0.08 - v;
    if (v > 0.96) v = 1.92 - v;
    out.push(v);
  }
  return out;
};

const PriceBand: React.FC<{
  count: number;
  opacity: number;
  dots: boolean;
}> = ({ count, opacity, dots }) => {
  if (opacity <= 0.01) return null;
  const walk = bandWalk(count);
  const points = walk.map((v, i) => ({
    x: BAND.left + ((BAND.right - BAND.left) * i) / (count - 1),
    y: BAND.top + (BAND.bottom - BAND.top) * v,
  }));
  const d = points
    .map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0, opacity }}
    >
      <line
        x1={BAND.left - 50}
        y1={CHART.base + 26}
        x2={BAND.right + 50}
        y2={CHART.base + 26}
        stroke={theme.colors.grayDark}
        strokeWidth={2}
      />
      <path
        d={d}
        fill="none"
        stroke={theme.colors.chalk}
        strokeWidth={dots ? 1.8 : 1}
        strokeLinejoin="round"
        opacity={dots ? 0.75 : 0.85}
      />
      {dots &&
        points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill={theme.colors.chalk}
            opacity={0.85}
          />
        ))}
    </svg>
  );
};

/** Thousands separators, without asking the host for a locale. */
const grouped = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const BuyAndSellScene02: React.FC<{ tone?: "paper" | "black" }> = ({
  tone = "black",
}) => {
  const frame = useCurrentFrame();
  const dark = tone === "black";
  const ink = dark ? theme.colors.chalk : theme.colors.ink;
  const quiet = dark ? theme.colors.grayDark : theme.colors.gray;

  /**
   * The chart, and the pull-back that replaces it with the band.
   *
   * Act 1 left the chart in its home position and this act opens on it
   * unchanged, so there is no reset and no title card. It leaves once, for the
   * scale sequence, and comes back to exactly where it was.
   */
  const camera = interpolate(
    frame,
    [at.hundred, at.hundred + 30, at.answerRight + 4, at.answerRight + 40],
    [1, 0.85, 0.85, 1],
    EASE_IN_OUT,
  );
  const chartOn = Math.min(
    1,
    1 - ramp(frame, at.hundred, 18) + ramp(frame, at.answerRight + 18, 22),
  );

  const activeDot = (day: number) => {
    if (day === 1)
      return ramp(frame, at.buyDay1, 10) * (1 - ramp(frame, at.moveBuy, 12));
    if (day === 2)
      return ramp(frame, at.buyAt1, 10) * (1 - ramp(frame, at.keepGoing, 12));
    if (day === 5) return ramp(frame, at.lookDay5, 12);
    return 0;
  };

  const pathOn = (index: number) => {
    const pair = PAIRS[index];
    const next = PAIRS[index + 1];
    const on = ramp(frame, pair.from, 12);
    // The last pair has no successor to hand focus to, so it hands it to the
    // line that collects all fifteen.
    const backAt = pair.back ?? next?.from ?? at.checkEvery + 12;
    const base = on * (1 - ramp(frame, backAt, 8) * 0.7);

    const again = HIGHLIGHTS.filter(
      (h) => h.buy === pair.buy && h.sell === pair.sell,
    ).map((h) => ramp(frame, h.from, 12) * (1 - ramp(frame, h.until, 10)));

    // Act 3's opening frame, built here: everything that does not end on day 5
    // drops further back, and the four that do come up one at a time.
    const lifted = pair.sell === 5 ? ramp(frame, LIFT_DAY5[pair.buy], 10) : 0;
    const pushed = pair.sell === 5 ? 0 : ramp(frame, at.lookDay5, 16) * 0.6;

    return Math.max(base * (1 - pushed), lifted, ...again) * chartOn;
  };

  // The buy day moves once, on "move the buy day forward".
  const buySlide = interpolate(
    frame,
    [at.moveBuy + 27, at.moveBuy + 49],
    [0, 1],
    EASE_IN_OUT,
  );
  const buyFrom = markerAnchor(1, 7, "above", PRICES);
  const buyTo = markerAnchor(2, 1, "above", PRICES);
  const buyAnchor: MarkerAnchor = {
    x: buyFrom.x + (buyTo.x - buyFrom.x) * buySlide,
    markerY: buyFrom.markerY + (buyTo.markerY - buyFrom.markerY) * buySlide,
    labelY: buyFrom.labelY + (buyTo.labelY - buyFrom.labelY) * buySlide,
  };
  const buyOn =
    ramp(frame, at.buyAt7, 12) * (1 - ramp(frame, at.keepGoing, 16)) * chartOn;

  const sweepOneOn =
    ramp(frame, at.sell2, 10) * (1 - ramp(frame, at.bestDay1, 14)) * chartOn;
  const sweepTwoOn =
    ramp(frame, at.tryAgain, 12) *
    (1 - ramp(frame, at.keepGoing + 8, 16)) *
    chartOn;
  const sweepDay = (stops: readonly Stop[]) =>
    stops.reduce((best, stop) => (frame >= stop.from ? stop : best)).day;

  /**
   * The five results from day 1, sitting under the day they belong to.
   *
   * Beside the sell dot is where these want to go, and it is where they collide
   * with the price labels and the chart line. One horizontal band under the
   * days keeps them aligned with their sell day and clear of everything, and it
   * puts all five side by side for "every option loses money".
   */
  const TAGS = [
    { day: 2, profit: -6, from: at.sell2 },
    { day: 3, profit: -2, from: at.sell3 },
    { day: 4, profit: -4, from: at.sell4 },
    { day: 5, profit: -1, from: at.tryAll + 4 },
    { day: 6, profit: -3, from: at.tryAll + 27 },
  ];
  const TAG_Y = 736;
  const tagOn = (index: number) => {
    const tag = TAGS[index];
    const next = TAGS[index + 1];
    const on = ramp(frame, tag.from, 10);
    const back = next ? ramp(frame, next.from, 8) * 0.45 : 0;
    // "Every option loses money" wants all five read at once, so they all
    // come back up together.
    const together = ramp(frame, at.allLose, 12) * 0.45;
    return on * Math.min(1, 1 - back + together);
  };

  // The four losers clear out and the survivor moves into the summary slot.
  const summaryOut = 1 - ramp(frame, at.moveBuy, 14);
  const losersOut = 1 - ramp(frame, at.bestDay1, 14);
  const bestX = interpolate(
    frame,
    [at.bestDay1, at.bestDay1 + 28],
    [dayX(5), 1090],
    EASE_IN_OUT,
  );
  const bestY = interpolate(
    frame,
    [at.bestDay1, at.bestDay1 + 28],
    [TAG_Y, 782],
    EASE_IN_OUT,
  );
  const bestSize = interpolate(
    frame,
    [at.bestDay1, at.bestDay1 + 28],
    [34, 44],
    EASE_IN_OUT,
  );

  /**
   * Day 2's three narrated trades, stacked.
   *
   * They accumulate rather than replace, because the point of the beat is that
   * the work piles up. The one that finds the answer stays at full weight and
   * the two before it sit back.
   */
  const EQUATIONS = [
    { from: at.sellAt5, y: 758, left: "$5 - $1 = ", result: "$4" },
    { from: at.sellAt3, y: 812, left: "$3 - $1 = ", result: "$2" },
    { from: at.sellAt6, y: 866, left: "$6 - $1 = ", result: "$5" },
  ];
  const eqOn = (index: number) => {
    const eq = EQUATIONS[index];
    const next = EQUATIONS[index + 1];
    const on = ramp(frame, eq.from, 10);
    const back = next ? ramp(frame, next.from, 8) * 0.45 : 0;
    return on * (1 - back) * (1 - ramp(frame, at.keepGoing, 16));
  };

  /**
   * The working region's centre slot, one card at a time.
   *
   * Every card lives in the same place and dissolves into the next, six frames
   * of overlap, so the slot never blinks empty between two lines that belong to
   * one thought.
   */
  const CARDS: { from: number; node: React.ReactNode }[] = [
    {
      from: at.soItWorks,
      node: (
        <>
          BEST&nbsp;&nbsp;
          <span style={{ color: theme.colors.gain }}>+$5</span>
        </>
      ),
    },
    { from: at.sixPrices, node: "6 prices" },
    { from: at.hundred, node: "100 prices" },
    { from: at.hundredK, node: "100,000 prices" },
  ];
  const cardOn = (index: number) => {
    const next = CARDS[index + 1];
    const on = ramp(frame, CARDS[index].from + 6, 12);
    const off = next
      ? ramp(frame, next.from, 8)
      : ramp(frame, at.answerRight, 16);
    // The last card is still true when the hero number lands, so it sits back
    // rather than leaving.
    const back =
      index === CARDS.length - 1 ? 1 - ramp(frame, at.fiveB, 12) * 0.7 : 1;
    return on * (1 - off) * back;
  };

  /**
   * The counter.
   *
   * It reads the pair list, so it can never run ahead of the paths. It never
   * lifts while it is counting, because in those beats the equation owns the
   * frame and a counter that animates competes with the thing it counts. It
   * lifts once, on "six prices is fifteen pairs", which is the only line that
   * is about the counter.
   */
  const revealed = PAIRS.filter((pair) => frame >= pair.from).length;
  const rolling = Math.round(
    interpolate(frame, [at.hundred + 20, at.fiveK], [15, 5000], EASE_OUT),
  );
  const count = frame < at.hundred + 20 ? revealed : rolling;
  const counterOn =
    ramp(frame, at.moveBuy, 12) * (1 - ramp(frame, at.hundredK, 14));
  const counterLift = ramp(frame, at.sixPrices, 12);

  const bandOn =
    ramp(frame, at.hundred + 10, 16) * (1 - ramp(frame, at.hundredK, 14));
  const denseOn =
    ramp(frame, at.hundredK + 6, 16) * (1 - ramp(frame, at.answerRight, 16));
  // Everything that is not the number sits back while the number is up. The
  // band goes further than the contract's faded, because it is the one thing
  // the number is drawn on top of, and at 0.3 it showed through the digits.
  const behindHero = 1 - ramp(frame, at.fiveB, 12) * 0.82;
  // Cuts in rather than rolling. A digit roll at this size is an arcade
  // treatment, and the point is that counting has stopped being watchable.
  const heroOn =
    ramp(frame, at.fiveB, 4) * (1 - ramp(frame, at.answerRight, 14));

  return (
    <SceneShell
      captions={captions}
      narration="problem-solving/01-best-time-to-buy-and-sell-stock/scene-02"
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
        <div style={{ position: "absolute", inset: 0, opacity: chartOn }}>
          <PriceChart
            points={PRICES.map((price, i) => ({
              day: i + 1,
              price,
              active: activeDot(i + 1),
            }))}
            tone={tone}
          />
        </div>

        {PAIRS.map((pair, i) => {
          const on = pathOn(i);
          return (
            <TradePath
              key={`${pair.buy}-${pair.sell}`}
              buyDay={pair.buy}
              buyPrice={priceOn(pair.buy)}
              sellDay={pair.sell}
              sellPrice={priceOn(pair.sell)}
              progress={ramp(frame, pair.from, 14)}
              opacity={on}
              head={on > 0.72}
              width={on > 0.72 ? 3 : 2}
            />
          );
        })}

        <PriceBand count={100} opacity={bandOn * behindHero} dots />
        <PriceBand count={600} opacity={denseOn * behindHero} dots={false} />
      </div>

      <TradeMarker
        day={buySlide < 0.5 ? 1 : 2}
        price={buySlide < 0.5 ? 7 : 1}
        kind="buy"
        progress={buyOn}
        prices={PRICES}
        anchor={buyAnchor}
        tone={tone}
      />
      <TradeMarker
        day={sweepDay(SWEEP_ONE)}
        price={priceOn(sweepDay(SWEEP_ONE))}
        kind="sell"
        progress={sweepOneOn}
        prices={PRICES}
        anchor={sweepAnchor(frame, SWEEP_ONE)}
        tone={tone}
      />
      <TradeMarker
        day={sweepDay(SWEEP_TWO)}
        price={priceOn(sweepDay(SWEEP_TWO))}
        kind="sell"
        progress={sweepTwoOn}
        prices={PRICES}
        anchor={sweepAnchor(frame, SWEEP_TWO)}
        tone={tone}
      />

      {/* Act 1's closing question, still on screen, on its way out. */}
      <Mono
        x={960}
        y={800}
        size={54}
        weight={700}
        color={ink}
        opacity={1 - ramp(frame, 96, 26)}
      >
        MAXIMUM PROFIT = ?
      </Mono>

      {/* Day 1's five results. */}
      {TAGS.map((tag, i) => {
        const survivor = tag.day === 5;
        const on = tagOn(i) * (survivor ? summaryOut : losersOut);
        if (on <= 0.01) return null;
        return (
          <Mono
            key={tag.day}
            x={survivor ? bestX : dayX(tag.day)}
            y={survivor ? bestY : TAG_Y}
            size={survivor ? bestSize : 34}
            weight={700}
            width={220}
            color={theme.colors.loss}
            opacity={on}
          >
            -${Math.abs(tag.profit)}
          </Mono>
        );
      })}
      <Mono
        x={bestX - 250}
        y={bestY + 10}
        size={26}
        width={420}
        color={quiet}
        opacity={ramp(frame, at.bestDay1 + 14, 14) * summaryOut}
      >
        best from day 1
      </Mono>

      {/* Day 2's three narrated trades. */}
      {EQUATIONS.map((eq, i) => {
        const on = eqOn(i);
        if (on <= 0.01) return null;
        return (
          <Mono
            key={eq.left}
            x={960}
            y={eq.y}
            size={40}
            color={ink}
            opacity={on}
            dy={store(frame, eq.from).y}
          >
            {eq.left}
            <span
              style={{
                color: theme.colors.gain,
                opacity: i === EQUATIONS.length - 1 ? 1 : 0.72,
              }}
            >
              {eq.result}
            </span>
          </Mono>
        );
      })}

      {/* The centre slot: the answer, then the scale it has to survive. */}
      {CARDS.map((card, i) => {
        const on = cardOn(i);
        if (on <= 0.01) return null;
        return (
          <Mono
            key={i}
            x={960}
            y={786}
            size={44}
            weight={700}
            color={ink}
            opacity={on}
          >
            {card.node}
          </Mono>
        );
      })}

      {counterOn > 0.01 && (
        <>
          <div
            style={{
              position: "absolute",
              left: 1540,
              top: 766,
              width: 300,
              textAlign: "center",
              fontFamily: theme.monoFamily,
              fontSize: 15,
              letterSpacing: "0.22em",
              color: quiet,
              opacity: counterOn * 0.8,
            }}
          >
            CHECKS
          </div>
          <Mono
            x={1690}
            y={788}
            size={40}
            weight={700}
            width={300}
            color={ink}
            opacity={
              counterOn *
              (M.opacity.resting +
                (M.opacity.active - M.opacity.resting) * counterLift)
            }
          >
            {grouped(count)}
          </Mono>
        </>
      )}

      {/* The number that ends the argument. */}
      {heroOn > 0.01 && (
        <>
          <Mono
            x={960}
            y={412}
            size={128}
            weight={700}
            color={ink}
            opacity={heroOn}
          >
            5,000,000,000
          </Mono>
          <Sfx name="land" at={at.fiveB} gain={0.6} />
        </>
      )}
    </SceneShell>
  );
};
