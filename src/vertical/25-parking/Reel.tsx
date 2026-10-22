import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { CUES } from "./cues";
import { HEADLINE_TOP, Lots } from "./Lot";
import { narration } from "./narration";

/** Every cue and its level are in `cues.ts`. */
export const ParkingReel: React.FC = () => (
  <VerticalShell>
    <Headline top={HEADLINE_TOP}>
      Should you circle for
      <br />a closer parking spot?
    </Headline>
    <Lots />
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
