import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../brand/theme";
import { clamp } from "../video/timing";
import { columnLeft, columnWidth } from "./geometry";

export type NarrationLine = {
  /** Absolute frame the line comes up on. */
  from: number;
  /** Absolute frame it starts leaving on. */
  to: number;
  text: ReactNode;
  /**
   * The line its shot has been building to. Set large, and given the room the
   * rest of the track does not need.
   */
  emphasis?: boolean;
};

/** Where the block's bottom edge sits. */
const BASELINE = 1460;
const FADE = 5;

/**
 * The narration, burned in.
 *
 * There is no voiceover. Most people watch a reel muted, and a cut that only
 * makes sense with sound is a cut most of its audience never understands. So
 * the commentary is on the screen, in the frame, rather than in an audio track
 * the platform may or may not play.
 *
 * It is not the platform's auto-caption track and does not replace it. Auto
 * captions transcribe speech, and there is none. This is the sentence a
 * narrator would be saying, written to be read.
 *
 * Bottom anchored rather than top anchored, so a two line subtitle and a two
 * line payoff at half again the size both end on the same baseline instead of
 * shifting the block down the frame every time the size changes.
 *
 * One line at a time, the same rule the horizontal caption contract uses. Two
 * lines of a subtitle plus everything above it is already the most a phone
 * frame will carry.
 */
export const Narration: React.FC<{ lines: readonly NarrationLine[] }> = ({
  lines,
}) => {
  const frame = useCurrentFrame();
  const line = lines.find(
    (l) => frame >= l.from - FADE && frame <= l.to + FADE,
  );

  if (!line) return null;

  const opacity = interpolate(
    frame,
    [line.from - FADE, line.from, line.to, line.to + FADE],
    [0, 1, 1, 0],
    clamp,
  );

  return (
    <div
      style={{
        position: "absolute",
        left: columnLeft(BASELINE),
        width: columnWidth(BASELINE),
        bottom: 1920 - BASELINE,
        opacity,
        textAlign: "center",
        color: theme.colors.chalk,
        fontFamily: theme.fontFamily,
        ...(line.emphasis
          ? {
              fontSize: 54,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
            }
          : {
              fontSize: 36,
              fontWeight: 600,
              letterSpacing: "-0.012em",
              lineHeight: 1.34,
            }),
      }}
    >
      {line.text}
    </div>
  );
};
