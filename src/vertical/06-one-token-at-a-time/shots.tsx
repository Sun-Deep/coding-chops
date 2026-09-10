import { interpolate, useCurrentFrame } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { theme } from "../../shared/brand/theme";
import { EASE_IN_OUT, EASE_OUT } from "../../shared/video/motion";
import { clamp } from "../../shared/video/timing";
import { ACCENT } from "../../shared/vertical/palette";
import {
  Label,
  Provenance,
  Punch,
  Readout,
} from "../../shared/vertical/type";
import { ChatFrame } from "./ChatFrame";
import {
  Cache,
  cacheRightEdge,
  Stack,
  Tokens,
  Vocabulary,
  type Piece,
} from "./parts";
import {
  ANSWER_PIECES,
  CACHE,
  GENERATION,
  MODEL,
  PROMPT,
  STEP,
  TEMPLATED,
  commas,
} from "./measurements";

/**
 * The shots.
 *
 * Every one is a pure function of the frame within its own sequence, so a shot
 * can be scrubbed on its own in the studio without the rest of the reel.
 *
 * The vertical rhythm is shared: label at 292, the thing being taught from
 * about 350 to 930, the number it produces at 956, the receipt at 1150, and the
 * narration on a baseline at 1460.
 *
 * The chat frame opens the cut and returns for the loop, so the interior sits
 * inside the interface rather than beside it.
 */

const ramp = (frame: number, from: number, over: number) =>
  interpolate(frame, [from, from + over], [0, 1], { ...clamp, ...EASE_OUT });

const counting = (t: number, to: number, step: number) => {
  if (t >= 1) return to;
  const value = interpolate(t, [0, 1], [0, to], clamp);
  return Math.min(to, Math.round(value / step) * step);
};

const PIECES: readonly Piece[] = TEMPLATED.map((p) => ({
  text: p.text,
  id: p.id,
  fromTemplate: !p.own,
}));

/**
 * Shot 1. The message becomes tokens.
 *
 * Opens on a message already typed, with send pressed inside the first half
 * second. No card in front of it: the surprise is what happens to the message,
 * and a title would spend two seconds of a still frame at the moment somebody
 * decides whether to keep scrolling.
 *
 * The six the viewer typed land first and the nineteen the template added
 * arrive around them. That order is the shot.
 */
export const Tokenize: React.FC = () => {
  const frame = useCurrentFrame();
  const send = ramp(frame, 6, 14);
  const frameOut = interpolate(frame, [30, 52], [1, 0], clamp);
  const own = interpolate(frame, [34, 66], [0, 1], {
    ...clamp,
    ...EASE_OUT,
  });
  const template = interpolate(frame, [74, 132], [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT.easing,
  });

  const shown =
    Math.round(own * PROMPT.rawTokens) +
    Math.round(template * (PROMPT.templatedTokens - PROMPT.rawTokens));

  return (
    <>
      <Label top={292} opacity={ramp(frame, -6, 10)}>
        Your message · tokenized
      </Label>

      <ChatFrame
        top={366}
        question={PROMPT.text}
        opacity={ramp(frame, -4, 12) * frameOut}
        send={send}
      />

      <Tokens
        top={438}
        pieces={PIECES}
        ownReveal={own}
        templateReveal={template}
        opacity={interpolate(frame, [32, 46], [0, 1], clamp)}
      />

      {/* Held back until the first chip lands. Before that nothing has been
          tokenized and the readout would sit on a zero for a second, which is
          the dead frame the playbook warns about. */}
      <Readout
        top={956}
        size={62}
        weight={600}
        opacity={ramp(frame, 30, 12)}
      >
        {shown}
      </Readout>
      <Label top={1046} opacity={ramp(frame, 34, 14)}>
        tokens the model receives
      </Label>

      <Provenance top={1150} opacity={ramp(frame, 136, 22)}>
        six of them are yours · the other nineteen are the chat template
      </Provenance>
      <Provenance top={1196} opacity={ramp(frame, 164, 20)}>
        {MODEL.name} · the server confirms it as prompt_n {PROMPT.templatedTokens}
      </Provenance>
    </>
  );
};

/**
 * Shot 2. Up the stack, and one token out.
 *
 * Thirty-six is `n_layer` and twenty-five is the templated token count. Both
 * are measured and both are said out loud, so the picture and the words cannot
 * disagree.
 *
 * The first event is twenty-four columns going dark. Only the final position's
 * vector is multiplied by the output matrix, and that is the part people are
 * most often surprised by.
 */
export const Forward: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [16, 70], [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT.easing,
  });
  const keep = ramp(frame, 76, 24);
  const stackOut = interpolate(frame, [104, 126], [1, 0], clamp);
  const arrive = interpolate(frame, [104, 134], [0, 1], { ...clamp, ...EASE_OUT });
  const collapse = ramp(frame, 138, 20);
  // "One kept" happens on screen rather than only in the narration line. It is
  // also the only movement in the last two seconds of the shot, which was
  // otherwise a 1.7 second hold and the one thing the frozen-frame check flags.
  const chosen = ramp(frame, 162, 30);

  return (
    <>
      <Label top={292} opacity={ramp(frame, -6, 10)}>
        One forward pass · {MODEL.layers} layers
      </Label>

      <Stack
        top={366}
        rise={rise}
        keep={keep}
        opacity={ramp(frame, 2, 12) * stackOut}
      />

      <Vocabulary
        top={400}
        arrive={arrive}
        collapse={collapse}
        opacity={interpolate(frame, [104, 124], [0, 1], clamp)}
      />

      <div
        style={{
          position: "absolute",
          top: 600,
          left: (1080 - 620) / 2,
          width: 620,
          opacity: ramp(frame, 140, 22),
        }}
      >
        {STEP.candidates.map((c, i) => (
          <div
            key={c.id}
            style={{
              display: "grid",
              gridTemplateColumns: "150px 1fr",
              alignItems: "baseline",
              marginBottom: 12,
              opacity:
                ramp(frame, 140 + i * 6, 18) *
                (i === 0 ? 1 : 1 - chosen * 0.72),
              fontFamily: theme.monoFamily,
              fontSize: 30,
              fontVariantNumeric: "tabular-nums",
              color: i === 0 ? ACCENT : theme.colors.gray,
              fontWeight: i === 0 ? 700 : 500,
            }}
          >
            <span style={{ textAlign: "right", paddingRight: 22 }}>
              {c.percent}%
            </span>
            <span style={{ whiteSpace: "pre" }}>{`'${c.token}'`}</span>
          </div>
        ))}
      </div>

      {/* Two counters, one after the other, because the shot has two phases
          and a readout that sits on zero for three and a half seconds is the
          dead frame the playbook warns about. The stack counts the layer the
          front is crossing; the vocabulary counts what the last column scored. */}
      <Readout
        top={956}
        size={62}
        weight={600}
        opacity={interpolate(frame, [96, 112], [1, 0], clamp)}
      >
        {Math.min(MODEL.layers, Math.round(rise * MODEL.layers))}
      </Readout>
      <Label
        top={1046}
        opacity={ramp(frame, -2, 12) * interpolate(frame, [96, 112], [1, 0], clamp)}
      >
        of {MODEL.layers} layers
      </Label>

      <Readout
        top={956}
        size={62}
        weight={600}
        opacity={ramp(frame, 112, 12)}
      >
        {commas(counting(arrive, MODEL.vocab, 1_000))}
      </Readout>
      <Label top={1046} opacity={ramp(frame, 118, 12)}>
        candidates scored
      </Label>

      <Provenance top={1150} opacity={ramp(frame, 166, 22)}>
        step {STEP.index} · temperature 0 · the top five of{" "}
        {commas(MODEL.vocab)}
      </Provenance>
    </>
  );
};

/**
 * Shot 3. The loop, and the cache.
 *
 * The layout changes in exactly one way from the shot before it: instead of
 * twenty-five columns rising, one does. Beside it the cache grows by a slot per
 * token and lights across its whole width every pass.
 *
 * That pairing is the claim. Attention reads every stored position and the
 * compute is one token wide, and the first version of this plan had it the
 * other way round.
 *
 * The first three passes run slowly enough to read, then it accelerates to the
 * remaining thirty-seven. The counter tracks the real pass count throughout, so
 * the acceleration is a change of pace and not a change of arithmetic.
 */
const SLOW_PASSES = 3;
const SLOW_PERIOD = 18;
const FAST_PERIOD = 2;
const LOOP_START = 10;

const passAt = (frame: number) => {
  const x = frame - LOOP_START;
  if (x < 0) return { n: 0, rise: 0 };
  const slowSpan = SLOW_PASSES * SLOW_PERIOD;
  if (x < slowSpan) {
    return {
      n: Math.floor(x / SLOW_PERIOD) + 1,
      rise: (x % SLOW_PERIOD) / SLOW_PERIOD,
    };
  }
  const y = x - slowSpan;
  return {
    n: Math.min(SLOW_PASSES + Math.floor(y / FAST_PERIOD) + 1, GENERATION.tokens),
    rise: (y % FAST_PERIOD) / FAST_PERIOD,
  };
};

export const Loop: React.FC = () => {
  const frame = useCurrentFrame();
  const { n, rise } = passAt(frame);
  const done = n / GENERATION.tokens;

  const words = Math.round(done * ANSWER_PIECES.length);
  const answer = ANSWER_PIECES.slice(0, words).join("");

  return (
    <>
      <Label top={292} opacity={ramp(frame, -6, 10)}>
        And again · once per token
      </Label>

      <ChatFrame
        top={352}
        question={PROMPT.text}
        answer={answer}
        writing={n > 0 && n < GENERATION.tokens}
        opacity={ramp(frame, 0, 12)}
      />

      {/* The newest position sits at the end of the sequence, so the column
          rises above the right hand end of the cache rather than in the middle
          of the frame. The first version put it at centre and full height,
          where it ran from 640 to 1103 and crossed the counter. */}
      <Stack
        top={686}
        rise={rise > 0 ? 1 : 0}
        keep={1}
        single
        left={cacheRightEdge(PROMPT.templatedTokens + n) - 19}
        rowPitch={5}
        rowH={3}
        opacity={ramp(frame, 6, 12) * (0.72 + 0.28 * (1 - rise))}
      />

      <Cache
        top={882}
        slots={PROMPT.templatedTokens + n}
        read={1 - rise}
        opacity={ramp(frame, 10, 12)}
      />

      <Readout top={956} size={62} weight={600}>
        {n}
      </Readout>
      <Label top={1046} opacity={ramp(frame, 14, 14)}>
        forward passes
      </Label>

      <Provenance top={1150} opacity={ramp(frame, 150, 22)}>
        the earlier tokens are not recomputed · they are read
      </Provenance>
      <Provenance top={1196} opacity={ramp(frame, 180, 20)}>
        {GENERATION.tokens} tokens out, {GENERATION.tokens} passes
      </Provenance>
    </>
  );
};

/**
 * The end card, and it is the cost.
 *
 * Memory rather than milliseconds. Per-token time does grow with the
 * conversation, monotonically across both measurement sessions, but only about
 * 1.3 times over a 90 times longer chat, because at these lengths the weights
 * dominate and attention does not. On a card, 1.3x lands as nothing. 36 KB a
 * token lands.
 */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const lockup = ramp(frame, 42, 20);
  const big = CACHE.atTokens[1];

  return (
    <>
      <Punch top={330} size={62} opacity={ramp(frame, 0, 12)}>
        The model has no memory.
        <br />
        It has a cache.
      </Punch>

      <Readout
        top={512}
        size={29}
        color={theme.colors.gray}
        opacity={ramp(frame, 12, 14)}
      >
        {Math.round(CACHE.bytesPerToken / 1024)} KB per token, both sides of the
        conversation
        <br />
        {commas(big.tokens)} tokens is {big.mb} MB, and every new token reads all
        of it
      </Readout>

      <Provenance top={660} opacity={ramp(frame, 22, 16)}>
        measured, not estimated · full run in the repo
      </Provenance>

      <div
        style={{
          position: "absolute",
          top: 838,
          left: 0,
          width: 1080,
          display: "flex",
          justifyContent: "center",
          opacity: lockup,
          transform: `translateY(${interpolate(lockup, [0, 1], [16, 0])}px)`,
        }}
      >
        <Lockup size={62} tone="black" stacked />
      </div>
    </>
  );
};
