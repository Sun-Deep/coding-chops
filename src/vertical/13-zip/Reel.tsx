import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { COLLAPSE_TO, VERDICT_TO } from "./beats";
import { CRUSH, LITERALS, MATCHES } from "./cues";
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

    {/* The file coming to rest at its new size. */}
    <Sfx name="land" at={COLLAPSE_TO} gain={5.6} playbackRate={0.86} />
    <Sfx name="name" at={VERDICT_TO - 6} gain={4.6} />
  </VerticalShell>
);
