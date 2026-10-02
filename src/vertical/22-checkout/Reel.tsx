import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { Checkout, HEADLINE_TOP } from "./Checkout";
import { CUES } from "./cues";
import { narration } from "./narration";

/** Every cue and its level are in `cues.ts`. */
export const CheckoutReel: React.FC = () => (
  <VerticalShell>
    <Headline top={HEADLINE_TOP}>
      Why does the other line
      <br />
      always move faster?
    </Headline>
    <Checkout />
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
