import { AbsoluteFill } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { theme } from "../../shared/brand/theme";
import {
  SQUARE_BOTTOM,
  SQUARE_TOP,
  WIDTH,
} from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Headline } from "../../shared/vertical/type";
import { B } from "./clock";
import { AI_H, AI_TOP, CODE_TOP, Code } from "./Code";
import { SCENE_TOP, Stage } from "./Stage";

/**
 * The moment the AI's fix fails its test: the editor and the assistant,
 * scaled to fit the square every grid crops to, and the room under them.
 */
export const COVER_FRAME = B.wrong + 12;
const CODE_PLACED = SQUARE_TOP + 176;
const SCALE = 0.78;
/** The room goes under the two panes, at full width. */
const SCENE_PLACED = CODE_PLACED + (AI_TOP + AI_H - CODE_TOP) * SCALE + 16;

export const GoogleInterviewCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: theme.colors.black,
    }}
  >
    <Headline top={SQUARE_TOP + 24} size={64}>
      LeetCode is dead?
    </Headline>
    <Headline top={SQUARE_TOP + 92} size={64} color={ACCENT}>
      Not even close.
    </Headline>
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: `${WIDTH / 2}px ${CODE_TOP}px`,
        transform: `translateY(${CODE_PLACED - CODE_TOP}px) scale(${SCALE})`,
      }}
    >
      <Code frame={COVER_FRAME} />
    </div>
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translateY(${SCENE_PLACED - SCENE_TOP}px)`,
      }}
    >
      <Stage frame={COVER_FRAME} still="vr50/room-cover.png" chips={false} />
    </div>
    <div
      style={{
        position: "absolute",
        top: SQUARE_BOTTOM - 52,
        left: 0,
        width: WIDTH,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Lockup size={28} tone="black" />
    </div>
  </AbsoluteFill>
);
