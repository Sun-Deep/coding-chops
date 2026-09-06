import { Sequence } from "remotion";
import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { SHOTS, length } from "./beats";
import { narration } from "./narration";
import { Descent, EndCard, Scan, Verdict } from "./shots";

/**
 * How a database index actually works, in thirty seconds.
 *
 * The reel makes one claim and shows the working: the same query against the
 * same ten million rows reads all of them without an index and four pages with
 * one. It opens on the scan already running rather than on a card stating the
 * claim, because the card said what the cover says and stood still while it
 * said it. See `beats.ts`. The descent is the hero, because it is the part that gets described in
 * words far more often than it gets drawn, and because a search space
 * collapsing is the shape of thing this channel's most-watched cuts have always
 * been.
 *
 * It ends on the cost rather than on the win. An index reel that stops at the
 * speedup teaches people to add indexes, which is the wrong lesson and the one
 * they will be undoing in production later.
 *
 * The commentary is burned in rather than spoken. Most people watch a reel
 * muted, so a cut that only makes sense with sound is a cut most of its audience
 * never understands.
 *
 * There is no music. The sound effects are the entire track, cut to the
 * animation: eighteen cues, each marking one thing arriving, leaving or being
 * decided, with a seven and a half second machine texture under the sweep
 * because the only thing that shot is about is how long it takes.
 *
 * Shipping with no bed also leaves the audio free for whatever the platform's
 * own library gets laid on top at upload, which is where a reel's reach usually
 * comes from. The cues are placed so they still read underneath one.
 */
export const DatabaseIndexReel: React.FC = () => (
  <VerticalShell handOverAt={SHOTS.endCard.from + 34}>
    <Sequence from={SHOTS.scan.from} durationInFrames={length(SHOTS.scan)}>
      <Scan />
    </Sequence>
    <Sequence
      from={SHOTS.descent.from}
      durationInFrames={length(SHOTS.descent)}
    >
      <Descent />
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

    {/*
      The whole audio track. No bed, so every cue has to earn the silence
      around it and the silence has to be the right length.

      One cue per event: something arrives, something leaves, or something is
      decided. Nothing plays because a property moved. The counter climbing
      through ten million rows gets no sound of its own, because `scan` is
      already saying that for as long as it is true.

      Gains run well above one. The set was levelled to sit under narration,
      and with neither narration nor music there is nothing left to sit under.
      They are set so the heaviest cues peak near -5 dBFS in the finished file
      and the quiet ones sit between -14 and -19, measured on the render rather
      than reasoned from the source levels.
    */}

    {/* Over every shot, on absolute frames, so the track reads as one voice
        rather than four. */}
    <Narration lines={narration} />

    {/* The table is born, already filling. */}
    <Sfx name="appear" at={0} gain={5} />
    {/* The sweep, running for the seven and a half seconds it takes. */}
    <Sfx name="scan" at={8} gain={13} />
    {/* The one matching row. */}
    <Sfx name="land" at={232} gain={5.5} />
    {/* And the count of everything that was not it. */}
    <Sfx name="tick" at={250} gain={5} />

    {/* The whole table leaves. */}
    <Sfx name="dissolve" at={280} gain={8.5} />
    {/* One page read each. */}
    <Sfx name="process" at={314} gain={8.5} />
    <Sfx name="process" at={363} gain={8.5} />
    <Sfx name="process" at={412} gain={8.5} />
    {/* The row. */}
    <Sfx name="land" at={461} gain={5.5} />
    {/* Three page reads, said out loud. */}
    <Sfx name="tick" at={514} gain={5} />

    {/* Into the comparison. */}
    <Sfx name="send" at={576} gain={6.5} />
    {/* A line of the table each. */}
    <Sfx name="fill" at={598} gain={8.5} />
    <Sfx name="fill" at={610} gain={8.5} />
    {/* The ratio. The heaviest sound in the set, and one of two places it is
        used in the whole cut. */}
    <Sfx name="name" at={622} gain={5} />

    {/* The comparison leaves. */}
    <Sfx name="dissolve" at={684} gain={7} />
    {/* What it costs. */}
    <Sfx name="settle" at={696} gain={5.5} />
    {/* The line that costs it. */}
    <Sfx name="land" at={716} gain={5.5} />
    {/* The mark. */}
    <Sfx name="name" at={728} gain={5} />
  </VerticalShell>
);
