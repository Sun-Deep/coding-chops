import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { CUES } from "./cues";
import { DockerLayers } from "./DockerLayers";
import { narration } from "./narration";

/** Every cue and its level are in `cues.ts`. */
export const DockerLayersReel: React.FC = () => (
  <VerticalShell>
    <DockerLayers />
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
