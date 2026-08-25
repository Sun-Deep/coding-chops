import type { Caption } from "@remotion/captions";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../brand/theme";
import { clamp } from "../video/timing";
import { toSentences } from "../video/captions";

type CaptionsProps = {
  captions: readonly Caption[];
  tone?: "paper" | "black";
};

/**
 * Subtitles, not part of the main visual hierarchy.
 *
 * Sizes and margins come from the caption contract in the production standard.
 * Captions stay unboxed, carry a shadow only on dark scenes, and show one
 * sentence at a time so they never compete with the hero type.
 */
export const Captions: React.FC<CaptionsProps> = ({
  captions,
  tone = "paper",
}) => {
  const frame = useCurrentFrame();
  const dark = tone === "black";
  const lines = toSentences(captions);
  const line = lines.find(
    (l) => frame >= l.startFrame && frame <= l.endFrame + 6,
  );

  if (!line) return null;

  const opacity = interpolate(
    frame,
    [line.startFrame - 3, line.startFrame, line.endFrame, line.endFrame + 6],
    [0, 1, 1, 0],
    clamp,
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 280,
        right: 280,
        bottom: 42,
        opacity,
        color: dark ? theme.colors.white : theme.colors.ink,
        fontFamily: theme.fontFamily,
        fontSize: 28,
        fontWeight: 600,
        letterSpacing: "-0.015em",
        lineHeight: 1.3,
        textAlign: "center",
        textShadow: dark ? "0 2px 18px rgba(0,0,0,0.55)" : undefined,
        zIndex: 100,
      }}
    >
      {line.text}
    </div>
  );
};
