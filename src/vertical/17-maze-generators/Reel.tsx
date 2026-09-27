import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { CARVE_END, SHORT_WALK_TO, VERDICT_FROM } from "./beats";
import { DIGS, ROUTE_NOTES, SHUFFLE_NOTES, WALKS } from "./cues";
import { MazeRace } from "./MazeRace";
import { narration } from "./narration";

/**
 * Per-note level for `probe`, VR10's value. Set against the finished render,
 * not reasoned from the file, and checked there.
 */
const PROBE_GAIN = 8;

/**
 * Cues.
 *
 * Underneath, the digging: a pitched `probe` every twelfth wall per panel.
 * `cues.ts` has the reasoning. Over it, one `settle` as the last wall comes
 * down in all six at once, each route climbing the scale as it draws, `appear` as
 * two mazes grow out of the grid, the two walks, `land` as binary tree's walker
 * reaches the exit, and one unchanging note per new maze under a route that
 * does not change.
 */
export const MazeGeneratorsReel: React.FC = () => (
  <VerticalShell>
    <MazeRace />
    <Narration lines={narration} />

    {DIGS.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="probe"
        at={pulse.frame}
        gain={PROBE_GAIN}
        playbackRate={pulse.rate}
      />
    ))}

    <Sfx name="settle" at={CARVE_END} gain={4.2} />
    {ROUTE_NOTES.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="probe"
        at={pulse.frame}
        gain={PROBE_GAIN}
        playbackRate={pulse.rate}
      />
    ))}

    <Sfx name="appear" at={VERDICT_FROM} gain={3.3} />
    {WALKS.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="probe"
        at={pulse.frame}
        gain={PROBE_GAIN}
        playbackRate={pulse.rate}
      />
    ))}
    <Sfx name="land" at={SHORT_WALK_TO} gain={4.6} />

    {SHUFFLE_NOTES.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="probe"
        at={pulse.frame}
        gain={PROBE_GAIN * 1.2}
        playbackRate={pulse.rate}
      />
    ))}
  </VerticalShell>
);
