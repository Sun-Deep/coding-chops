import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { NOTE_AT, OUTPUT_AT } from "./beats";
import { CUES } from "./cues";
import { Listing } from "./Listing";
import { narration } from "./narration";

/**
 * Cues. `cues.ts` has the reasoning; this lays them out, plus `appear` as the
 * folder's contents are listed and `name` as the size row says what 4096 is.
 */
export const LsLongReel: React.FC = () => (
  <VerticalShell>
    <Listing />
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

    <Sfx name="appear" at={OUTPUT_AT} gain={3.3} />
    <Sfx name="name" at={NOTE_AT} gain={4.4} />
  </VerticalShell>
);
