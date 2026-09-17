import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { DIALS, ROLL, TOTAL_FROM } from "./beats";
import { CLICKS } from "./cues";
import { FileModes } from "./FileModes";
import { narration } from "./narration";

/**
 * Cues.
 *
 * A lock is the one object where the sound needs no inventing: every event in
 * this cut is a switch arriving, a drum coming to rest or a switch being
 * thrown. `tick` is the whole track, pitched by where the thing sits on the
 * lock, with `settle` under the drums so the combination turning has weight.
 *
 * Frames come out of `beats.ts`, which the picture reads too, so a retime moves
 * both. That is the mistake VR07 shipped and had to be caught by the creator.
 */
export const FileModesReel: React.FC = () => (
  <VerticalShell>
    <FileModes />
    <Narration lines={narration} />

    {CLICKS.map((click) => (
      <Sfx
        key={click.id}
        name="tick"
        at={click.frame}
        gain={click.gain}
        playbackRate={click.rate}
      />
    ))}

    {DIALS.slice(1).map((dial) => (
      <Sfx
        key={`turn-${dial.at}`}
        name="settle"
        at={dial.at + ROLL - 4}
        gain={3.2}
        playbackRate={0.92}
      />
    ))}

    <Sfx name="name" at={TOTAL_FROM} gain={4.4} />
  </VerticalShell>
);
