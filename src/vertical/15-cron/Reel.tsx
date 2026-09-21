import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import {
  CLOSER_AT,
  FIRES,
  OPENING_AT,
  PINS,
  ROWS,
  TICKS,
  UNIT_CUES,
} from "./cues";
import { Cron } from "./Cron";
import { narration } from "./narration";

/**
 * Cues.
 *
 * A clock under everything, and an accent every time the marker crosses an hour
 * that fires. The density of the track is the density of the schedule, so the
 * collapse is something a listener hears before they have read a number: at
 * `* * * * *` almost every tick carries an accent, and by `0 9 * * 1` one in
 * twenty-four does.
 *
 * Nothing here marks an animated property, which is the line the audio contract
 * draws. Frames come out of `beats.ts` and `cues.ts`, which the picture reads
 * too, so a retime moves both.
 */
export const CronReel: React.FC = () => (
  <VerticalShell>
    <Cron />
    <Narration lines={narration} />

    <Sfx name="appear" at={OPENING_AT} gain={4.3} />

    {/* The clock. Time passes whether anything is scheduled or not. */}
    {TICKS.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="tick"
        at={pulse.frame}
        gain={pulse.gain}
        playbackRate={pulse.rate}
      />
    ))}

    {/* An hour that fires. */}
    {FIRES.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="probe"
        at={pulse.frame}
        gain={pulse.gain}
        playbackRate={pulse.rate}
      />
    ))}

    {/* A field being pinned. */}
    {PINS.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="settle"
        at={pulse.frame}
        gain={pulse.gain}
        playbackRate={pulse.rate}
      />
    ))}

    {/* A line of the reference landing, then what it is a year of. */}
    {ROWS.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="land"
        at={pulse.frame}
        gain={pulse.gain}
        playbackRate={pulse.rate}
      />
    ))}

    {UNIT_CUES.map((pulse) => (
      <Sfx
        key={pulse.id}
        name="tick"
        at={pulse.frame}
        gain={pulse.gain}
        playbackRate={pulse.rate}
      />
    ))}

    <Sfx name="solved" at={CLOSER_AT} gain={5.3} />
  </VerticalShell>
);
