import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { Cabin, HEADLINE_TOP } from "./Cabin";
import { CUES } from "./cues";
import { narration } from "./narration";

/** Every cue and its level are in `cues.ts`. */
export const DeplaneReel: React.FC = () => (
  <VerticalShell>
    <Cabin />
    <Headline top={HEADLINE_TOP}>
      Stand up when the
      <br />
      seatbelt sign goes off?
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
