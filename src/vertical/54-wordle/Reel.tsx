import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { CUES } from "./cues";
import { narration } from "./narration";
import { Stage } from "./Stage";

export const WordleReel: React.FC<{ still?: string }> = ({ still }) => {
  const frame = useCurrentFrame();
  return (
    <VerticalShell>
      <AbsoluteFill style={{ background: theme.colors.black }} />
      <Stage frame={frame} still={still} />
      <Headline top={260} size={84}>
        Wordle&apos;s best opener.
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
};
