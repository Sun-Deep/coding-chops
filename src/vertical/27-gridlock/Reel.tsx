import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { CUES } from "./cues";
import { Grid, HEADLINE_TOP } from "./Grid";
import { narration } from "./narration";

/** Every cue and its level are in `cues.ts`. */
export const GridlockReel: React.FC = () => (
  <VerticalShell>
    <Grid />
    <Headline top={HEADLINE_TOP}>
      The light is green.
      <br />
      Why is it stuck?
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
