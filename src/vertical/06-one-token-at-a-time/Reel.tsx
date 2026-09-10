import { Sequence } from "remotion";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { SHOTS, length } from "./beats";
import { narration } from "./narration";
import { EndCard, Forward, Loop, Tokenize } from "./shots";

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
 * Sound is step 6 and is not cut yet.
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
  </VerticalShell>
);
