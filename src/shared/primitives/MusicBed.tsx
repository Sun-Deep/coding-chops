import type { Caption } from "@remotion/captions";
import { Audio, staticFile } from "remotion";
import { FPS } from "../video/timing";
import { toSentences } from "../video/captions";

/** A stretch of authored silence, such as a prediction hold. */
export type Hold = { startFrame: number; endFrame: number };

type MusicBedProps = {
  /** Path under public/, for example "music/your-track.mp3". */
  src: string;
  /** Used to build the duck envelope, so the bed drops exactly under speech. */
  captions: readonly Caption[];
  /** Level with nobody speaking. */
  gain?: number;
  /** Fraction of that level while the narrator is talking. */
  duck?: number;
  /**
   * Windows where the bed must stay down even though nobody is speaking.
   *
   * Caption absence is not silence. A prediction hold has no caption, so the
   * duck envelope releases and the bed climbs back to full over 1.1 seconds,
   * which makes the quietest moment in the scene the loudest. These pin it.
   */
  holds?: readonly Hold[];
};

/**
 * The music bed, ducked under narration.
 *
 * The duck is driven by the caption timings rather than by a compressor
 * listening to the voice, which means it is exact and identical on every
 * render. The audio contract puts narration first, so the bed steps back
 * before a word starts and comes up only once a sentence has finished.
 *
 * The bed loops. The track runs 46 seconds and every scene but the first and
 * the disclosure is longer than that, so without this the music simply stopped
 * partway through and the rest of the scene played dry. The seam falls wherever
 * it falls, which is inaudible on an ambient bed sitting under a voice.
 *
 * `holds` covers the case captions cannot describe: deliberate silence. It pins
 * the bed at the duck level rather than cutting to nothing, because two seconds
 * of true silence after music has been playing is a hard edge that draws
 * attention to itself. Dropping and staying reads as the room going still.
 */
export const MusicBed: React.FC<MusicBedProps> = ({
  src,
  captions,
  gain = 0.5,
  duck = 0.34,
  holds = [],
}) => {
  const lines = toSentences(captions);
  // Move ahead of the voice, recover slowly. A duck that arrives late is
  // audible as a dip; one that recovers fast is audible as a pump.
  const attack = Math.round(FPS * 0.35);
  const release = Math.round(FPS * 1.1);

  const volume = (frame: number) => {
    let level = 1;
    for (const line of lines) {
      const from = line.startFrame - attack;
      const to = line.endFrame + release;
      if (frame < from || frame > to) continue;

      const rampIn = Math.min(1, (frame - from) / attack);
      const rampOut = Math.min(1, (to - frame) / release);
      const amount = Math.min(rampIn, rampOut);
      level = Math.min(level, 1 - amount * (1 - duck));
    }

    // Last, so a caption's release cannot lift the bed inside a thinking window.
    for (const hold of holds) {
      if (frame >= hold.startFrame && frame <= hold.endFrame) {
        level = Math.min(level, duck);
      }
    }

    return level * gain;
  };

  return <Audio src={staticFile(src)} volume={volume} loop />;
};
