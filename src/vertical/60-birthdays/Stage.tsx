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
 * The classrooms, rendered in Blender by `scripts/blender/birthdays/render.sh`.
 * Over them, each student's birthday above their head until the camera
 * rises, the two that match in orange, and one counter: pairs while the
 * strings are drawn, then rooms with a shared birthday.
 */

const WIDTH = 1080;
const HEIGHT = 1920;
const C = theme.colors;
const n = (x: number) => x.toLocaleString("en-US");

/** Per frame: 23 (x, y) pairs, each student's tag point as fractions of the
 * frame, y from the top. Written by `classes.py`. */
type Track = number[][];

const useTrack = () => {
  const [track, setTrack] = useState<Track | null>(null);
  const [handle] = useState(() => delayRender("vr60 track"));
  useEffect(() => {
    fetch(staticFile("vr60/track.json"))
      .then((r) => r.json())
      .then((t: Track) => {
        setTrack(t);
        continueRender(handle);
      });
  }, [handle]);
  return track;
};

export const COUNTER_TOP = 352;

export const Stage: React.FC<{
  frame: number;
  still?: string;
  /** The cover: no counter, its headline carries the number. */
  cover?: boolean;
}> = ({ frame: f, still, cover = false }) => {
  const track = useTrack();
  const t = track
    ? track[Math.max(0, Math.min(track.length - 1, Math.round(f)))]
    : null;
  const tags =
    interpolate(f, [B.START, B.START + 10], [0, 1], clamp) *
    interpolate(f, [B.TAGS_OUT - 8, B.TAGS_OUT], [1, 0], clamp);
  const match = interpolate(f, [B.MATCH, B.MATCH + 8], [0, 1], clamp);
  // One counter out, then the other in, so the numbers never overlap.
  const pairsShown = interpolate(f, [B.RISE, B.RISE + 6], [1, 0], clamp);
  const rooms = interpolate(f, [B.RISE + 8, B.RISE + 16], [0, 1], clamp);
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
          src={staticFile("vr60/classes.mp4")}
          muted
          style={{ width: WIDTH, height: HEIGHT }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(rgba(5,5,6,0.96) 0%, rgba(5,5,6,0.9) 22%, rgba(5,5,6,0) 28%, rgba(5,5,6,0) 68%, rgba(5,5,6,0.92) 75%, rgba(5,5,6,1) 100%)",
        }}
      />
      {t &&
        RUN.birthdays.map((day, i) => {
          const pair = (RUN.heroPair as readonly number[]).includes(i);
          const big = pair ? match : 0;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: t[2 * i] * WIDTH,
                top: t[2 * i + 1] * HEIGHT,
                transform: `translate(-50%, -100%) scale(${1 + 0.7 * big})`,
                transformOrigin: "50% 100%",
                padding: "2px 7px",
                borderRadius: 5,
                background: "rgba(5,5,6,0.78)",
                fontFamily: theme.monoFamily,
                fontSize: 19,
                fontWeight: 700,
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                color: pair && match > 0.5 ? ACCENT : C.chalk,
                opacity: tags * (pair ? 1 : 1 - 0.45 * match),
                zIndex: pair ? 2 : 1,
              }}
            >
              {day}
            </div>
          );
        })}
      {!cover && (
        <div
          style={{
            position: "absolute",
            top: COUNTER_TOP,
            left: 96,
            fontFamily: theme.monoFamily,
          }}
        >
          {[
            {
              label: "pairs of students",
              value: n(B.pairsAt(f)),
              of: `of ${RUN.pairs}`,
              show: pairsShown,
            },
            {
              label: "rooms with a shared birthday",
              value: n(B.roomsLitAt(f)),
              of: "of 100",
              show: rooms,
            },
          ].map((c) => (
            <div
              key={c.label}
              style={{ position: "absolute", top: 0, left: 0, opacity: c.show }}
            >
              <div
                style={{
                  fontSize: 23,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: C.grayLight,
                  whiteSpace: "nowrap",
                }}
              >
                {c.label}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 14,
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    fontSize: 64,
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                    color: C.chalk,
                  }}
                >
                  {c.value}
                </span>
                <span style={{ fontSize: 26, color: C.grayLight }}>{c.of}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
