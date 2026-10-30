import { useCurrentFrame } from "remotion";
import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { CUES } from "./cues";
import { narration } from "./narration";
import { Stage } from "./Stage";

export const WordleReel: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <VerticalShell>
      <Headline top={266} size={96}>
        Wordle&apos;s best
        <br />
        first guess.
      </Headline>
      <Stage frame={frame} />
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
};
