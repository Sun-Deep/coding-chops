import { Sequence } from "remotion";
import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import {
  DOUBLE_LANDS,
  DURATION,
  EXTRA_A_IN,
  REMOVE_IN,
  RETRY_FAIL,
  RETRY_STARTS,
  SCAN_FROM,
  SCAN_LANDS,
  SHOTS,
  length,
} from "./beats";
import { gainFor } from "./cues";
import { narration } from "./narration";
import { Double, Fix, Retry } from "./shots";

/**
 * One input, followed all the way through the failure and the fix.
 *
 * The first version used a binary tree as its opening image. This one earns
 * that abstraction with four concrete regroupings of `aaaaaX`, then uses two
 * measured timings to show the doubling. The final shot edits the same pattern
 * and collapses those retries into one linear scan.
 */
export const RegexBacktrackingReel: React.FC = () => (
  <VerticalShell loopFrames={DURATION}>
    <Sequence from={SHOTS.retry.from} durationInFrames={length(SHOTS.retry)}>
      <Retry />
    </Sequence>
    <Sequence from={SHOTS.double.from} durationInFrames={length(SHOTS.double)}>
      <Double />
    </Sequence>
    <Sequence from={SHOTS.fix.from} durationInFrames={length(SHOTS.fix)}>
      <Fix />
    </Sequence>

    <Narration lines={narration} />

    {/* The picture begins mid-attempt, but the first cue waits four frames.
        That keeps both sides of the loop boundary silent. */}
    <Sfx name="send" at={4} gain={gainFor("send", -17)} />
    {RETRY_STARTS.map((start, index) => (
      <Sfx
        key={start}
        name="reject"
        at={SHOTS.retry.from + start + RETRY_FAIL}
        gain={gainFor("reject", -12 + index * 1.4)}
      />
    ))}
    {RETRY_STARTS.slice(1).map((start) => (
      <Sfx
        key={`retry-${start}`}
        name="send"
        at={SHOTS.retry.from + start}
        gain={gainFor("send", -17)}
      />
    ))}

    {/* One character arrives. The second measured lane lands at twice the
        length, and the readout names the relationship a moment later. */}
    <Sfx name="send" at={SHOTS.double.from} gain={gainFor("send", -14)} />
    <Sfx
      name="appear"
      at={SHOTS.double.from + EXTRA_A_IN}
      gain={gainFor("name", -12)}
    />
    <Sfx
      name="land"
      at={SHOTS.double.from + EXTRA_A_IN + 16}
      gain={gainFor("settle", -9)}
    />
    <Sfx
      name="name"
      at={SHOTS.double.from + DOUBLE_LANDS}
      gain={gainFor("name", -6)}
    />

    {/* The outer quantifier leaves, the failed rows fold together, and one
        scan reaches X. No sound marks the held result after that. */}
    <Sfx
      name="dissolve"
      at={SHOTS.fix.from + REMOVE_IN}
      gain={gainFor("dissolve", -10)}
    />
    <Sfx
      name="settle"
      at={SHOTS.fix.from + REMOVE_IN + 30}
      gain={gainFor("settle", -11)}
    />
    <Sfx
      name="scan"
      at={SHOTS.fix.from + SCAN_FROM}
      gain={gainFor("scan", -15)}
      durationInFrames={SCAN_LANDS - SCAN_FROM + 4}
    />
    <Sfx
      name="reject"
      at={SHOTS.fix.from + SCAN_LANDS}
      gain={gainFor("reject", -10)}
    />
  </VerticalShell>
);
