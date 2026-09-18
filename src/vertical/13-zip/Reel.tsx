import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { RATIO_FROM } from "./beats";
import { CRUSH, DRAIN, FILED, LITERALS, MATCHES, SEAL } from "./cues";
import { narration } from "./narration";
import { Zip } from "./Zip";

/**
 * Cues.
 *
 * Every sound here is an event the picture is already making: a character being
 * spelled out, a stretch being matched, a stretch being crushed. Nothing marks
 * an animated property, which is the line the audio contract draws.
 *
 * Frames come out of `beats.ts` and `cues.ts`, which the picture reads too, so
 * a retime moves both. That is the mistake VR07 shipped and had to be caught by
 * the creator.
 */
export const ZipReel: React.FC = () => (
  <VerticalShell>
    <Zip />
    <Narration lines={narration} />

    {LITERALS.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="tick"
        at={pulse.frame}
        gain={pulse.gain}
        playbackRate={pulse.rate}
      />
    ))}

    {MATCHES.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="probe"
        at={pulse.frame}
        gain={pulse.gain}
        playbackRate={pulse.rate}
      />
    ))}

    {CRUSH.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="swap"
        at={pulse.frame}
        gain={pulse.gain}
        playbackRate={pulse.rate}
      />
    ))}

    {/* What survived, going into the zip a line at a time. */}
    {DRAIN.map((pulse) => (
      <Sfx
        key={pulse.id}
        name={pulse.id.startsWith("drain-go") ? "return" : "tick"}
        at={pulse.frame}
        gain={pulse.gain}
        playbackRate={pulse.rate}
      />
    ))}

    {/* Each member landing in the archive, then the archive being closed. */}
    {FILED.map((at, i) => (
      <Sfx
        key={`filed-${i}`}
        name="land"
        at={at}
        gain={4.6}
        playbackRate={0.88}
      />
    ))}
    <Sfx name="solved" at={SEAL} gain={3.2} />
    <Sfx name="name" at={RATIO_FROM} gain={3.4} />
  </VerticalShell>
);
