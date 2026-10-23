import { useCurrentFrame } from "remotion";
import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { CUES } from "./cues";
import { Panel } from "./Panel";
import { narration } from "./narration";
import { Stage } from "./Stage";

export const HEADLINE_TOP = 232;

const Body: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Panel frame={frame} />
      <Stage frame={frame} />
    </>
  );
};

/** Every cue and its level are in `cues.ts`. */
export const Php2ShellReel: React.FC = () => (
  <VerticalShell>
    <Body />
    <Headline top={HEADLINE_TOP}>
      Why PHP sites
      <br />
      went offline
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
