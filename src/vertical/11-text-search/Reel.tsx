import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { FLOOD_FROM, REPLAY_TO, VERDICT_FROM } from "./beats";
import { PROBES, REPLAY } from "./cues";
import { narration } from "./narration";
import { TextSearch } from "./TextSearch";

/**
 * Per-probe level. `probe.wav` peaks at -29.1 dBFS and several ring at once,
 * so 8 puts the reading layer near -14, with the verdict above it.
 */
const PROBE_GAIN = 8;

/**
 * Cues.
 *
 * The reading itself underneath, pitched by the column the sweep is in so each
 * line is a run up the scale, with the panels out of phase so six do not strike
 * together. Density carries the claim: naive fires constantly and Boyer-Moore
 * barely does.
 *
 * Then the verdict's walk, with the top of the scale every time the window
 * leaps over ground it never reads. `cues.ts` has the reasoning.
 */
export const TextSearchReel: React.FC = () => (
  <VerticalShell>
    <TextSearch />
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
    {REPLAY.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="probe"
        at={pulse.frame}
        gain={PROBE_GAIN * 1.15}
        playbackRate={pulse.rate}
      />
    ))}

    <Sfx name="appear" at={VERDICT_FROM} gain={3.3} />
    <Sfx name="land" at={REPLAY_TO} gain={4.0} />
    <Sfx name="fill" at={FLOOD_FROM} gain={5.2} />
  </VerticalShell>
);
