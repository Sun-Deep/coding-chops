import type { Caption } from "@remotion/captions";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../../shared/brand/theme";
import { Outro } from "../../../shared/brand/Outro";
import { SLOT } from "../../../shared/page/layout";
import { Mono } from "../../../shared/page/Mono";
import { PriceChart } from "../../../shared/page/PriceChart";
import { problemSolvingMotion as M, store } from "../../../shared/page/motion";
import { SceneShell } from "../../../shared/primitives/SceneShell";
import { EASE_OUT } from "../../../shared/video/motion";
import { phraseFrame } from "../../../shared/video/captions";
import captionData from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/audio/captions/scene-09.json";

const captions = captionData as Caption[];

/**
 * Frames after the narration ends, for the end card.
 *
 * Every other scene runs exactly as long as its stem. This one does not,
 * because the outro is silent and the take stops 0.7 seconds after the last
 * word. The composition adds the tail explicitly rather than the stem being
 * padded, so `narration.ts` stays a measurement of what was recorded.
 */
export const SCENE_09_TAIL = 240;

const at = {
  throwAway: phraseFrame(captions, "decide what to throw"),
  oneQuestion: phraseFrame(captions, "asked one question"),
  ifIHad: phraseFrame(captions, "if i had to answer"),
  need: phraseFrame(captions, "would i need"),
  hereItWas: phraseFrame(captions, "here it was"),
  everythingElse: phraseFrame(captions, "everything else went"),
  trySomewhere: phraseFrame(captions, "try it somewhere else"),
  largest: phraseFrame(captions, "largest number in a list"),
  needLargest: phraseFrame(captions, "you need the largest"),
  seenBefore: phraseFrame(captions, "seen this value before"),
  needSet: phraseFrame(captions, "you need the set"),
  notOrder: phraseFrame(captions, "not the order"),
  sameQuestion: phraseFrame(captions, "same question"),
  thatsTheMove: phraseFrame(captions, "that's the move"),
};

const PRICES = [7, 1, 5, 3, 6, 4] as const;

const ramp = (frame: number, from: number, over: number) =>
  interpolate(frame, [from, from + over], [0, 1], EASE_OUT);
const window = (frame: number, a: number, b: number, into = 14, out = 16) =>
  ramp(frame, a, into) * (1 - ramp(frame, b, out));

/** Act 8's camera, which this act returns to identity so the frame can open. */
const ACT8 = { scale: 0.72, originX: 672, originY: 497 } as const;

/**
 * The two worked examples.
 *
 * Practised, not promised. An earlier draft ended on three unlabelled shapes
 * shown deliberately without explanation, which composition rule 10 of the
 * production standard rejects. Naming what each one keeps turns the slogan
 * into a method.
 */
const EXAMPLES = [
  {
    values: ["3", "9", "2", "7", "5"],
    label: "largest so far",
    kept: "9",
  },
  {
    values: ["4", "1", "4", "8", "1"],
    label: "seen so far",
    kept: "{4, 1, 8}",
  },
];

const ARRAY_Y = 500;
const ARRAY_STEP = 132;

export const BuyAndSellScene09: React.FC<{ tone?: "paper" | "black" }> = ({
  tone = "black",
}) => {
  const frame = useCurrentFrame();
  const dark = tone === "black";
  const ink = dark ? theme.colors.chalk : theme.colors.ink;
  const quiet = dark ? theme.colors.grayDark : theme.colors.gray;

  /**
   * The frame opens.
   *
   * Act 8 held everything at 0.72 to make room for a column on the right.
   * Nothing is in that column any more, and the slots go back to the
   * coordinates they have held since Act 4 rather than staying where a
   * temporary pull-back left them.
   */
  const open = ramp(frame, 8, 86);
  const scale = ACT8.scale + (1 - ACT8.scale) * open;
  const tx = ACT8.originX * (1 - ACT8.scale) * (1 - open);
  const ty = ACT8.originY * (1 - ACT8.scale) * (1 - open);

  /** Everything the episode was about, on its way out. */
  const chartOn = 1 - ramp(frame, 8, 70);
  const costOn = 1 - ramp(frame, 8, 44);

  /**
   * The question, which is the whole act.
   *
   * It arrives, steps back while the three answers are given, and comes back
   * for the last line, because "same question, different answer" only lands if
   * the question is on screen when the answers stop.
   */
  const questionOn =
    ramp(frame, at.ifIHad, 18) *
    Math.min(
      1,
      M.opacity.resting / M.opacity.active +
        (1 - M.opacity.resting) * (1 - ramp(frame, at.hereItWas, 16)) +
        ramp(frame, at.sameQuestion, 16),
    );

  /** The episode's own answer, then the two the viewer is handed to practise. */
  const ownAnswer = window(frame, at.hereItWas, at.trySomewhere, 16, 16);
  const example = [
    window(frame, at.largest - 20, at.seenBefore - 24),
    window(frame, at.seenBefore - 6, at.sameQuestion - 10),
  ];
  const kept = [ramp(frame, at.needLargest, 14), ramp(frame, at.needSet, 14)];

  const outroStart = at.thatsTheMove + 34;
  const outroOn = ramp(frame, outroStart, 20);
  const closingOut = 1 - ramp(frame, outroStart - 12, 18);

  return (
    <SceneShell
      captions={captions}
      narration="problem-solving/01-best-time-to-buy-and-sell-stock/scene-09"
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
        {chartOn > 0.01 && (
          <PriceChart
            points={PRICES.map((price, i) => ({
              day: i + 1,
              price,
              label: M.opacity.resting,
            }))}
            opacity={chartOn}
            tone={tone}
          />
        )}

        {/* The two the episode kept. They never move. */}
        <Kept
          x={SLOT.cheapest}
          label="minPrice"
          value="$1"
          on={Math.max(chartOn, ownAnswer) * closingOut}
          ink={ink}
          quiet={quiet}
        />
        <Kept
          x={SLOT.best}
          label="maxProfit"
          value="$5"
          on={Math.max(chartOn, ownAnswer) * closingOut}
          ink={ink}
          quiet={quiet}
        />
      </div>

      {/* Act 8's cost table, on its way out. */}
      {costOn > 0.01 && (
        <div style={{ position: "absolute", inset: 0, opacity: costOn }}>
          {[
            {
              label: "brute force",
              y: 236,
              value: "$5",
              order: "O(n²)",
              formula: "n(n - 1) / 2",
            },
            { label: "the walk", y: 420, value: "$5", order: "O(n)" },
            {
              label: "memory",
              y: 700,
              value: "two numbers",
              order: "O(1)",
            },
          ].map((row) => (
            <div key={row.label}>
              <div
                style={{
                  position: "absolute",
                  left: 1408,
                  top: row.y,
                  fontFamily: theme.fontFamily,
                  fontSize: 19,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  color: quiet,
                }}
              >
                {row.label}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 1408,
                  top: row.y + 28,
                  fontFamily: theme.monoFamily,
                  fontSize: 30,
                  fontWeight: 700,
                  color: row.value === "$5" ? theme.colors.gain : ink,
                }}
              >
                {row.value}
              </div>
              {row.formula && (
                <div
                  style={{
                    position: "absolute",
                    left: 1408,
                    top: row.y + 82,
                    fontFamily: theme.monoFamily,
                    fontSize: 26,
                    color: quiet,
                  }}
                >
                  {row.formula}
                </div>
              )}
              <Mono
                x={1782}
                y={row.y + 24}
                width={220}
                size={38}
                weight={700}
                color={ink}
              >
                {row.order}
              </Mono>
            </div>
          ))}
        </div>
      )}

      {/* The question. */}
      {questionOn > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 268,
            textAlign: "center",
            fontFamily: theme.fontFamily,
            fontSize: 62,
            fontWeight: 700,
            letterSpacing: "-0.035em",
            lineHeight: 1.16,
            color: ink,
            opacity: questionOn * closingOut,
          }}
        >
          If I had to answer right now,
          <br />
          what would I need?
        </div>
      )}

      {/* Two places the same question has a different answer. */}
      {EXAMPLES.map((ex, i) => {
        const on = example[i] * closingOut;
        if (on <= 0.01) return null;
        const left = 960 - ((ex.values.length - 1) * ARRAY_STEP) / 2;
        return (
          <div key={ex.label}>
            {ex.values.map((v, k) => (
              <Mono
                key={k}
                x={left + k * ARRAY_STEP}
                y={ARRAY_Y}
                width={160}
                size={54}
                color={ink}
                opacity={on * M.opacity.resting}
                dy={store(frame, at.largest - 20 + i * 190 + k * 4).y}
              >
                {v}
              </Mono>
            ))}
            <Kept
              x={960}
              label={ex.label}
              value={ex.kept}
              on={on * kept[i]}
              ink={ink}
              quiet={quiet}
            />
          </div>
        );
      })}

      {outroOn > 0.01 && (
        <div style={{ position: "absolute", inset: 0, opacity: outroOn }}>
          <Outro
            closing="Decide what to throw away."
            tone={tone}
            start={outroStart}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 132,
              textAlign: "center",
              fontFamily: theme.fontFamily,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "0.32em",
              color: quiet,
              opacity: ramp(frame, outroStart + 30, 18),
            }}
          >
            LIKE · SHARE · SUBSCRIBE
          </div>
        </div>
      )}
    </SceneShell>
  );
};

/** What you keep: one label, one value, the shape the episode has used since Act 4. */
const Kept: React.FC<{
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
          left: x - 400,
          top: SLOT.labelY,
          width: 800,
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
        width={700}
        size={value.length > 3 ? 40 : SLOT.valueSize}
        weight={700}
        color={ink}
        opacity={on}
        dy={value.length > 3 ? 6 : 0}
      >
        {value}
      </Mono>
    </>
  );
};
