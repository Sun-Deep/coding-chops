import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { ACCENT } from "../../shared/vertical/palette";
import { Headline } from "../../shared/vertical/type";
import { CUES } from "./cues";
import { Elevator, HEADLINE_TOP } from "./Elevator";
import { narration } from "./narration";

/** Every cue and its level are in `cues.ts`. */
export const ElevatorReel: React.FC = () => (
  <VerticalShell>
    <Headline top={HEADLINE_TOP}>
      Which elevator gets
      <br />
      <span style={{ color: ACCENT }}>you</span> there first?
    </Headline>
    <Elevator />
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
