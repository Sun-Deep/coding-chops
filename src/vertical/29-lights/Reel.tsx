import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { CUES } from "./cues";
import { narration } from "./narration";
import { HEADLINE_TOP, Trees } from "./Trees";

/** Every cue and its level are in `cues.ts`. */
export const LightsReel: React.FC = () => (
  <VerticalShell>
    <Trees />
    <Headline top={HEADLINE_TOP}>
      One bad bulb.
      <br />
      How do you find it?
    </Headline>
    <Narration lines={narration} />
    {CUES.map((cue) => (
      <Sfx
        key={cue.id}
        name={cue.name}
        at={cue.frame}
        gain={cue.gain}
        playbackRate={cue.rate}
      />
    ))}
  </VerticalShell>
);
