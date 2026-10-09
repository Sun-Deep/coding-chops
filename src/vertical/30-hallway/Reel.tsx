import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { Corridor, HEADLINE_TOP } from "./Corridor";
import { CUES } from "./cues";
import { narration } from "./narration";

/** Every cue and its level are in `cues.ts`. */
export const HallwayReel: React.FC = () => (
  <VerticalShell>
    <Corridor />
    <Headline top={HEADLINE_TOP}>
      Why do you both step
      <br />
      the same way?
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
