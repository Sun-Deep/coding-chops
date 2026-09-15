import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { VERDICT_FROM, VERDICT_LAND } from "./beats";
import { ARRIVALS, MUD_FRAMES, PROBES, WALK } from "./cues";
import { narration } from "./narration";
import { SearchRace } from "./SearchRace";

/**
 * Per-probe level. `probe.wav` peaks at -37.5 dBFS and dozens overlap, so 11
 * puts one click at about -19, inside the band section 11 of the standard
 * gives the quiet cues, with the arrivals six decibels above it.
 */
const PROBE_GAIN = 8;

/**
 * Cues.
 *
 * Underneath, the searching itself: a `probe` every tenth cell a panel
 * expands, pitched by how far that cell is from the start, so a flood spreading
 * out is a rising sweep. `cues.ts` has the reasoning.
 *
 * Over the top, one `settle` per search running out of work, rising as the grid
 * empties, on frames read out of the same curve the picture uses.
 */
export const SearchRaceReel: React.FC = () => (
  <VerticalShell>
    <SearchRace />
    <Narration lines={narration} />

    {PROBES.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="probe"
        at={pulse.frame}
        gain={PROBE_GAIN}
        playbackRate={pulse.rate}
      />
    ))}

    {ARRIVALS.map((arrival, index) => (
      <Sfx
        key={arrival.key}
        name="settle"
        at={arrival.frame}
        gain={3.1 + index * 0.44}
      />
    ))}

    {WALK.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="probe"
        at={pulse.frame}
        gain={pulse.heavy ? PROBE_GAIN * 1.5 : PROBE_GAIN}
        playbackRate={pulse.rate}
        durationInFrames={pulse.heavy ? MUD_FRAMES : undefined}
      />
    ))}

    <Sfx name="appear" at={VERDICT_FROM} gain={3.3} />
    <Sfx name="land" at={VERDICT_LAND} gain={4.6} />
  </VerticalShell>
);
