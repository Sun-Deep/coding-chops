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
import { AttentionField } from "./AttentionField";
import {
  ATTENTION_WEIGHTS_TOTAL,
  GENERATION_LAYER,
  WEIGHTS_PER_HEAD,
} from "./attention";
import { GenerationFan } from "./GenerationFan";
import { TokenArrival } from "./TokenArrival";
import { ChatFrame } from "./ChatFrame";
import { Vocabulary } from "./parts";
import {
  ANSWER_PIECES,
  CACHE,
  GENERATION,
  MODEL,
  PROMPT,
  STEP,
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

/**
 * Shot 1. The message becomes tokens.
 *
 * Opens on a message already typed, with send pressed inside the first half
 * second. No card in front of it: the surprise is what happens to the message,
 * and a title would spend two seconds of a still frame at the moment somebody
 * decides whether to keep scrolling.
 *
 * Rebuilt on 2026-09-11. The first version faded the chat frame out and faded a
 * wall of twenty-five chips in. It carried the same information and nothing
 * crossed the frame, which is the readout-instead-of-object failure the
 * playbook names and the one the creator called a slideshow.
 *
 * Now the six tokens the viewer typed lift out of the bubble and fly to their
 * slots, and the nineteen the template added fill in around them. The row ends
 * at exactly the positions shot 2 opens on, so the cut walks out of the
 * interface and into the network without a cut in the object.
 */
export const Tokenize: React.FC = () => {
  const frame = useCurrentFrame();
  const send = ramp(frame, 6, 14);
  // EASE_IN_OUT, not EASE_OUT. The out curve is heavily front loaded and the
  // six had landed by frame 62 of a window that runs to 92, so two thirds of
  // the flight happened in the first third of its time and the words were
  // unreadable throughout.
  // Starts at frame zero. The first token lifts on the opening frame, so there
  // is motion and a changing number before anything is read, which is what
  // section 10 asks for and what the old thirty-four frame static card denied.
  const fly = interpolate(frame, [0, 44], [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT.easing,
  });
  const template = interpolate(frame, [46, 80], [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT.easing,
  });

  const shown =
    Math.round(fly * PROMPT.rawTokens) +
    Math.round(template * (PROMPT.templatedTokens - PROMPT.rawTokens));

  return (
    <>
      <Label top={292} opacity={ramp(frame, -6, 10)}>
        What the model actually receives
      </Label>

      <ChatFrame
        top={330}
        question={PROMPT.text}
        opacity={ramp(frame, -4, 12)}
        send={send * (1 - fly)}
      />

      <TokenArrival top={606} fly={fly} template={template} />

      {/* The counter arrives with the first token rather than sitting on a zero
          for the opening second, which is the dead frame the playbook warns
          about and the same fault shot 2 had. */}
      {/* Live from frame zero. It is the changing number the opening needs, and
          it reads against the first narration line on purpose: the line says
          six while this climbs past six. */}
      <Readout top={956} size={62} weight={600}>
        {shown}
      </Readout>
      <Label top={1046} opacity={ramp(frame, 4, 12)}>
        tokens the model receives
      </Label>

      <Provenance top={1150} opacity={ramp(frame, 84, 20)}>
        {PROMPT.rawIds.slice(0, 3).map((id, i) => `${JSON.stringify(PROMPT.rawPieces[i])} ${id}`).join("  ·  ")}
      </Provenance>
      <Provenance top={1196} opacity={ramp(frame, 106, 18)}>
        six of them are yours · the other nineteen are the chat template
      </Provenance>
    </>
  );
};

/**
 * Shot 2. The network, and the one token that comes out of it.
 *
 * This is the shot the first version of this cut did not have. It drew
 * thirty-six layers as a grid of squares and a list of percentages, which
 * carried the same information and gave nobody a reason to stop scrolling. The
 * playbook says to build objects rather than readouts and that version broke
 * its own rule.
 *
 * Every arc is a measured attention weight. Twenty-five tokens, each attending
 * to everything before it, is 325 weights per head; sixteen heads across
 * thirty-six layers is 187,200 of them for one six-word question. The triangle
 * the arcs make is the causal mask, not a composition choice.
 *
 * Three beats, each landing under its own narration line. The field fills as
 * the front crosses the layers, then everything fades except the arcs into the
 * token that speaks next, then that token fires into the vocabulary.
 */
export const Forward: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [4, 82], [0, 1], { ...clamp, ...EASE_OUT });
  const depth = interpolate(frame, [10, 98], [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT.easing,
  });
  const converge = ramp(frame, 104, 44);
  const fieldOut = interpolate(frame, [126, 144], [1, 0], clamp);
  const arrive = interpolate(frame, [128, 148], [0, 1], { ...clamp, ...EASE_OUT });
  const collapse = ramp(frame, 148, 18);

  // The readout is live from the first frame. Holding a 0 under the field for
  // four seconds while the layers climbed is what the previous version did, and
  // a shot that opens on a zero has a dead frame at every cut.
  const layer = Math.max(1, Math.round(depth * MODEL.layers));
  const showingVocab = frame >= 126;

  return (
    <>
      <Label top={292} opacity={ramp(frame, -6, 10)}>
        Every token reads every token before it
      </Label>

      <ChatFrame top={330} question={PROMPT.text} />

      <AttentionField
        top={606}
        depth={depth}
        reveal={reveal}
        converge={converge}
        opacity={ramp(frame, 0, 10) * fieldOut}
      />

      <Vocabulary
        top={640}
        arrive={arrive}
        collapse={collapse}
        opacity={interpolate(frame, [128, 146], [0, 1], clamp)}
      />

      <div
        style={{
          position: "absolute",
          top: 790,
          left: (1080 - 620) / 2,
          width: 620,
          opacity: ramp(frame, 150, 18),
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
              // Spread wider than the usual stagger so the shot's last motion
              // runs to 218. At five frames apart it finished at 188 and left
              // 1.8 seconds of a still frame before the cut.
              // Twelve frames apart, not eight. The five appear deliberately
              // rather than together, and the shot's last motion runs to 216
              // instead of 198, which is what its quiet tail was.
              opacity: ramp(frame, 150 + i * 12, 18),
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

      <Readout top={956} size={62} weight={600}>
        {showingVocab ? commas(counting(arrive, MODEL.vocab, 1_000)) : layer}
      </Readout>
      <Label top={1046}>
        {showingVocab ? "candidates scored" : `of ${MODEL.layers} layers`}
      </Label>

      <Provenance top={1150} opacity={ramp(frame, 44, 26)}>
        {WEIGHTS_PER_HEAD} weights per head · {MODEL.heads} heads ·{" "}
        {MODEL.layers} layers · {commas(ATTENTION_WEIGHTS_TOTAL)} in total
      </Provenance>
      <Provenance top={1196} opacity={ramp(frame, 176, 22)}>
        step {STEP.index} · temperature 0 · arc brightness is the measured weight
      </Provenance>
    </>
  );
};

/**
 * Shot 3. The loop, and the cache.
 *
 * Rebuilt on 2026-09-11 along with shot 2. The first version had three separate
 * faults and all three came from drawing the idea twice: a single column
 * standing for the stack, a cache strip beside it, and a chat card on top of
 * both.
 *
 * The column used `rise > 0 ? 1 : 0`, and during the fast passes the sub-pass
 * progress alternated 0 and 0.5 every frame, so it switched fully dark every
 * other frame. That is a 15 Hz strobe, not a style.
 *
 * The cache strip capped at 51 slots when it needed 65, so the one object whose
 * whole job is to grow visibly stopped growing at 17.7 seconds and contradicted
 * the shot's own claim.
 *
 * And the chat card with a two-line answer ran 62 pixels into the column.
 *
 * The rebuild removes the column and the strip. The row of nodes is the cache:
 * it starts at the prompt's twenty-five and gains one per token, and each pass
 * fans an arc from the newest token back across every position before it. One
 * object, one claim, and no separate thing to fall out of sync.
 */
export const Loop: React.FC = () => {
  const frame = useCurrentFrame();
  const step = interpolate(frame, [14, 176], [0, GENERATION.tokens], {
    ...clamp,
    easing: EASE_IN_OUT.easing,
  });
  const passes = Math.max(0, Math.min(Math.round(step), GENERATION.tokens));
  const words = Math.round((passes / GENERATION.tokens) * ANSWER_PIECES.length);

  return (
    <>
      <Label top={292} opacity={ramp(frame, -6, 10)}>
        And again · once per token
      </Label>

      <ChatFrame
        top={330}
        question={PROMPT.text}
        answer={ANSWER_PIECES.slice(0, words).join("")}
        writing={passes > 0 && passes < GENERATION.tokens}
      />

      <GenerationFan top={606} step={step} opacity={ramp(frame, 0, 10)} />

      <Readout top={956} size={62} weight={600}>
        {passes}
      </Readout>
      <Label top={1046}>forward passes</Label>

      <Provenance top={1150} opacity={ramp(frame, 182, 22)}>
        the earlier tokens are not recomputed · they are read
      </Provenance>
      <Provenance top={1196} opacity={ramp(frame, 210, 20)}>
        arcs are the measured weights at layer {GENERATION_LAYER}, head-averaged
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
