import { Audio, Sequence, staticFile } from "remotion";

type SfxProps = {
  /** File name in public/sfx, without the extension. */
  name: string;
  /** Frame the sound starts on. Impacts land on the visual, never after it. */
  at: number;
  /** Per-use level. The generated files are conservative; trim further here. */
  gain?: number;
};

/**
 * One semantic sound effect.
 *
 * The audio contract allows sounds for events that mean something, not for
 * every animated property. If you cannot say in one sentence what just
 * happened, the sound should not be here.
 */
export const Sfx: React.FC<SfxProps> = ({ name, at, gain = 1 }) => (
  <Sequence from={at} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={gain} />
  </Sequence>
);
