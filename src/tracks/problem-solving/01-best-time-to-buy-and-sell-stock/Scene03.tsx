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
import {
  inkProgress,
  problemSolvingMotion as M,
  store,
} from "../../../shared/page/motion";
import { SceneShell } from "../../../shared/primitives/SceneShell";
import { EASE_IN_OUT, EASE_OUT } from "../../../shared/video/motion";
import { phraseFrame } from "../../../shared/video/captions";
import captionData from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/audio/captions/scene-03.json";
import circleOne from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/circle-02.json";
import circleTwo from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/circle-05.json";
import strikeA from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/strike-x-02.json";
import strikeB from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/strike-x-03.json";
import strikeC from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/strike-x-04.json";

const captions = captionData as Caption[];
const marks = {
  circleOne: circleOne as unknown as InkMark,
  circleTwo: circleTwo as unknown as InkMark,
  strikeA: strikeA as unknown as InkMark,
  strikeB: strikeB as unknown as InkMark,
  strikeC: strikeC as unknown as InkMark,
};

const at = {
  changing: phraseFrame(captions, "the only thing changing"),
  only: phraseFrame(captions, "only thing"),
  isWhat: phraseFrame(captions, "is what"),
  paid: phraseFrame(captions, "you paid"),
  compareTwo: phraseFrame(captions, "so compare two"),
  buyAt5: phraseFrame(captions, "buy at 5"),
  // Long enough to name which of the two "sell at 6"s this is. Whisper gives
  // no ordinal and the two lines are otherwise identical.
  sell6a: phraseFrame(captions, "sell at 6 you make 1"),
  make1: phraseFrame(captions, "make 1"),
  buyAt1: phraseFrame(captions, "buy at 1"),
  sell6b: phraseFrame(captions, "sell at 6 you make 5"),
  make5: phraseFrame(captions, "make 5"),
  sameSell: phraseFrame(captions, "same sell price"),
  cheaperBuy: phraseFrame(captions, "cheaper buy"),
  biggerProfit: phraseFrame(captions, "bigger profit"),
  stillNeed: phraseFrame(captions, "do you still need"),
  no: phraseFrame(captions, "no"),
  reasoning: phraseFrame(captions, "the same reasoning"),
  drops7: phraseFrame(captions, "7 and"),
  // The take's first bare 3. Every earlier three in the scene is written with
  // a dollar sign, so this lands on the spoken numeral rather than near it.
  drops3: phraseFrame(captions, "3"),
  forSixSell: phraseFrame(captions, "for a $6 sell"),
  cheapestOne: phraseFrame(captions, "the cheapest one"),
  lastDay: phraseFrame(captions, "now the last day"),
  one: phraseFrame(captions, "1 still 1"),
  fourMinus: phraseFrame(captions, "4 minus"),
  minusOne: phraseFrame(captions, "minus 1"),
  isThree: phraseFrame(captions, "is 3"),
  keptRepeating: phraseFrame(captions, "that's the work"),
  everyDay: phraseFrame(captions, "every day we checked"),
  maybeNot: phraseFrame(captions, "so maybe we"),
  onlyCheapest: phraseFrame(captions, "maybe we only need"),
};

const PRICES = [7, 1, 5, 3, 6, 4] as const;
const priceOn = (day: number) => PRICES[day - 1];

const ramp = (frame: number, from: number, over: number) =>
  interpolate(frame, [from, from + over], [0, 1], EASE_OUT);

/** A value that steps between held levels. Frames must increase. */
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

const A = M.opacity.active;
const R = M.opacity.resting;
const F = M.opacity.faded;

/**
 * Every path in the episode, and what this act does with it.
 *
 * Act 3 inherits four paths already on screen and ends by putting all fifteen
 * back, so the set is declared once with a level timeline each rather than as
 * three groups that have to hand over to one another. Two groups drawing the
 * same five paths across a changeover would double their stroke, which is a
 * quieter version of the same bug as drawing two charts at once.
 *
 * `draw` is when the stroke is drawn. The four inherited paths start before
 * frame 0, because Act 2 already drew them and this act opens on that frame.
 */
type Level = readonly (readonly [number, number])[];

type Path = {
  buy: number;
  sell: number;
  draw: Level;
  level: Level;
};

/**
 * Act 2 ends with eleven paths pushed back behind the four it lifted. They are
 * still on screen at the cut, so this act inherits them at the same level and
 * clears them deliberately rather than letting them vanish on the seam.
 */
const PUSHED = 0.12;

/**
 * Stroke progress.
 *
 * Every path here is already drawn at frame 0, because Act 2 drew it and this
 * act opens on that frame. One that leaves and comes back un-draws while it is
 * invisible and draws itself on again when it returns, so nothing ever appears
 * fully formed out of nowhere.
 */
const drawnFrom = (returns: readonly number[]): Level => [
  [-20, 0],
  [-6, 1],
  ...returns.flatMap(
    (f) =>
      [
        [f - 1, 1],
        [f, 0],
        [f + 14, 1],
      ] as const,
  ),
];

/** Where the fifteen come back, and where each one leaves again. */
const ALL_BACK = at.keptRepeating + 12;
const LEAVES: Record<number, number> = {
  1: at.everyDay + 14,
  3: at.everyDay + 44,
  4: at.everyDay + 74,
  5: at.everyDay + 104,
};
/** The paths that leave the cheapest price. They are what is left standing. */
const survives = (buy: number) => buy === 2;

/** Where a path goes after the fifteen come back. */
const tail = (buy: number): readonly (readonly [number, number])[] =>
  survives(buy)
    ? [
        [ALL_BACK, F],
        [at.everyDay + 24, F],
        [at.everyDay + 36, 0.75],
        [at.maybeNot, 0.75],
        [at.maybeNot + 20, 0],
      ]
    : [
        [ALL_BACK, F],
        [LEAVES[buy], F],
        [LEAVES[buy] + 16, 0],
      ];

const PATHS: Path[] = [
  // The four Act 2 left on screen. They recede as a set when the narration
  // fixes the sell day, then come up one at a time as it names what was paid.
  {
    buy: 1,
    sell: 5,
    draw: drawnFrom([at.keptRepeating]),
    level: [
      [0, A],
      [at.changing, A],
      [at.changing + 6, R],
      [at.changing + 7, R],
      [at.changing + 17, A],
      [at.compareTwo, A],
      [at.compareTwo + 10, F],
      [at.reasoning, F],
      [at.reasoning + 10, R],
      [at.drops7 + 3, R],
      [at.drops7 + 11, F],
      [at.lastDay, F],
      [at.lastDay + 14, 0],
      [at.keptRepeating, 0],
      ...tail(1),
    ],
  },
  {
    buy: 2,
    sell: 5,
    draw: drawnFrom([at.keptRepeating]),
    level: [
      [0, A],
      [at.changing, A],
      [at.changing + 6, R],
      [at.only + 19, R],
      [at.only + 29, A],
      [at.lastDay, A],
      [at.lastDay + 14, 0],
      [at.keptRepeating, 0],
      ...tail(2),
    ],
  },
  {
    buy: 3,
    sell: 5,
    draw: drawnFrom([at.keptRepeating]),
    level: [
      [0, A],
      [at.changing, A],
      [at.changing + 6, R],
      [at.isWhat, R],
      [at.isWhat + 10, A],
      [at.no + 3, A],
      [at.no + 11, F],
      [at.lastDay, F],
      [at.lastDay + 14, 0],
      [at.keptRepeating, 0],
      ...tail(3),
    ],
  },
  {
    buy: 4,
    sell: 5,
    draw: drawnFrom([at.keptRepeating]),
    level: [
      [0, A],
      [at.changing, A],
      [at.changing + 6, R],
      [at.paid, R],
      [at.paid + 10, A],
      [at.compareTwo, A],
      [at.compareTwo + 10, F],
      [at.reasoning, F],
      [at.reasoning + 10, R],
      [at.drops3 + 3, R],
      [at.drops3 + 11, F],
      [at.lastDay, F],
      [at.lastDay + 14, 0],
      [at.keptRepeating, 0],
      ...tail(4),
    ],
  },
  // Day 6's five candidates. Five where day 5 had four, which says on its own
  // that the problem gets worse the further right you go.
  ...([1, 2, 3, 4, 5] as const).map((buy, i) => ({
    buy,
    sell: 6,
    draw: drawnFrom([at.lastDay + i * 8]),
    level: [
      [0, PUSHED],
      [at.changing, PUSHED],
      [at.changing + 14, 0],
      [at.lastDay + i * 8, 0],
      [at.lastDay + i * 8 + 12, R],
      [at.one, R],
      [at.one + 12, survives(buy) ? A : F],
      ...(survives(buy)
        ? ([
            [at.keptRepeating, A],
            [at.keptRepeating + 12, 0.75],
            [at.maybeNot, 0.75],
            [at.maybeNot + 20, 0],
          ] as const)
        : ([
            [LEAVES[buy], F],
            [LEAVES[buy] + 16, 0],
          ] as const)),
    ] as Level,
  })),
  // The six the act never argues about. They come back only to be counted.
  ...(
    [
      [1, 2],
      [1, 3],
      [1, 4],
      [2, 3],
      [2, 4],
      [3, 4],
    ] as const
  ).map(([buy, sell]) => ({
    buy,
    sell,
    draw: drawnFrom([at.keptRepeating]),
    level: [
      [0, PUSHED],
      [at.changing, PUSHED],
      [at.changing + 14, 0],
      [at.keptRepeating, 0],
      ...tail(buy),
    ] as Level,
  })),
];

/**
 * The two equations, in columns.
 *
 * "Same sell price, cheaper buy, bigger profit" is an argument the screen has
 * to make, not the narration. Sharing a column is what makes it visible: the
 * sell terms line up, so the only thing that differs is directly above the only
 * thing that differs.
 */
const COL = {
  sell: 776,
  minus: 866,
  buy: 952,
  equals: 1042,
  result: 1136,
} as const;
const ROW = { first: 748, second: 820, single: 792 } as const;

type Role = "sell" | "op" | "buy" | "result";

/**
 * Both comparisons, one term at a time.
 *
 * Each term arrives on the word that names it rather than on a stagger off the
 * start of the line, so the buy term lands before the sell term to its left.
 * Reading order and speaking order are not the same thing here, and the voice
 * wins.
 */
const EQUATIONS = [
  {
    row: 0,
    y: ROW.first,
    buy: 5,
    result: 1,
    when: { buy: at.buyAt5, sell: at.sell6a, result: at.make1 },
  },
  {
    row: 1,
    y: ROW.second,
    buy: 1,
    result: 5,
    when: { buy: at.buyAt1, sell: at.sell6b, result: at.make5 },
  },
];

/** Which part of both equations is being talked about. */
const FOCUS: readonly { from: number; role: Role | "all"; row?: number }[] = [
  { from: 0, role: "all" },
  { from: at.buyAt1, role: "all", row: 1 },
  { from: at.sameSell, role: "sell" },
  { from: at.cheaperBuy, role: "buy" },
  { from: at.biggerProfit, role: "result" },
  { from: at.stillNeed, role: "buy", row: 0 },
  { from: at.no, role: "all" },
];

export const BuyAndSellScene03: React.FC<{ tone?: "paper" | "black" }> = ({
  tone = "black",
}) => {
  const frame = useCurrentFrame();
  const dark = tone === "black";
  const ink = dark ? theme.colors.chalk : theme.colors.ink;

  /** The pull-back that puts Act 2's whole search back in frame. */
  const camera = interpolate(
    frame,
    [at.keptRepeating, at.keptRepeating + 30, at.maybeNot, at.maybeNot + 36],
    [1, 0.88, 0.88, 1],
    EASE_IN_OUT,
  );

  const pathLevel = (path: Path) => timeline(frame, path.level);

  // Equations, and the parts of them the narration is pointing at.
  const focusIndex = FOCUS.reduce(
    (best, step, i) => (frame >= step.from ? i : best),
    0,
  );
  const roleLevel = (row: number, role: Role) => {
    const level = (step: (typeof FOCUS)[number]) => {
      const thisRow = step.row === undefined || step.row === row;
      const thisRole = step.role === "all" || step.role === role;
      return thisRow && thisRole ? A : R;
    };
    const now = FOCUS[focusIndex];
    const before = FOCUS[Math.max(0, focusIndex - 1)];
    return interpolate(
      frame,
      [now.from, now.from + 10],
      [level(before), level(now)],
      EASE_IN_OUT,
    );
  };

  const eqOut = 1 - ramp(frame, at.forSixSell, 16);
  const singleOn =
    ramp(frame, at.fourMinus, 10) * (1 - ramp(frame, at.keptRepeating, 14));

  /**
   * The closing compression, cut before it lands.
   *
   * The past values start moving toward the one that beat them and the act
   * ends. Act 4 finishes the movement, which is what makes it read as an answer
   * rather than as a new subject.
   */
  const drift = interpolate(
    frame,
    [at.onlyCheapest, at.onlyCheapest + 76],
    [0, 0.42],
    EASE_IN_OUT,
  );
  const handOff = ramp(frame, at.onlyCheapest, 14);
  /** Exactly where PriceChart puts a price label, so the ghost starts on it. */
  const labelSpot = (day: number) => ({
    x: dayX(day),
    y:
      priceY(priceOn(day)) +
      (priceLabelSide(PRICES, day - 1) === "below" ? 26 : -62),
  });
  const target = labelSpot(2);
  const DRIFTING = [1, 3, 4];

  /**
   * The strikes, each landing on the price it drops.
   *
   * They started on the middle of each path, which put two of them on top of
   * each other over arcs already faded to the point of invisibility, and the
   * third across the one path that survives. The narration drops prices, not
   * paths, so the mark goes on the number. The three are also far apart there,
   * which the arc midpoints were not.
   *
   * $5 is struck only after the viewer has answered, and the other two follow
   * faster. Reason once, then apply. Three marks at the same moment would be
   * three assertions with one argument between them.
   */
  const STRIKES = [
    { mark: marks.strikeA, day: 3, from: at.no },
    { mark: marks.strikeB, day: 1, from: at.drops7 },
    { mark: marks.strikeC, day: 4, from: at.drops3 },
  ];
  const strikeOut = 1 - ramp(frame, at.lastDay, 14);

  /**
   * A struck price loses priority and gets it back when the question moves to
   * a new sell day, because there it is a candidate again.
   */
  const STRUCK: Record<number, number> = {
    1: at.drops7,
    3: at.no,
    4: at.drops3,
  };
  const labelLevel = (day: number) => {
    const struck = STRUCK[day];
    const base =
      struck === undefined
        ? 1
        : timeline(frame, [
            [struck + 3, 1],
            [struck + 13, F],
            [at.lastDay, F],
            [at.lastDay + 14, 1],
          ]);
    return base * (DRIFTING.includes(day) ? 1 - handOff : 1);
  };

  // The circle is drawn twice, because the rule is found once and then applied
  // again on a different day. The second one stays: Act 4 opens on it.
  const circleFirst =
    inkProgress(frame, at.cheapestOne, M.circle.duration) *
    (1 - ramp(frame, at.lastDay, 14));
  const circleSecond = inkProgress(frame, at.one, M.circle.duration);

  const activeDot = (day: number) => {
    if (day === 5) return 1 - ramp(frame, at.lastDay, 14);
    if (day === 6)
      return ramp(frame, at.lastDay, 14) * (1 - ramp(frame, at.maybeNot, 14));
    if (day === 2) return ramp(frame, at.cheapestOne, 12);
    return 0;
  };

  return (
    <SceneShell
      captions={captions}
      narration="problem-solving/01-best-time-to-buy-and-sell-stock/scene-03"
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
          opacity={1 - handOff * 0.65}
          tone={tone}
        />

        {PATHS.map((path) => {
          const level = pathLevel(path);
          return (
            <TradePath
              key={`${path.buy}-${path.sell}`}
              buyDay={path.buy}
              buyPrice={priceOn(path.buy)}
              sellDay={path.sell}
              sellPrice={priceOn(path.sell)}
              progress={timeline(frame, path.draw)}
              opacity={level}
              head={level > 0.72}
              width={level > 0.72 ? 3 : 2}
            />
          );
        })}

        {/* The one they are collapsing into. It comes out of the chart as the
            chart recedes, so it is the only number at full weight while three
            others are crossing the frame toward it. */}
        {handOff > 0.01 && (
          <Mono
            x={target.x}
            y={target.y}
            width={120}
            size={34}
            color={ink}
            opacity={handOff}
          >
            $1
          </Mono>
        )}

        {/* The values that lost, on their way to the one that beat them. A
            straight run from any of them to the $1 crosses the chart line, so
            the chart is what gives way, not the movement. */}
        {handOff > 0.01 &&
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
                opacity={handOff}
              >
                ${priceOn(day)}
              </Mono>
            );
          })}

        {STRIKES.map((s) => (
          <Ink
            key={s.day}
            mark={s.mark}
            progress={inkProgress(frame, s.from, M.strike.duration)}
            // The label's centre. labelSpot gives its top edge, and the type is
            // 34px on a 40px line.
            at={{ x: labelSpot(s.day).x, y: labelSpot(s.day).y + 20 }}
            size={80}
            color={ink}
            opacity={strikeOut}
            tone={tone}
          />
        ))}

        <Ink
          mark={marks.circleOne}
          progress={circleFirst}
          at={{ x: dayX(2), y: priceY(1) + 22 }}
          size={150}
          color={ink}
          tone={tone}
        />
        <Ink
          mark={marks.circleTwo}
          progress={circleSecond}
          at={{ x: dayX(2), y: priceY(1) + 22 }}
          size={150}
          color={ink}
          tone={tone}
        />
      </div>

      {/* $6 - $5 = $1, then $6 - $1 = $5 under it, sharing the sell column. */}
      {EQUATIONS.map((eq) => (
        <div key={eq.row}>
          <Term
            x={COL.sell}
            y={eq.y}
            from={eq.when.sell}
            frame={frame}
            color={ink}
            opacity={roleLevel(eq.row, "sell") * eqOut}
          >
            $6
          </Term>
          <Term
            x={COL.minus}
            y={eq.y}
            from={eq.when.sell + 4}
            frame={frame}
            color={ink}
            opacity={roleLevel(eq.row, "op") * eqOut}
          >
            -
          </Term>
          <Term
            x={COL.buy}
            y={eq.y}
            from={eq.when.buy}
            frame={frame}
            color={ink}
            opacity={roleLevel(eq.row, "buy") * eqOut}
          >
            ${eq.buy}
          </Term>
          <Term
            x={COL.equals}
            y={eq.y}
            from={eq.when.sell + 16}
            frame={frame}
            color={ink}
            opacity={roleLevel(eq.row, "op") * eqOut}
          >
            =
          </Term>
          <Term
            x={COL.result}
            y={eq.y}
            from={eq.when.result}
            frame={frame}
            color={theme.colors.gain}
            opacity={roleLevel(eq.row, "result") * eqOut}
          >
            ${eq.result}
          </Term>
        </div>
      ))}

      {/* $4 - $1 = $3, the same reasoning on a day the viewer answered first. */}
      <Term
        x={COL.sell}
        y={ROW.single}
        from={at.fourMinus}
        frame={frame}
        color={ink}
        opacity={singleOn}
      >
        $4
      </Term>
      <Term
        x={COL.minus}
        y={ROW.single}
        from={at.fourMinus + 6}
        frame={frame}
        color={ink}
        opacity={singleOn}
      >
        -
      </Term>
      <Term
        x={COL.buy}
        y={ROW.single}
        from={at.minusOne}
        frame={frame}
        color={ink}
        opacity={singleOn}
      >
        $1
      </Term>
      <Term
        x={COL.equals}
        y={ROW.single}
        from={at.isThree - 6}
        frame={frame}
        color={ink}
        opacity={singleOn}
      >
        =
      </Term>
      <Term
        x={COL.result}
        y={ROW.single}
        from={at.isThree}
        frame={frame}
        color={theme.colors.gain}
        opacity={singleOn}
      >
        $3
      </Term>
    </SceneShell>
  );
};

/** One term of an equation, arriving with `store` and holding its column. */
const Term: React.FC<{
  children: React.ReactNode;
  x: number;
  y: number;
  from: number;
  frame: number;
  color: string;
  opacity: number;
}> = ({ children, x, y, from, frame, color, opacity }) => {
  const s = store(frame, from);
  const on = s.opacity * opacity;
  if (on <= 0.01) return null;
  return (
    <Mono x={x} y={y} width={160} size={46} color={color} opacity={on} dy={s.y}>
      {children}
    </Mono>
  );
};
