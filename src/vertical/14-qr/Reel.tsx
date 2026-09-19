import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import {
  BITES,
  CHIPS,
  HEALED_AT,
  LADDER,
  REBUILD,
  SCANNED_AT,
  HOLE_DONE_AT,
  OPENING_AT,
  SCAN_AT,
  SPLIT_AT,
  SUM,
  TYPED,
} from "./cues";
import { narration } from "./narration";
import { Qr } from "./Qr";

/**
 * Cues.
 *
 * The track has the shape of the argument: something is taken apart, and then
 * it is put back. Bites fall in pitch as the hole opens and the rebuild rises
 * as it closes, so a listener with their eyes shut still hears the two halves.
 *
 * Every sound is an event the picture is already making. Nothing marks an
 * animated property, which is the line the audio contract draws.
 *
 * Frames come out of `beats.ts` and `cues.ts`, which the picture reads too, so
 * a retime moves both. That is the mistake VR07 shipped and had to be caught by
 * the creator.
 */
export const QrReel: React.FC = () => (
  <VerticalShell>
    <Qr />
    <Narration lines={narration} />

    {/* The code landing. */}
    <Sfx name="appear" at={OPENING_AT} gain={4.0} />

    {/* Each ring of the hole opening. */}
    {BITES.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="swap"
        at={pulse.frame}
        gain={pulse.gain}
        playbackRate={pulse.rate}
      />
    ))}

    {/* The hole finished, then the scan reading through it. */}
    <Sfx name="settle" at={HOLE_DONE_AT} gain={4.4} playbackRate={0.9} />

    {/* The scan, and the code reading through the damage. */}
    <Sfx name="scan" at={SCAN_AT} gain={4.6} playbackRate={1.1} />
    <Sfx name="solved" at={SCANNED_AT} gain={5.6} />

    {/* What it read, arriving a character at a time. */}
    {TYPED.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="tick"
        at={pulse.frame}
        gain={pulse.gain}
        playbackRate={pulse.rate}
      />
    ))}

    {/* The seventy pieces landing. */}
    {CHIPS.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="tick"
        at={pulse.frame}
        gain={pulse.gain}
        playbackRate={pulse.rate}
      />
    ))}

    <Sfx name="name" at={SPLIT_AT} gain={4.8} />

    {SUM.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="land"
        at={pulse.frame}
        gain={pulse.gain}
        playbackRate={pulse.rate}
      />
    ))}

    {/* The reference arriving, a row at a time. */}
    {LADDER.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="land"
        at={pulse.frame}
        gain={pulse.gain}
        playbackRate={pulse.rate}
      />
    ))}

    {/* The backup putting the code back together. */}
    {REBUILD.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="probe"
        at={pulse.frame}
        gain={pulse.gain}
        playbackRate={pulse.rate}
      />
    ))}

    <Sfx name="solved" at={HEALED_AT} gain={6.2} playbackRate={1.06} />
  </VerticalShell>
);
