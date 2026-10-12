import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { Buffet } from "./Buffet";
import { CUES } from "./cues";
import { narration } from "./narration";

export const BuffetReel: React.FC = () => (
  <VerticalShell>
    <Buffet />
    <Headline top={232}>
      Should you skip ahead
      <br />
      in a buffet line?
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
