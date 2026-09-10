import { Sequence } from "remotion";
import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { SHOTS, length } from "./beats";
import { narration } from "./narration";
import { Covering, EndCard, Fetch, Stale, Verdict } from "./shots";

/**
 * A counter climbing, as a meter rather than a bed.
 *
 * One cue per step with the gain rising across the run, because a count is
 * under more tension near the top of its range than at the bottom. Nothing
 * sustained plays anywhere in this cut.
 *
 * VR04 carries the same helper. If a third cut needs it, it should move to
 * `shared/vertical` rather than being copied again; it is duplicated here
 * instead of extracted because VR04 is published and approved, and reaching
 * into a published cut to refactor a fifteen line helper is the wrong trade.
 */
const Counting: React.FC<{
  from: number;
  to: number;
  cues?: number;
  gain?: readonly [number, number];
}> = ({ from, to, cues = 7, gain = [7, 11] }) => (
  <>
    {Array.from({ length: cues }, (_, i) => {
      const t = cues === 1 ? 0 : i / (cues - 1);
      return (
        <Sfx
          key={i}
          name="fill"
          at={Math.round(from + (to - from) * t)}
          gain={gain[0] + (gain[1] - gain[0]) * t}
        />
      );
    })}
  </>
);

/**
 * The index that still reads the table, in twenty-two seconds.
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
  <VerticalShell handOverAt={SHOTS.endCard.from + 24}>
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
      The whole audio track. No bed, so every cue has to earn the silence around
      it and the silence has to be the right length.

      Gains are set from each file's measured peak toward the targets in section
      11 of the standard: the heaviest cues near -5 dBFS, the quiet ones between
      -14 and -19. They were checked on the finished render rather than reasoned
      from the source levels.

      No `scan`, deliberately, even though shot one is a bitmap heap scan running
      for four seconds. `scan` marks elapsed time, and this shot's claim is a
      count: the number on screen is climbing and the fill cues are pages
      arriving. Using it here would also blur it against VR01, where it carried a
      sequential scan reading the table in order, and the difference between that
      and fetching scattered pages is the thing this cut exists to draw.
    */}

    {/* The block arrives. */}
    <Sfx name="appear" at={2} gain={2.8} />
    {/* The index does its one named piece of work, and is finished by frame 20.
        Everything after this is the heap. */}
    <Sfx name="process" at={6} gain={11} />
    {/* Pages arriving, rising as the count does. A counter is under more tension
        near the top of its range than at the bottom. Five cues rather than the
        seven the thirty second cut used, because the run is 92 frames now and
        not 128, and a counting run is one event stream rather than five events. */}
    <Counting from={18} to={110} cues={5} gain={[8, 18]} />
    {/* Half the table, named. */}
    <Sfx name="tick" at={116} gain={4.9} />

    {/* The index thickens: an object being placed, not data arriving. */}
    <Sfx name="settle" at={192} gain={4.1} />
    {/* The identical cue to frame 6, at the identical gain, because the index
        does the identical work. If it sounded different the shot would be
        claiming the index got cleverer, and it did not. */}
    <Sfx name="process" at={198} gain={11} />
    {/* The answer, without a trip to the table. */}
    <Sfx name="land" at={270} gain={4.5} />
    {/* And then nothing for seventy-five frames. Shot one puts five cues in this
        space. The silence is the shot. */}

    {/* The update departs. */}
    <Sfx name="send" at={349} gain={5.5} />
    {/* Pages losing their all-visible bit. */}
    <Sfx name="dissolve" at={355} gain={8} />
    {/* The index only scan is refused. `reject` is in the set for a request
        turned away, which is exactly what the visibility map has just done. */}
    <Sfx name="reject" at={379} gain={8} />
    {/* The refill, three cues in thirty frames against shot one's five in
        ninety-two. Same event, three times the rate. */}
    <Counting from={381} to={411} cues={3} gain={[13, 18]} />
    <Sfx name="tick" at={415} gain={4.9} />

    {/* The fields leave and the three lanes arrive. */}
    <Sfx name="dissolve" at={484} gain={8} />
    <Sfx name="fill" at={488} gain={14} />
    <Sfx name="fill" at={496} gain={14} />
    <Sfx name="fill" at={504} gain={14} />
    {/* The ratio. The heaviest cue in the cut and one of two places `name` is
        used at all. */}
    <Sfx name="name" at={512} gain={5} />

    {/* The cost is placed. */}
    <Sfx name="settle" at={572} gain={4.1} />
    {/* The closing line. */}
    <Sfx name="land" at={576} gain={4} />
    {/* The mark. */}
    <Sfx name="name" at={600} gain={4.4} />

  </VerticalShell>
);
