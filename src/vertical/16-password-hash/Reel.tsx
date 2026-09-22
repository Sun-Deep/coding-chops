import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { COMPARES, KEYS, VERDICTS, verdictSample } from "./cues";
import { narration } from "./narration";
import { PasswordHash } from "./PasswordHash";

/**
 * Cues.
 *
 * Keys going down, positions being compared, three verdicts. The comparison is
 * where the claim is: a position that came back rings, one that did not knocks
 * an octave and a fourth lower, so the wrong password is a run of dull knocks
 * with three rings in it and the right one is a run all the way across.
 *
 * Nothing here marks an animated property. Every frame comes out of `beats.ts`
 * and `cues.ts`, which the picture reads too, so a retime moves both.
 */
export const PasswordHashReel: React.FC = () => (
  <VerticalShell>
    <PasswordHash />
    <Narration lines={narration} />

    {/* A key going down, and the whole row turning over behind it. */}
    {KEYS.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="code-step"
        at={pulse.frame}
        gain={pulse.gain}
        playbackRate={pulse.rate}
      />
    ))}

    {/* The comparison crossing the row. */}
    {COMPARES.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="probe"
        at={pulse.frame}
        gain={pulse.gain}
        playbackRate={pulse.rate}
      />
    ))}

    {/* Two of these open a door and one does not. */}
    {VERDICTS.map((pulse, state) => (
      <Sfx
        key={pulse.id}
        name={verdictSample(state)}
        at={pulse.frame}
        gain={pulse.gain}
        playbackRate={pulse.rate}
      />
    ))}
  </VerticalShell>
);
