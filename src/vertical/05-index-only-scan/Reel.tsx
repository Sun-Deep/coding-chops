import { Sequence } from "remotion";
import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { SHOTS, length } from "./beats";
import { narration } from "./narration";
import { Covering, EndCard, Fetch, Stale, Verdict } from "./shots";

/**
 * The index that still reads the table, in thirty seconds.
 *
 * VR01 asked for one row and compared no index against an index. On one row the
 * heap fetch is a single page and nobody notices it. This asks for a hundred
 * thousand rows, where that fetch happens a hundred thousand times and becomes
 * the entire cost, and compares an index against an index that carries the
 * answer.
 *
 * The spine is one question asked three times: does Postgres open the table.
 * Yes across most of it, no, then yes again with nothing changed but a missing
 * VACUUM. Three shots share a layout, which is the exception the playbook
 * allows, because the comparison is the point and the behaviour visibly
 * differs. The accent goes where the answer is being found, so watching the
 * orange move out of the heap and back into it is the argument.
 *
 * It ends on the cost rather than the win, following VR01. A cut that stops at
 * 246x teaches people to put INCLUDE on everything.
 *
 * The commentary is burned in rather than spoken, because most people watch a
 * reel muted. There is no music: the effects are the entire track, so the cut
 * can have someone else's audio laid over it at upload without losing its
 * explanation.
 */
export const IndexOnlyScanReel: React.FC = () => (
  <VerticalShell handOverAt={SHOTS.endCard.from + 34}>
    <Sequence from={SHOTS.fetch.from} durationInFrames={length(SHOTS.fetch)}>
      <Fetch />
    </Sequence>
    <Sequence
      from={SHOTS.covering.from}
      durationInFrames={length(SHOTS.covering)}
    >
      <Covering />
    </Sequence>
    <Sequence from={SHOTS.stale.from} durationInFrames={length(SHOTS.stale)}>
      <Stale />
    </Sequence>
    <Sequence
      from={SHOTS.verdict.from}
      durationInFrames={length(SHOTS.verdict)}
    >
      <Verdict />
    </Sequence>
    <Sequence
      from={SHOTS.endCard.from}
      durationInFrames={length(SHOTS.endCard)}
    >
      <EndCard />
    </Sequence>

    {/* Over every shot, on absolute frames, so the track reads as one voice. */}
    <Narration lines={narration} />

    {/*
      Placeholder cue map. Step 6 sets these against the finished render rather
      than by reasoning from the source levels, and the gains below are the
      set's nominal ones and are certainly wrong. The three events that have to
      land are the fetches starting in shot one, the silence where shot two's
      fetches would be, and the field relighting in shot three.
    */}

    {/* The block arrives, index first. */}
    <Sfx name="appear" at={2} gain={5} />
    {/* The index does its small piece of work, and finishes. */}
    <Sfx name="process" at={8} gain={8.5} />
    {/* Then four seconds of fetching, which is the shot. */}
    <Sfx name="scan" at={26} gain={12} />
    {/* Half the table, said out loud. */}
    <Sfx name="tick" at={160} gain={5} />

    {/* The index thickens. */}
    <Sfx name="fill" at={238} gain={8} />
    {/* The same small piece of work. Deliberately the same cue as frame 8. */}
    <Sfx name="process" at={282} gain={8.5} />
    {/* And nothing else. The silence from here to 430 is the shot. */}
    <Sfx name="land" at={320} gain={5.5} />

    {/* The update. */}
    <Sfx name="send" at={436} gain={6.5} />
    {/* Pages going stale. */}
    <Sfx name="dissolve" at={444} gain={7} />
    {/* The floor going out. */}
    <Sfx name="reject" at={480} gain={7.5} />
    <Sfx name="scan" at={484} gain={10} />
    <Sfx name="tick" at={530} gain={5} />

    {/* Into the comparison. */}
    <Sfx name="send" at={626} gain={6.5} />
    <Sfx name="fill" at={632} gain={8.5} />
    <Sfx name="fill" at={642} gain={8.5} />
    <Sfx name="fill" at={652} gain={8.5} />
    {/* The ratio. */}
    <Sfx name="name" at={662} gain={5} />

    {/* The cost. */}
    <Sfx name="settle" at={772} gain={5.5} />
    <Sfx name="land" at={840} gain={5.5} />
    {/* The mark. */}
    <Sfx name="name" at={812} gain={5} />
  </VerticalShell>
);
