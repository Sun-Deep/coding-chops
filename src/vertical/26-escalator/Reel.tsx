import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { Counters } from "./Counters";
import { CUES } from "./cues";
import { narration } from "./narration";
import { HEADLINE_TOP, Shaft } from "./Shaft";

/** Every cue and its level are in `cues.ts`. */
export const EscalatorReel: React.FC = () => (
  <VerticalShell>
    <Shaft />
    <Headline top={HEADLINE_TOP}>
      Should everyone stand
      <br />
      on the escalator?
    </Headline>
    <Counters />
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
