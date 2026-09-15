import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../brand/theme";
import { Grade } from "../primitives/Grade";
import { Watermark } from "./Watermark";
import { clamp } from "../video/timing";

type VerticalShellProps = {
  children: ReactNode;
  /** Hide the watermark on a still that draws its own lockup, such as a cover. */
  watermark?: boolean;
  /**
   * Frame the corner mark starts handing over to a full end card.
   *
   * The mark is still in every frame either way. Two lockups on screen at once
   * is one too many, and the corner one is the one that has done its job by
   * then.
   */
  handOverAt?: number;
  /** Total frames when the final frame is authored to match frame zero. */
  loopFrames?: number;
};

/**
 * Everything a vertical cut carries under its shots.
 *
 * The dark canvas is the format default rather than a per-reel choice. A reel
 * is watched on a phone, usually one-handed and often at night, and the near
 * black ground is the one the Problem Solving track already settled on for
 * exactly that material. Section 25 of the problem-solving visual language
 * carries the argument; this format inherits it rather than reopening it.
 *
 * No `Captions` layer. A reel has no narration to caption, and the platform
 * lays its own auto-captions over the bottom of the frame anyway, which is part
 * of why the bottom reserve in `geometry.ts` is as large as it is. On-screen
 * type is the content here, not a subtitle track under it.
 *
 * No music either. The sound effects are the whole track, cut to the animation
 * rather than laid under it, and the silence between them is deliberate: a cut
 * that ships with no bed leaves the audio free for whatever the platform's own
 * library puts on top at upload, which is where a reel's reach usually comes
 * from. A bed underneath would fight that and lose.
 */
export const VerticalShell: React.FC<VerticalShellProps> = ({
  children,
  watermark = true,
  handOverAt,
  loopFrames,
}) => {
  const frame = useCurrentFrame();
  const mark =
    handOverAt === undefined
      ? 1
      : interpolate(frame, [handOverAt, handOverAt + 14], [1, 0], clamp);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        fontFamily: theme.fontFamily,
        color: theme.colors.chalk,
        background: `radial-gradient(circle at 50% 42%, #151B27 0%, ${theme.colors.black} 68%)`,
      }}
    >
      {children}
      {watermark ? <Watermark fade={mark} /> : null}
      <Grade
        tone="black"
        grain={0.022}
        frameOverride={
          loopFrames !== undefined && frame === loopFrames - 1 ? 0 : undefined
        }
      />
    </AbsoluteFill>
  );
};
