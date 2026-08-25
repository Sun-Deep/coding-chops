import type { Caption } from "@remotion/captions";
import { Audio, staticFile } from "remotion";
import { FPS } from "../video/timing";
import { toSentences } from "../video/captions";

type MusicBedProps = {
  /** Path under public/, for example "music/your-track.mp3". */
  src: string;
  /** Used to build the duck envelope, so the bed drops exactly under speech. */
  captions: readonly Caption[];
  /** Level with nobody speaking. */
  gain?: number;
  /** Fraction of that level while the narrator is talking. */
  duck?: number;
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
 */
export const MusicBed: React.FC<MusicBedProps> = ({
  src,
  captions,
  gain = 0.5,
  duck = 0.34,
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
    return level * gain;
  };

  return <Audio src={staticFile(src)} volume={volume} loop />;
};
