import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { CUES } from "./cues";
import { Footsteps } from "./Footsteps";
import { HEADLINE_TOP, Lobby } from "./Lobby";
import { narration } from "./narration";

/** Every cue and its level are in `cues.ts`. */
export const ElevatorDoorReel: React.FC = () => (
  <VerticalShell>
    <Lobby />
    <Headline top={HEADLINE_TOP}>
      Should you hold the
      <br />
      elevator door?
    </Headline>
    <Narration lines={narration} />
    <Footsteps rule="hold" />
    <Footsteps rule="close" />
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
