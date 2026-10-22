import { interpolate } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import { SCENE_TOP } from "./History";
import { DIFF } from "./measurements";
import { CHANGE_AT } from "./transcript";

/**
 * The bug, big enough to check: the end of the line the first bad commit
 * changed, before and after, cut from the `git show` above it. The
 * terminal carries the whole line; this is the part a viewer needs.
 */

const tail = (line: string) => line.slice(line.lastIndexOf("total"));
const LINE = Number(
  DIFF.show.find((l) => l.startsWith("@@"))!.match(/^@@ -(\d+)/)![1],
);
const FROM = CHANGE_AT;

export const Change: React.FC<{ frame: number }> = ({ frame }) => {
  const show = interpolate(frame, [FROM, FROM + 7], [0, 1], clamp);
  if (show <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: SCENE_TOP + 420,
        left: 120,
        padding: "12px 24px 14px",
        borderRadius: 14,
        background: "rgba(10,11,13,0.9)",
        border: "1px solid rgba(233,228,216,0.12)",
        opacity: show,
        transform: `translateY(${(1 - show) * 10}px)`,
        fontFamily: theme.monoFamily,
        fontVariantLigatures: "none",
        fontFeatureSettings: '"liga" 0, "calt" 0',
        whiteSpace: "pre",
      }}
    >
      <div
        style={{
          fontSize: 19,
          letterSpacing: "0.06em",
          color: theme.colors.grayDark,
          marginBottom: 4,
        }}
      >
        {DIFF.file}, line {LINE}
      </div>
      <div style={{ fontSize: 42, lineHeight: 1.2, color: theme.colors.chalk }}>
        - {tail(DIFF.before)}
      </div>
      <div
        style={{
          fontSize: 42,
          lineHeight: 1.2,
          color: ACCENT,
          fontWeight: 700,
        }}
      >
        + {tail(DIFF.after)}
      </div>
    </div>
  );
};
