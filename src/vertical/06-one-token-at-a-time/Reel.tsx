import { Sequence, interpolate } from "remotion";
import { Sfx } from "../../shared/primitives/Sfx";
import { EASE_IN_OUT } from "../../shared/video/motion";
import { clamp } from "../../shared/video/timing";
import { GENERATION } from "./measurements";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { SHOTS, length } from "./beats";
import { narration } from "./narration";
import { EndCard, Forward, Loop, Tokenize } from "./shots";

/**
 * Cue times derived from the animation, not typed in beside it.
 *
 * Every event below is found by sampling the same interpolation the shot uses,
 * so a cue cannot drift from the thing it marks. The previous cue map was
 * written against an earlier animation and survived two rebuilds pointing at
 * events that no longer existed: `process` cues for a layer climb that had been
 * deleted, a `dissolve` for columns that no longer went dark.
 */

/** Frames on which each of the six typed tokens lands in its slot. */
const LANDINGS = (() => {
  const out: number[] = [];
  let seen = 0;
  for (let f = 0; f <= 56; f++) {
    const fly = interpolate(f, [0, 44], [0, 1], {
      ...clamp,
      easing: EASE_IN_OUT.easing,
    });
    // The same stagger TokenArrival applies.
    const landed = [0, 1, 2, 3, 4, 5].filter(
      (i) => (fly * (6 + 2.5) - i) / 2.6 >= 1,
    ).length;
    if (landed > seen) {
      for (let k = seen; k < landed; k++) out.push(f);
      seen = landed;
    }
  }
  return out;
})();

/**
 * Frames on which each forward pass completes, from shot 3's own clock, thinned
 * to a floor of three frames between cues.
 *
 * All forty land between frames 25 and 126, and the easing puts some of them a
 * single frame apart. Thirty cues a second do not read as thirty events, they
 * fuse into a tone, and a rasp under this shot would be the sustained texture
 * the sound set's own notes warn about. Three frames is about ten a second,
 * which is the fastest a listener still hears as separate.
 *
 * The passes that lose a cue are not passes the cut pretends did not happen:
 * the counter shows forty and the row grows forty times. The run marks the
 * stream, the way the standard already treats a counting run.
 */
const PASSES = (() => {
  const out: number[] = [];
  let seen = 0;
  for (let f = 14; f <= 176; f++) {
    const step = interpolate(f, [14, 176], [0, GENERATION.tokens], {
      ...clamp,
      easing: EASE_IN_OUT.easing,
    });
    const n = Math.min(Math.round(step), GENERATION.tokens);
    if (n > seen) {
      if (out.length === 0 || f - out[out.length - 1] >= 3) out.push(f);
      seen = n;
    }
  }
  return out;
})();

/**
 * One cue per pass, quieter where they crowd.
 *
 * Gain scales with the gap to the previous pass, so the dense middle of the run
 * sits back and the slow ends step forward. The sound accelerates and slows
 * with the picture rather than keeping its own time against it.
 */
const PassCues: React.FC<{ from: number }> = ({ from }) => (
  <>
    {PASSES.map((f, i) => {
      const gap = i === 0 ? 8 : f - PASSES[i - 1];
      // code-step peaks at -36.6 dBFS, the quietest file in the set, so these
      // run higher than any other cue in the cut to land in the same band.
      const gain = interpolate(gap, [3, 8], [12, 16], clamp);
      return <Sfx key={i} name="code-step" at={from + f} gain={gain} />;
    })}
  </>
);

/** A stream of arrivals, rising across the run. */
const Run: React.FC<{
  name: string;
  at: readonly number[];
  gain: readonly [number, number];
}> = ({ name, at, gain }) => (
  <>
    {at.map((f, i) => (
      <Sfx
        key={i}
        name={name}
        at={f}
        gain={gain[0] + ((gain[1] - gain[0]) * i) / Math.max(1, at.length - 1)}
      />
    ))}
  </>
);

/**
 * One token at a time, in twenty-six seconds.
 *
 * The claim is that a model does not write an answer. It writes one token,
 * chosen by scoring 151,936 candidates, and then does it again. The prompt goes
 * up the stack once; after that only the newest token does, while everything
 * before it sits in a cache that is read whole on every pass.
 *
 * Nine things happen between the send button and the first character. They
 * group into four shots, because nine would be a hundred frames and seven words
 * each. Embedding has no beat of its own; it is the tokens entering the stack.
 *
 * The chat window is ours. Every figure here came off a local open model,
 * because no commercial model publishes its vocabulary size, block count or
 * logits, and wrapping measured Qwen internals in someone else's interface
 * would claim they were theirs.
 *
 * It ends on the cost, following VR01 and VR05. The cost is memory: 36 KB of
 * cache per token, both sides of the conversation, read in full every time.
 *
 * The sound is effects only, no bed. Shipping with no music leaves the audio
 * free for whatever the platform's own library gets laid over it at upload,
 * which is where a reel's reach usually comes from.
 */
export const OneTokenAtATimeReel: React.FC = () => (
  <VerticalShell handOverAt={SHOTS.endCard.from + 26}>
    <Sequence from={SHOTS.tokens.from} durationInFrames={length(SHOTS.tokens)}>
      <Tokenize />
    </Sequence>
    <Sequence from={SHOTS.stack.from} durationInFrames={length(SHOTS.stack)}>
      <Forward />
    </Sequence>
    <Sequence from={SHOTS.loop.from} durationInFrames={length(SHOTS.loop)}>
      <Loop />
    </Sequence>
    <Sequence
      from={SHOTS.endCard.from}
      durationInFrames={length(SHOTS.endCard)}
    >
      <EndCard />
    </Sequence>

    <Narration lines={narration} />

    {/*
      The whole audio track. No bed, so every cue has to earn the silence around
      it and the silence has to be the right length.

      Everything is placed against `SHOTS` rather than as absolute frames. The
      first two versions of this map were absolute, and both of them survived a
      retime still firing at events that had moved or been deleted.

      Gains are set from each file's measured peak toward section 11's targets:
      the heaviest near -5 dBFS, the quiet ones between -14 and -19, checked on
      the finished render rather than reasoned from the source levels.

      No `scan` anywhere. It marks elapsed time and nothing here is about how
      long something takes.
    */}

    {/* Shot 1. The sentence is already coming apart on frame zero. */}
    <Sfx name="appear" at={SHOTS.tokens.from + 1} gain={2.8} />
    <Sfx name="send" at={SHOTS.tokens.from + 6} gain={6} />
    {/* One per token landing in its slot, from the flight's own stagger. */}
    {LANDINGS.map((f, i) => (
      <Sfx
        key={i}
        name="settle"
        at={SHOTS.tokens.from + f}
        gain={4 + i * 0.35}
      />
    ))}
    {/* The nineteen the template adds, arriving as data rather than as objects.
        A different cue from the six because the difference between those two
        groups is the whole of this shot. */}
    <Run
      name="fill"
      at={[48, 56, 64, 72, 78].map((f) => SHOTS.tokens.from + f)}
      gain={[8, 17]}
    />
    <Sfx name="tick" at={SHOTS.tokens.from + 86} gain={4.9} />

    {/* Shot 2. The network forming, converging, and firing. */}
    <Run
      name="fill"
      at={[8, 22, 36, 50, 64, 78].map((f) => SHOTS.stack.from + f)}
      gain={[9, 15]}
    />
    {/* The arcs going out, leaving the one that speaks next. */}
    <Sfx name="dissolve" at={SHOTS.stack.from + 104} gain={12} />
    <Sfx name="appear" at={SHOTS.stack.from + 128} gain={3.6} />
    <Sfx name="settle" at={SHOTS.stack.from + 148} gain={4.4} />
    {/* Five candidates, then the one that is kept. The heaviest cue in the cut
        and the moment the whole reel is built around. */}
    <Run
      name="tick"
      at={[150, 156, 162, 168, 174].map((f) => SHOTS.stack.from + f)}
      gain={[2, 3]}
    />
    {/* Back to 5 now the candidate ticks no longer land on the same frame. At
        4.2 with the collision gone the cut peaked at -6.1, under target for the
        loudest thing in it. */}
    <Sfx name="name" at={SHOTS.stack.from + 170} gain={5} />

    {/* Shot 3. Forty passes, on the animation's own clock. */}
    <PassCues from={SHOTS.loop.from} />
    <Sfx name="tick" at={SHOTS.loop.from + 180} gain={4.9} />

    {/* Shot 4. The cost is placed, the mark, the closing line. */}
    <Sfx name="settle" at={SHOTS.endCard.from + 2} gain={4.1} />
    <Sfx name="name" at={SHOTS.endCard.from + 44} gain={4.4} />
    <Sfx name="land" at={SHOTS.endCard.from + 76} gain={4} />
  </VerticalShell>
);
