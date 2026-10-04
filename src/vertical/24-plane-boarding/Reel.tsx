import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { Cabins, HEADLINE_TOP } from "./Cabin";
import { CUES } from "./cues";
import { narration } from "./narration";

/** Every cue and its level are in `cues.ts`. */
export const PlaneBoardingReel: React.FC = () => (
  <VerticalShell>
    <Headline top={HEADLINE_TOP}>
      What's the fastest way
      <br />
      to board a plane?
    </Headline>
    <Cabins />
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
