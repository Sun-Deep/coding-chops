import { Img, OffthreadVideo, interpolate, staticFile } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT, ON_ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import { B } from "./clock";
import { AI_H, AI_TOP } from "./Code";

/**
 * The interview room, rendered in Blender by
 * `scripts/blender/interview/render.sh`, and along its top, in one row
 * clear of the action buttons, the three skills the round is graded on,
 * each appearing as the voice reaches it. The wording
 * of the three is the internal document's, as Business Insider quoted it.
 */

export const SCENE_TOP = AI_TOP + AI_H + 12;
/** The render is 1620 x 516, shown 1080 wide. */
export const SCENE_H = 344;
const WIDTH = 1080;
const C = theme.colors;

const SKILLS: [number, string][] = [
  [B.gemini, "prompt engineering"],
  [B.wrong, "output validation"],
  [B.understand, "debugging"],
];

export const Stage: React.FC<{
  frame: number;
  still?: string;
  /** The cover leaves the chips off; its headline carries the point. */
  chips?: boolean;
}> = ({ frame: f, still, chips = true }) => (
  <div
    style={{
      position: "absolute",
      top: SCENE_TOP,
      left: 0,
      width: WIDTH,
      height: SCENE_H,
      overflow: "hidden",
      background: C.black,
    }}
  >
    {still ? (
      <Img src={staticFile(still)} style={{ width: WIDTH, height: SCENE_H }} />
    ) : (
      <OffthreadVideo
        src={staticFile("vr50/room.mp4")}
        muted
        style={{ width: WIDTH, height: SCENE_H }}
      />
    )}
    <div
      style={{
        position: "absolute",
        left: 150,
        width: 780,
        top: 10,
        display: "flex",
        justifyContent: "center",
        gap: 14,
      }}
    >
      {SKILLS.filter(() => chips).map(([at, label], i) => {
        const on = interpolate(f, [at, at + 6], [0, 1], clamp);
        const now = f >= at && f < (SKILLS[i + 1]?.[0] ?? B.pilot);
        return on > 0 ? (
          <div
            key={label}
            style={{
              opacity: on,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: theme.monoFamily,
              fontSize: 16,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: C.chalk,
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: now ? ACCENT : C.chalk,
                color: ON_ACCENT,
                fontWeight: 800,
              }}
            >
              {i + 1}
            </span>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: 6,
                background: "rgba(10,11,13,0.8)",
              }}
            >
              {label}
            </span>
          </div>
        ) : null;
      })}
    </div>
  </div>
);
