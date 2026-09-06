import { interpolate, useCurrentFrame } from "remotion";
import { Lockup } from "./Lockup";
import { theme } from "./theme";
import { clamp } from "../video/timing";
import { EASE_OUT } from "../video/motion";

type OutroProps = {
  /** The line the episode ends on. One sentence, in the episode's own words. */
  closing: string;
  tone?: "paper" | "black";
  /** Frame the card starts arriving on. */
  start?: number;
};

/**
 * The end card, from Problem Solving 01 onward.
 *
 * The system design episode that is already published keeps its own outro in
 * `Scene07`, with the prompt mark and the cobalt Inter wordmark. That episode
 * is out in the world and re-cutting it would make the published file and the
 * repository disagree, so nothing here touches it.
 *
 * The lockup arrives first and the closing line follows a beat later, because
 * a viewer reads the name and then the sentence, not both at once.
 */
export const Outro: React.FC<OutroProps> = ({
  closing,
  tone = "black",
  start = 0,
}) => {
  const frame = useCurrentFrame();
  const lockup = interpolate(frame, [start, start + 14], [0, 1], {
    ...clamp,
    ...EASE_OUT,
  });
  const line = interpolate(frame, [start + 10, start + 26], [0, 1], {
    ...clamp,
    ...EASE_OUT,
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 44,
      }}
    >
      <div style={{ opacity: lockup }}>
        <Lockup size={68} tone={tone} />
      </div>
      <div
        style={{
          opacity: line,
          transform: `translateY(${interpolate(line, [0, 1], [16, 0])}px)`,
          fontFamily: theme.fontFamily,
          fontSize: 84,
          fontWeight: 800,
          letterSpacing: "-0.06em",
          lineHeight: 0.96,
          textAlign: "center",
          color: tone === "black" ? theme.colors.chalk : theme.colors.ink,
        }}
      >
        {closing}
      </div>
    </div>
  );
};
