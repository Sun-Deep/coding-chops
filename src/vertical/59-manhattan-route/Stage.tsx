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
import { ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import * as B from "./beats";
import { RUN } from "./measurements";

/**
 * Manhattan at night, rendered in Blender by
 * `scripts/blender/manhattan/render.sh`: A* lights its streets orange,
 * Dijkstra blue, on one shared clock. Over it, the two pins' names, and in
 * the band above the city, both searches' counts, read off the same clock.
 */

const WIDTH = 1080;
const HEIGHT = 1920;
const C = theme.colors;
const BLUE = C.blueBright;
const n = (x: number) => x.toLocaleString("en-US");

/** Per frame, as fractions of the frame: Harlem's pin head (x, y), then
 * Wall Street's. Written by `city.py`. */
type Track = number[][];

const useTrack = () => {
  const [track, setTrack] = useState<Track | null>(null);
  const [handle] = useState(() => delayRender("vr59 track"));
  useEffect(() => {
    fetch(staticFile("vr59/track.json"))
      .then((r) => r.json())
      .then((t: Track) => {
        setTrack(t);
        continueRender(handle);
      });
  }, [handle]);
  return track;
};

/** The counters' top edge, in the band between the headline and the city. */
export const COUNTERS_TOP = 352;

const Counter: React.FC<{
  name: string;
  color: string;
  checked: number;
  done: boolean;
  left: number;
}> = ({ name, color, checked, done, left }) => (
  <div
    style={{
      position: "absolute",
      top: COUNTERS_TOP,
      left,
      width: 420,
      fontFamily: theme.monoFamily,
    }}
  >
    <div
      style={{
        fontSize: 23,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color,
        fontWeight: 700,
      }}
    >
      {name}
    </div>
    <div
      style={{
        fontSize: 64,
        lineHeight: 1.05,
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
        color: C.chalk,
      }}
    >
      {n(checked)}
    </div>
    <div style={{ fontSize: 21, color: done ? color : C.grayLight }}>
      {done ? "reached Wall St" : "intersections checked"}
    </div>
  </div>
);

export const Stage: React.FC<{
  frame: number;
  still?: string;
  /** The cover: counters off, since its headline carries both numbers. */
  cover?: boolean;
}> = ({ frame: f, still, cover = false }) => {
  const track = useTrack();
  const t = track
    ? track[Math.max(0, Math.min(track.length - 1, Math.round(f)))]
    : null;
  const labels = interpolate(f, [B.START, B.START + 10], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: WIDTH,
        height: HEIGHT,
        overflow: "hidden",
      }}
    >
      {still ? (
        <Img src={staticFile(still)} style={{ width: WIDTH, height: HEIGHT }} />
      ) : (
        <OffthreadVideo
          src={staticFile("vr59/city.mp4")}
          muted
          style={{ width: WIDTH, height: HEIGHT }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(rgba(5,5,6,0.96) 0%, rgba(5,5,6,0.92) 24%, rgba(5,5,6,0) 29%, rgba(5,5,6,0) 66%, rgba(5,5,6,0.92) 74%, rgba(5,5,6,1) 100%)",
        }}
      />
      {t &&
        (
          [
            ["HARLEM", t[0], t[1]],
            ["WALL ST", t[2], t[3]],
          ] as const
        ).map(([name, x, y]) => (
          <div
            key={name}
            style={{
              position: "absolute",
              left: x * WIDTH + 26,
              top: y * HEIGHT - 16,
              fontFamily: theme.monoFamily,
              fontSize: 23,
              fontWeight: 700,
              letterSpacing: "0.16em",
              color: C.chalk,
              opacity: labels,
              textShadow: "0 0 8px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </div>
        ))}
      {!cover && (
        <>
          <Counter
            name="A*"
            color={ACCENT}
            checked={B.checkedAt(f, RUN.astar)}
            done={f >= B.ASTAR_DONE}
            left={96}
          />
          <Counter
            name="Dijkstra"
            color={BLUE}
            checked={B.checkedAt(f, RUN.dijkstra)}
            done={f >= B.DIJKSTRA_DONE}
            left={560}
          />
        </>
      )}
    </div>
  );
};
