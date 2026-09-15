import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { VERDICT_FROM, VERDICT_LAND } from "./beats";
import { RACE_FIRE, REPLAY_FIRE } from "./cues";
import { narration } from "./narration";
import { FINISHING_ORDER } from "./sorting";
import { SortingRace } from "./SortingRace";

/**
 * Per-click level.
 *
 * `swap.wav` peaks at -35.3 dBFS, so 9 puts a single click at about -19,
 * inside the band section 11 of the standard gives the quiet cues. The first
 * pass ran it at -24 and the gunfire sat under the floor: the mean level of the
 * whole track moved three tenths of a decibel when it was added, which is a
 * texture nobody hears on a phone. The `settle` marking each panel finishing
 * runs six decibels above it and still cuts through.
 */
const FIRE_GAIN = 9;

/**
 * Cues.
 *
 * Two layers. Underneath, every panel firing a `swap` as bars land in their
 * slots, pitched by the value that landed and struck once every tenth write, so
 * the six panels are audibly doing different amounts of work and the whole
 * thing speeds up as the shared clock does. `cues.ts` has the reasoning.
 *
 * Over the top, one `settle` per panel finishing, rising as the field empties.
 * Those frames are read out of the traces rather than typed in, so a change to
 * the pacing curve moves the sound with the picture instead of leaving it
 * behind, which is the mistake VR07 shipped and had to be caught by the
 * creator.
 *
 * No meter cue on the shared clock. There was one, two `tick`s in the opening
 * seconds where nothing had finished yet, and the gunfire made it redundant:
 * the firing rate is the clock, and it is tied to the picture in a way a tick
 * on a round number never was.
 */
export const SortingRaceReel: React.FC = () => (
  <VerticalShell>
    <SortingRace />
    <Narration lines={narration} />

    {RACE_FIRE.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="swap"
        at={pulse.frame}
        gain={FIRE_GAIN}
        playbackRate={pulse.rate}
      />
    ))}
    {REPLAY_FIRE.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="swap"
        at={pulse.frame}
        gain={FIRE_GAIN}
        playbackRate={pulse.rate}
      />
    ))}

    {FINISHING_ORDER.map((algorithm, index) => (
      <Sfx
        key={algorithm.key}
        name="settle"
        at={algorithm.playback.finishedAt}
        gain={3.1 + index * 0.42}
      />
    ))}

    <Sfx name="appear" at={VERDICT_FROM} gain={3.3} />
    <Sfx name="land" at={VERDICT_LAND} gain={5.4} />
  </VerticalShell>
);
