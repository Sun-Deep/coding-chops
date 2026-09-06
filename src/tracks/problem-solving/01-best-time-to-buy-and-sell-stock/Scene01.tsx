import type { Caption } from "@remotion/captions";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../../shared/brand/theme";
import { Ink } from "../../../shared/ink/Ink";
import type { InkMark } from "../../../shared/ink/types";
import {
  CHART,
  PriceChart,
  dayX,
  priceY,
} from "../../../shared/page/PriceChart";
import { Mono } from "../../../shared/page/Mono";
import {
  BackwardsArc,
  TradeGap,
  TradeMarker,
  arcPointAt,
} from "../../../shared/page/TradeMarks";
import {
  inkProgress,
  problemSolvingMotion as M,
  store,
} from "../../../shared/page/motion";
import { SceneShell } from "../../../shared/primitives/SceneShell";
import { Sfx } from "../../../shared/primitives/Sfx";
import { EASE_IN_OUT, EASE_OUT, arrive } from "../../../shared/video/motion";
import { phraseFrame } from "../../../shared/video/captions";
import captionData from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/audio/captions/scene-01.json";
import strikeMark from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/strike-x-01.json";

const captions = captionData as Caption[];
const strike = strikeMark as unknown as InkMark;

/**
 * Beats are anchored to the frame each phrase is spoken, read from the locked
 * narration. Nothing here is a hand-picked frame number, so a re-record moves
 * the picture with the voice rather than quietly desynchronising it.
 *
 * Phrases rather than single words, because whisper writes numerals. The
 * narration says "six numbers" and the caption says "6 numbers".
 */
const at = {
  numbers: phraseFrame(captions, "6 numbers"),
  costs: phraseFrame(captions, "on day 1"),
  once: phraseFrame(captions, "you buy a share once"),
  buy1: phraseFrame(captions, "so say you buy"),
  sell4: phraseFrame(captions, "you hold it"),
  means: phraseFrame(captions, "which means you put in"),
  down: phraseFrame(captions, "you are down 4"),
  again: phraseFrame(captions, "let's try again"),
  buy2: phraseFrame(captions, "buy on day 2"),
  sell5: phraseFrame(captions, "and sell here"),
  ask: phraseFrame(captions, "how much did you make"),
  reveal: phraseFrame(captions, "sell price minus buy price"),
  rule: phraseFrame(captions, "that's all profit is"),
  wrongIdea: phraseFrame(captions, "so you would think"),
  tempting: phraseFrame(captions, "buy at 1"),
  when: phraseFrame(captions, "except look at when"),
  machine: phraseFrame(captions, "the 7 comes first"),
  problem: phraseFrame(captions, "so here's the rule"),
  always: phraseFrame(captions, "buy first"),
  question: phraseFrame(captions, "which leaves the actual question"),
  pickBuy: phraseFrame(captions, "pick a day to buy"),
  pickSell: phraseFrame(captions, "pick a later day to sell"),
  zeroCase: phraseFrame(captions, "and if every pair loses money"),
  answerZero: phraseFrame(captions, "and the answer is 0"),
  close: phraseFrame(captions, "so 6 prices"),
};

const PRICES = [7, 1, 5, 3, 6, 4];
const TEMPTING = [7, 6, 4, 1, 5];
const FALLING = [7, 6, 4, 3, 1];

const HOLD = { startFrame: at.ask, endFrame: at.reveal };

/** 0 to 1 across a window, eased. */
const ramp = (frame: number, from: number, over: number) =>
  interpolate(frame, [from, from + over], [0, 1], EASE_OUT);

/** One term of an equation, arriving with `store`. */
const Term: React.FC<{
  children: React.ReactNode;
  x: number;
  y: number;
  frame: number;
  start: number;
  color: string;
  size?: number;
  fade?: number;
}> = ({ children, x, y, frame, start, color, size = 46, fade = 1 }) => {
  const s = store(frame, start);
  return (
    <Mono
      x={x}
      y={y}
      size={size}
      color={color}
      opacity={s.opacity * fade}
      dy={s.y}
    >
      {children}
    </Mono>
  );
};

export const BuyAndSellScene01: React.FC<{ tone?: "paper" | "black" }> = ({
  tone = "black",
}) => {
  const frame = useCurrentFrame();
  const dark = tone === "black";
  const ink = dark ? theme.colors.chalk : theme.colors.ink;

  // The chart builds one dot at a time, then the line joins them.
  const chartPoints = PRICES.map((price, i) => ({
    day: i + 1,
    price,
    reveal: ramp(frame, at.numbers + 10 + i * 9, 12),
  }));
  const line = ramp(frame, at.numbers + 64, 26);
  const axes = ramp(frame, at.numbers + 4, 20);

  /**
   * Which chart is on screen, and how the changeovers are staged.
   *
   * The scene shows three different price arrays. An earlier version picked
   * between them with `swap < 1 ? oldPoints : newPoints`, which held the old
   * array's dots while the new array's line progress was still zero. For a few
   * frames that rendered six disconnected dots and a stub of line, and then
   * hard-cut.
   *
   * Changeovers are sequenced rather than crossfaded. The outgoing chart clears
   * first, fully drawn the whole way out, and only then does the incoming one
   * draw itself in. Two different price arrays superimposed at half opacity is
   * not a transition, it is two charts.
   */
  const SEGMENTS = [
    { from: 0, prices: PRICES },
    { from: at.wrongIdea, prices: TEMPTING },
    // Swapped back while the BUY -> SELL card is still opaque, not when it
    // lifts. Doing it in the open put the tempting chart back on screen for
    // the ten frames between the card unmounting and the changeover starting,
    // which read as a flash of the wrong chart.
    { from: at.always + 16, prices: PRICES },
    { from: at.zeroCase, prices: FALLING },
    { from: at.close, prices: PRICES },
  ] as const;
  const CLEAR = 9;
  const DRAW = 17;

  const current = SEGMENTS.reduce((best, seg) =>
    frame >= seg.from ? seg : best,
  );
  const index = SEGMENTS.indexOf(current);
  const previous = index > 0 ? SEGMENTS[index - 1] : null;
  const first = current.from === 0;
  /** How much of the outgoing chart is left. */
  const leaving = first ? 0 : 1 - ramp(frame, current.from, CLEAR);
  /** How far the incoming chart has drawn, once the old one has gone. */
  // Starts two frames before the old chart is fully gone, so there is never a
  // frame with nothing on it. Two frames of faint overlap is not the same as
  // holding both charts up at half opacity.
  const arriving = first ? 1 : ramp(frame, current.from + CLEAR - 2, DRAW);

  const onTempting = current.prices === TEMPTING;
  const onFalling = current.prices === FALLING;
  const activePrices = current.prices;

  // The token. It rises at the buy, travels, and lands at the sell.
  const tokenTrip = (
    fromDay: number,
    toDay: number,
    rise: number,
    travel: number,
  ) => {
    const x = interpolate(
      frame,
      [travel, travel + 34],
      [dayX(fromDay), dayX(toDay)],
      EASE_IN_OUT,
    );
    const y = interpolate(
      frame,
      [rise, rise + 16],
      [CHART.base + 90, priceY(PRICES[fromDay - 1])],
      EASE_OUT,
    );
    const yTo = interpolate(
      frame,
      [travel, travel + 34],
      [priceY(PRICES[fromDay - 1]), priceY(PRICES[toDay - 1])],
      EASE_IN_OUT,
    );
    return { x, y: frame < travel ? y : yTo };
  };

  const firstTrade = frame >= at.once && frame < at.again;
  const secondTrade = frame >= at.again && frame < at.wrongIdea;

  const trip = firstTrade
    ? tokenTrip(1, 4, at.once + 6, at.sell4)
    : tokenTrip(2, 5, at.buy2 + 6, at.sell5);

  const tokenOn = firstTrade
    ? ramp(frame, at.once, 10) * (1 - ramp(frame, at.down + 30, 12))
    : secondTrade
      ? ramp(frame, at.buy2, 10) * (1 - ramp(frame, at.reveal + 40, 14))
      : 0;

  // Buy and sell, and the distance between them. The first trade loses, the
  // second wins, and the two are told apart by direction rather than colour.
  const t1 = {
    buy: ramp(frame, at.buy1, 12) * (1 - ramp(frame, at.again, 10)),
    sell: ramp(frame, at.sell4 + 30, 12) * (1 - ramp(frame, at.again, 10)),
    gap: ramp(frame, at.means, 20) * (1 - ramp(frame, at.again, 10)),
  };
  const t2 = {
    buy: ramp(frame, at.buy2 + 8, 12) * (1 - ramp(frame, at.wrongIdea, 10)),
    sell: ramp(frame, at.sell5 + 26, 12) * (1 - ramp(frame, at.wrongIdea, 10)),
    gap: ramp(frame, at.reveal, 22) * (1 - ramp(frame, at.wrongIdea, 10)),
  };

  // The tempting pairing on [7, 6, 4, 1, 5]: buy the $1 on day 4, sell the $7
  // on day 1. The arc that tries it stalls, and only then does it get struck.
  const temptMark = ramp(frame, at.tempting, 12);
  const arcOn = ramp(frame, at.when + 10, 26);
  const strikeOn = inkProgress(frame, at.machine + 20, M.strike.duration);
  /**
   * Candidate pairings the unresolved markers step through.
   *
   * Every one obeys buy before sell, so the rule Act 1 just locked in is never
   * broken by the thing demonstrating it. None is the winning +$5 either. The
   * act ends on a question, and landing on the answer here would settle it
   * eighteen seconds early.
   */
  const CANDIDATES = [
    [2, 4],
    [1, 3],
    [3, 5],
    [4, 6],
    [2, 6],
  ] as const;
  const pairEvery = Math.round((at.zeroCase - at.pickSell) / CANDIDATES.length);
  const pairIndex = Math.max(
    0,
    Math.min(
      CANDIDATES.length - 1,
      Math.floor((frame - at.pickSell) / pairEvery),
    ),
  );
  const [candBuy, candSell] = CANDIDATES[pairIndex];
  const candProfit = PRICES[candSell - 1] - PRICES[candBuy - 1];
  const candOn =
    ramp(frame, at.pickBuy, 12) * (1 - ramp(frame, at.zeroCase - 12, 12));
  const candSellOn =
    ramp(frame, at.pickSell, 12) * (1 - ramp(frame, at.zeroCase - 12, 12));

  /**
   * The chart taking its home position.
   *
   * It has been in these coordinates all scene, but the BUY -> SELL card
   * covered it, so its return has to read as landing rather than as the card
   * simply vanishing. The scale runs with the card's fade rather than after
   * it, or the chart would sit at full size for twelve frames and then snap
   * down. One small arrive, once, and it never moves again.
   */
  /**
   * The BUY -> SELL card, in and out.
   *
   * It used to unmount on the frame the next segment began, so the changeover
   * underneath it started in full view. It fades off instead, and by the time
   * it clears, the chart it uncovers has already finished drawing.
   */
  const CARD_OUT = 12;
  const cardLifts = at.question - CARD_OUT;
  const cardOn =
    ramp(frame, at.always, 12) * (1 - ramp(frame, cardLifts, CARD_OUT));

  const home =
    frame >= cardLifts && frame < cardLifts + 46
      ? arrive(frame, cardLifts, 22, 0.972, 1)
      : 1;

  // t and size are measured together: at 0.44 with a 110px mark the strike
  // clears every dot and label on the chart by 35px, so it crosses the arc and
  // nothing else.
  const strikeAt = arcPointAt(4, 1, 1, 7, 0.44);
  // Once struck, the path it invalidates loses priority.
  const arcFade =
    1 - ramp(frame, at.machine + 24, M.strike.fadeDuration) * 0.62;

  return (
    <SceneShell
      captions={captions}
      narration="problem-solving/01-best-time-to-buy-and-sell-stock/scene-01"
      holds={[HOLD]}
      tone={tone}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${home})`,
          transformOrigin: "50% 46%",
        }}
      >
        {/* On its way out, still fully drawn. Never half of one chart. */}
        {previous && leaving > 0.01 && (
          <PriceChart
            points={previous.prices.map((price, i) => ({
              day: i + 1,
              price,
            }))}
            line={1}
            axes={1}
            opacity={leaving}
            tone={tone}
          />
        )}
        {arriving > 0.01 && (
          <PriceChart
            points={activePrices.map((price, i) => ({
              day: i + 1,
              price,
              reveal: first ? chartPoints[i].reveal : arriving,
            }))}
            line={first ? line : arriving}
            axes={first ? axes : 1}
            opacity={1}
            tone={tone}
          />
        )}
      </div>

      {/* The token, and the money leaving and coming back. */}
      {tokenOn > 0.01 && (
        <svg
          width={1920}
          height={1080}
          viewBox="0 0 1920 1080"
          style={{ position: "absolute", inset: 0 }}
        >
          <circle
            cx={trip.x}
            cy={trip.y}
            r={16}
            fill={dark ? theme.colors.black : theme.colors.paperBright}
            stroke={ink}
            strokeWidth={3}
            opacity={tokenOn}
          />
        </svg>
      )}

      {!onTempting && !onFalling && (
        <>
          <TradeMarker
            day={1}
            price={7}
            kind="buy"
            progress={t1.buy}
            prices={PRICES}
            tone={tone}
          />
          <TradeMarker
            day={4}
            price={3}
            kind="sell"
            progress={t1.sell}
            side="below"
            prices={PRICES}
            tone={tone}
          />
          <TradeGap
            buyDay={1}
            buyPrice={7}
            sellDay={4}
            sellPrice={3}
            progress={t1.gap}
          />
          <TradeMarker
            day={2}
            price={1}
            kind="buy"
            progress={t2.buy}
            prices={PRICES}
            tone={tone}
          />
          <TradeMarker
            day={5}
            price={6}
            kind="sell"
            progress={t2.sell}
            prices={PRICES}
            tone={tone}
          />
          <TradeGap
            buyDay={2}
            buyPrice={1}
            sellDay={5}
            sellPrice={6}
            progress={t2.gap}
          />
        </>
      )}

      {/* First trade: 3 - 7 = -4 */}
      {frame >= at.means && frame < at.again && (
        <Term
          x={960}
          y={800}
          frame={frame}
          start={at.means}
          size={46}
          color={ink}
        >
          $3 - $7 = -$4
        </Term>
      )}

      {/* Second trade: 6 - 1 = 5, then the rule strip it becomes. */}
      {frame >= at.reveal && frame < at.wrongIdea && (
        <Term
          x={960}
          y={790}
          frame={frame}
          start={at.reveal}
          size={54}
          color={ink}
        >
          $6 - $1 = $5
        </Term>
      )}
      {frame >= at.rule && frame < at.wrongIdea && (
        <Term
          x={960}
          y={868}
          frame={frame}
          start={at.rule}
          size={30}
          color={ink}
        >
          profit = sell price - buy price
        </Term>
      )}

      {/* The tempting wrong answer. Ink, never cobalt: cobalt means the valid
          path and this one is about to be struck out. */}
      {onTempting && (
        <>
          <TradeMarker
            day={4}
            price={1}
            kind="buy"
            progress={temptMark}
            prices={TEMPTING}
            tone={tone}
          />
          <TradeMarker
            day={1}
            price={7}
            kind="sell"
            progress={temptMark}
            prices={TEMPTING}
            tone={tone}
          />
          <BackwardsArc
            fromDay={4}
            fromPrice={1}
            toDay={1}
            toPrice={7}
            progress={arcOn}
            opacity={arcFade}
            tone={tone}
          />
        </>
      )}
      {onTempting && frame >= at.tempting && (
        <Term
          x={960}
          y={800}
          frame={frame}
          start={at.tempting}
          size={54}
          color={ink}
        >
          $7 - $1 = $6
        </Term>
      )}
      {onTempting && frame >= at.machine && (
        <Ink
          mark={strike}
          progress={strikeOn}
          at={strikeAt}
          size={110}
          color={ink}
          tone={tone}
        />
      )}
      {frame >= at.machine + 26 && frame < at.problem && (
        <Sfx name="dissolve" at={at.machine + 26} gain={0.7} />
      )}

      {/* BUY -> SELL. The rule locks, full frame. */}
      {frame >= at.always && frame < at.question && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: dark ? theme.colors.black : theme.colors.paper,
            opacity: cardOn,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 430,
              textAlign: "center",
              fontFamily: theme.fontFamily,
              fontSize: 132,
              fontWeight: 800,
              letterSpacing: "-0.06em",
              color: ink,
              opacity: ramp(frame, at.always + 8, 14) * cardOn,
            }}
          >
            BUY &rarr; SELL
          </div>
        </div>
      )}

      {/* Two candidates with no answer yet, stepping through legal pairings. */}
      {frame >= at.pickBuy && frame < at.zeroCase && (
        <>
          <TradeMarker
            day={candBuy}
            price={PRICES[candBuy - 1]}
            kind="buy"
            label="BUY?"
            progress={candOn}
            prices={PRICES}
            tone={tone}
          />
          <TradeMarker
            day={candSell}
            price={PRICES[candSell - 1]}
            kind="sell"
            label="SELL?"
            progress={candSellOn}
            prices={PRICES}
            tone={tone}
          />
          <Mono
            x={960}
            y={800}
            size={44}
            weight={700}
            color={candProfit >= 0 ? theme.colors.gain : theme.colors.loss}
            opacity={candSellOn}
          >
            {candProfit >= 0 ? `+$${candProfit}` : `-$${Math.abs(candProfit)}`}
          </Mono>
        </>
      )}

      {/* The question the act hands to Act 2. */}
      {frame >= at.close && (
        <Mono
          x={960}
          y={800}
          size={54}
          weight={700}
          color={ink}
          opacity={ramp(frame, at.close + 20, 16)}
        >
          MAXIMUM PROFIT = ?
        </Mono>
      )}

      {/* The readout that sits at zero while the falling chart plays. */}
      {onFalling && (
        <Mono
          x={960}
          y={800}
          size={54}
          opacity={ramp(frame, at.answerZero, 12)}
          color={dark ? theme.colors.grayDark : theme.colors.gray}
        >
          $0
        </Mono>
      )}
    </SceneShell>
  );
};
