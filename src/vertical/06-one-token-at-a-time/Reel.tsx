import { Sequence } from "remotion";
import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { SHOTS, length } from "./beats";
import { narration } from "./narration";
import { EndCard, Forward, Loop, Tokenize } from "./shots";

/**
 * A run of cues standing in for one stream of events, with the gain rising
 * across it.
 *
 * VR04 and VR05 carry the same helper. It stays local because both of those are
 * published or finished, and reaching into a finished cut to extract fifteen
 * lines is the wrong trade. If a seventh cut needs it, it moves to
 * `shared/vertical`.
 */
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
      Thirty-one cues in twenty-six seconds. No bed, no sustained texture.

      Gains are set from each file's measured peak toward the targets in section
      11 of the standard: the heaviest cues near -5 dBFS, the quiet ones between
      -14 and -19, checked on the finished render rather than reasoned from the
      source levels.

      No `scan`. It marks elapsed time, and nothing here is about how long
      something takes. The layer climb is a machine doing work, not a duration.
    */}

    {/* The window, then the message leaving it. */}
    <Sfx name="appear" at={2} gain={2.8} />
    <Sfx name="send" at={8} gain={5.5} />
    {/* Your six land as one thing being placed. */}
    <Sfx name="settle" at={34} gain={5} />
    {/* The template's nineteen arrive as data, one piece at a time. Different
        cue from the six on purpose: the shot is the difference between them. */}
    <Run name="fill" at={[76, 88, 100, 114, 128]} gain={[8, 18]} />
    <Sfx name="tick" at={146} gain={4.9} />

    {/* The front crossing thirty-six layers. `process` is one named piece of
        work and the climb is four of them, not a texture under the shot. */}
    <Run name="process" at={[216, 232, 248, 264]} gain={[9, 12]} />
    {/* Twenty-four columns going dark. Louder than the same cue is in VR05,
        because there it dismissed a field that had finished and here it is the
        shot's first real event. At gain 8 it measured -17.9, the bottom of the
        range, for the moment the cut is trying to make people notice. */}
    <Sfx name="dissolve" at={276} gain={12} />
    {/* The vocabulary arriving. */}
    <Sfx name="appear" at={304} gain={3.4} />
    {/* It collapses. */}
    <Sfx name="settle" at={338} gain={4.1} />
    {/* One kept. The heaviest cue in the cut, and the moment the whole reel is
        built around. */}
    <Sfx name="name" at={350} gain={5} />
    <Sfx name="tick" at={360} gain={4.9} />

    {/* Three passes slowly enough to hear, then thirty-seven that are not. The
        cues accelerate with the picture rather than keeping time against it. */}
    <Sfx name="process" at={430} gain={11} />
    <Sfx name="process" at={448} gain={11} />
    <Sfx name="process" at={466} gain={11} />
    <Run name="fill" at={[484, 502, 518, 532, 544, 554]} gain={[10, 18]} />
    <Sfx name="tick" at={560} gain={4.9} />

    {/* The cost is placed, the mark, then the closing line. */}
    <Sfx name="settle" at={642} gain={4.1} />
    <Sfx name="name" at={668} gain={4.4} />
    <Sfx name="land" at={716} gain={4} />
  </VerticalShell>
);
