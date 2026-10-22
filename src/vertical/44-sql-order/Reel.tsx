import { useCurrentFrame } from "remotion";
import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { CUES } from "./cues";
import { narration } from "./narration";
import { Query } from "./Query";
import { Table } from "./Table";
import "./runs";

export const HEADLINE_TOP = 232;

const Body: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Query frame={frame} />
      <Table frame={frame} />
    </>
  );
};

/** Every cue and its level are in `cues.ts`. */
export const SqlOrderReel: React.FC = () => (
  <VerticalShell>
    <Body />
    <Headline top={HEADLINE_TOP}>
      SQL doesn&apos;t run
      <br />
      top to bottom.
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
