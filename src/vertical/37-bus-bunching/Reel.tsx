import { useCurrentFrame } from "remotion";
import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline, Provenance } from "../../shared/vertical/type";
import { CUES } from "./cues";
import { CONDITIONS } from "./measurements";
import { narration } from "./narration";
import { Street } from "./Street";

export const BusBunchingReel: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <VerticalShell>
      <Headline top={240}>
        Why buses
        <br />
        arrive together
      </Headline>
      <Provenance top={435}>{CONDITIONS}</Provenance>
      <Street frame={frame} />
      <Narration lines={narration} />
      {CUES.map((cue, i) => (
        <Sfx
          key={i}
          name={cue.name}
          at={cue.frame}
          gain={cue.gain}
          playbackRate={cue.rate}
        />
      ))}
    </VerticalShell>
  );
};
