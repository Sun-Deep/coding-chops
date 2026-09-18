import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { COLLAPSE_TO, DRAIN_TO, RATIO_FROM } from "./beats";
import { CRUSH, DRAIN, LITERALS, MATCHES } from "./cues";
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

    {/* The file coming to rest at its new size, then the zip closing on it. */}
    <Sfx name="land" at={COLLAPSE_TO} gain={4.9} playbackRate={0.86} />
    <Sfx name="solved" at={DRAIN_TO - 4} gain={3.2} />
    <Sfx name="name" at={RATIO_FROM} gain={3.4} />
  </VerticalShell>
);
