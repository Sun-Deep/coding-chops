import { Sequence } from "remotion";
import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { SHOTS, length } from "./beats";
import { narration } from "./narration";
import { AlreadySorted, Cleave, EndCard, Race, Verdict, Writes } from "./shots";

/**
 * A counter climbing, as a meter rather than a bed.
 *
 * One cue per step rather than one per unit, with the gain rising across the
 * run, because a count is under more tension near the top of its range than at
 * the bottom. Nothing sustained plays anywhere in this cut: the rate limiting
 * cut laid seven seconds of filtered noise under four shots because they felt
 * quiet, and the answer to a quiet shot is to find the event in it.
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

/** Each time quicksort finishes a run and scatters into the next one. */
const Laps: React.FC<{ at: readonly number[] }> = ({ at }) => (
  <>
    {at.map((f, i) => (
      <Sfx key={i} name="land" at={f} gain={4 + (i / at.length) * 3} />
    ))}
  </>
);

/**
 * Two sorts, one array, twenty-seven seconds.
 *
 * One claim, and it is a ratio: selection sort spends 19,900 comparisons on two
 * hundred numbers whatever order they arrive in, and quicksort spends about
 * 1,554. The cut does not state that ratio until the end. It runs both at the
 * same comparisons per frame and lets quicksort finish twelve times while the
 * other finishes once, which is the same fact arriving as something watched
 * rather than something read.
 *
 * No title card. Frame zero is both fields already mid-run.
 *
 * It ends on the catch rather than the winner. Quicksort moves three times as
 * much memory, and a cut that stops at "quicksort is faster" sends somebody to
 * write one into a flash controller.
 */
export const QuicksortReel: React.FC = () => (
  <VerticalShell handOverAt={SHOTS.endCard.from + 20}>
    <Sequence from={SHOTS.race.from} durationInFrames={length(SHOTS.race)}>
      <Race />
    </Sequence>
    <Sequence from={SHOTS.cleave.from} durationInFrames={length(SHOTS.cleave)}>
      <Cleave />
    </Sequence>
    <Sequence from={SHOTS.sorted.from} durationInFrames={length(SHOTS.sorted)}>
      <AlreadySorted />
    </Sequence>
    <Sequence from={SHOTS.writes.from} durationInFrames={length(SHOTS.writes)}>
      <Writes />
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

    <Narration lines={narration} />

    {/* The race. The opening, quicksort's first landing, then a lap sound each
        time it finishes another one. The laps accelerate in gain rather than in
        rate, because the rate is fixed and the tension is not. */}
    <Sfx name="appear" at={0} gain={5} />
    <Counting from={4} to={18} cues={4} gain={[6, 10]} />
    <Sfx name="land" at={20} gain={6} />
    <Sfx name="name" at={38} gain={5} />
    <Laps at={[63, 88, 113, 138, 163, 188, 213, 238, 263, 288, 313]} />
    <Sfx name="settle" at={318} gain={5} />

    {/* The cleave. One cue per partition depth rather than per comparison. */}
    <Sfx name="send" at={SHOTS.cleave.from} gain={6} />
    <Counting from={SHOTS.cleave.from + 8} to={SHOTS.cleave.to - 26} cues={6} />
    <Sfx name="land" at={SHOTS.cleave.to - 18} gain={6} />

    {/* Already sorted. The rake runs and nothing happens, so the only sound is
        the count. The silence where a swap would be is the point. */}
    <Sfx name="send" at={SHOTS.sorted.from} gain={6} />
    <Counting
      from={SHOTS.sorted.from + 8}
      to={SHOTS.sorted.to - 26}
      cues={8}
      gain={[6, 12]}
    />
    <Sfx name="land" at={SHOTS.sorted.to - 18} gain={6} />

    {/* Writes. Quicksort's field fills, so its side gets the texture. */}
    <Sfx name="send" at={SHOTS.writes.from} gain={6} />
    <Counting
      from={SHOTS.writes.from + 8}
      to={SHOTS.writes.to - 24}
      cues={9}
      gain={[6, 12]}
    />
    <Sfx name="settle" at={SHOTS.writes.to - 16} gain={5} />

    {/* Two rows, then the ratio a beat later, so the shot has three events
        rather than one and a hold. */}
    <Sfx name="dissolve" at={SHOTS.verdict.from} gain={6} />
    <Sfx name="fill" at={SHOTS.verdict.from + 6} gain={8} />
    <Sfx name="fill" at={SHOTS.verdict.from + 14} gain={8} />
    <Sfx name="name" at={SHOTS.verdict.from + 30} gain={6} />

    <Sfx name="send" at={SHOTS.endCard.from} gain={6} />
    <Sfx name="name" at={SHOTS.endCard.from + 24} gain={5} />
  </VerticalShell>
);

/** Shot one on its own, kept for reviewing the opening in isolation. */
export const QuicksortShotOne: React.FC = () => (
  <VerticalShell>
    <Sequence durationInFrames={90}>
      <Race />
    </Sequence>
    <Narration lines={narration.slice(0, 2)} />
  </VerticalShell>
);
