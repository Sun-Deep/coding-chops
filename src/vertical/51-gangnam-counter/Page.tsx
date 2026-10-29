import { Img, OffthreadVideo, interpolate, staticFile } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import * as B from "./beats";
import { LONG_READS_AT, WRAPS_AT, fmt, views } from "./count";

/**
 * The video's page, the way everyone has seen it: the player, the title
 * and the view count, which is the hero of the reel. The player shows a
 * dancer rendered in Blender by `scripts/blender/gangnam/render.sh`, not
 * footage from the music video. No platform logo: the title and the
 * count say what it is.
 */

export const PLAYER_TOP = 420;
export const PLAYER_H = 500;
export const VIEWS_TOP = 984;
const LEFT = 96;
const WIDTH = 888;
const C = theme.colors;

export const Page: React.FC<{ frame: number; still?: string }> = ({
  frame: f,
  still,
}) => {
  const negative = f >= WRAPS_AT && f < LONG_READS_AT;
  const played = interpolate(f, [0, B.DURATION], [0.18, 0.31], clamp);
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: PLAYER_TOP,
          left: LEFT,
          width: WIDTH,
          height: PLAYER_H,
          borderRadius: 16,
          overflow: "hidden",
          background: C.black,
        }}
      >
        {still ? (
          <Img
            src={staticFile(still)}
            style={{ width: WIDTH, height: PLAYER_H, objectFit: "cover" }}
          />
        ) : (
          <OffthreadVideo
            src={staticFile("vr51/dancer.mp4")}
            muted
            style={{ width: WIDTH, height: PLAYER_H, objectFit: "cover" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 5,
            background: "rgba(255,255,255,0.28)",
          }}
        >
          <div
            style={{
              width: `${played * 100}%`,
              height: "100%",
              background: C.chalk,
            }}
          />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: PLAYER_TOP + PLAYER_H + 16,
          left: LEFT,
          width: WIDTH,
          fontFamily: theme.fontFamily,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: C.chalk,
          whiteSpace: "nowrap",
        }}
      >
        PSY - GANGNAM STYLE (강남스타일) M/V
      </div>
      <div
        style={{
          position: "absolute",
          top: VIEWS_TOP,
          left: LEFT,
          fontFamily: theme.monoFamily,
          fontSize: 60,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
          color: negative ? ACCENT : C.chalk,
          whiteSpace: "nowrap",
        }}
      >
        {fmt(views(f))} views
      </div>
    </>
  );
};
