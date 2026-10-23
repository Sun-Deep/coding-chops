import { useEffect, useState } from "react";
import {
  Img,
  OffthreadVideo,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
} from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT, ON_ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import { ARRIVE, DIVE, HOLD, OFF, OOM, PULL, TAKEOVER, UNPACK } from "./beats";
import { OFFLINE } from "./facts";

/**
 * The servers, rendered in Blender by `scripts/blender/php/render.sh`, with
 * labels riding on what they name: the government sites switched off, the
 * request, the half-built part, the attacker's code and the site's own
 * code. Orange is the attacker's code.
 */

export const SCENE_TOP = 706;
export const SCENE_H = 566;
const WIDTH = 1080;
const VIDEO_H = (850 / 1620) * WIDTH;
const CROP = (VIDEO_H - SCENE_H) / 2;
const C = theme.colors;

type Point = [number, number, number];

const useTrack = () => {
  const [track, setTrack] = useState<Point[][] | null>(null);
  const [handle] = useState(() => delayRender("vr46 track"));
  useEffect(() => {
    fetch(staticFile("vr46/track.json"))
      .then((r) => r.json())
      .then((t: Point[][]) => {
        setTrack(t);
        continueRender(handle);
      });
  }, [handle]);
  return track;
};

const Tag: React.FC<{
  at: Point;
  opacity: number;
  accent?: boolean;
  outline?: boolean;
  children: React.ReactNode;
}> = ({ at, opacity, accent, outline, children }) => {
  if (at[2] !== 1 || opacity <= 0) return null;
  const x = at[0] * WIDTH;
  const y = at[1] * VIDEO_H - CROP;
  if (y - 50 < 8 || y > SCENE_H) return null;
  // Clear of the like and share buttons below y 1000.
  const below = SCENE_TOP + y > 1000;
  const half = 170;
  const left = Math.max(
    24,
    Math.min(x - half, (below ? 920 : 1056) - 2 * half),
  );
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: y - 50,
        width: 2 * half,
        textAlign: "center",
        opacity,
      }}
    >
      <span
        style={{
          display: "inline-block",
          padding: "4px 12px",
          borderRadius: 7,
          background: outline
            ? "rgba(10,11,13,0.88)"
            : accent
              ? ACCENT
              : C.chalk,
          border: outline ? `2px solid ${C.chalk}` : "none",
          color: outline ? C.chalk : ON_ACCENT,
          fontFamily: theme.monoFamily,
          fontSize: 21,
          fontWeight: 700,
          whiteSpace: "nowrap",
          boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
        }}
      >
        {children}
      </span>
    </div>
  );
};

export const Stage: React.FC<{ frame: number; still?: string }> = ({
  frame,
  still,
}) => {
  const track = useTrack();
  const f = Math.max(0, Math.min(449, Math.round(frame)));
  const row = track ? track[f] : null;
  const window = (a: number, b: number) =>
    interpolate(frame, [a, a + 6, b - 6, b], [0, 1, 1, 0], clamp);
  return (
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
        <Img
          src={staticFile(still)}
          style={{
            position: "absolute",
            top: -CROP,
            width: WIDTH,
            height: VIDEO_H,
          }}
        />
      ) : (
        <OffthreadVideo
          src={staticFile("vr46/server.mp4")}
          muted
          style={{
            position: "absolute",
            top: -CROP,
            width: WIDTH,
            height: VIDEO_H,
          }}
        />
      )}
      {row ? (
        <>
          {OFFLINE.map((o, k) => (
            <Tag
              key={o.country}
              at={row[4 + k]}
              opacity={window(OFF + 12 * k, DIVE + 8)}
              outline
            >
              {o.country} · offline
            </Tag>
          ))}
          <Tag at={row[0]} opacity={window(ARRIVE + 10, UNPACK + 16)}>
            1 upload request · no login
          </Tag>
          <Tag at={row[1]} opacity={window(OOM, TAKEOVER + 2)} outline>
            {frame < HOLD ? "out of memory: half built" : "cleanup trusts it"}
          </Tag>
          <Tag at={row[3]} opacity={window(TAKEOVER + 22, PULL + 4)} accent>
            attacker&apos;s code
          </Tag>
          <Tag at={row[2]} opacity={window(TAKEOVER + 28, PULL + 4)} outline>
            site&apos;s code: never ran
          </Tag>
        </>
      ) : null}
    </div>
  );
};
