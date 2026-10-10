import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { CUES } from "./cues";
import { narration } from "./narration";
import { HEADLINE_TOP, Restaurant } from "./Restaurant";

/** Every cue and its level are in `cues.ts`. */
export const KioskReel: React.FC = () => (
  <VerticalShell>
    <Restaurant />
    <Headline top={HEADLINE_TOP}>
      Do kiosks get you
      <br />
      your food faster?
    </Headline>
    <Narration lines={narration} />
    {CUES.map((cue) => (
      <Sfx
        key={cue.id}
        name={cue.name}
        at={cue.frame}
        gain={cue.gain}
        playbackRate={cue.rate}
        durationInFrames={cue.length}
      />
    ))}
  </VerticalShell>
);
