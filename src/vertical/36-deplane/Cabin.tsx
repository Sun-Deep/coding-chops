import { useEffect, useState } from "react";
import {
  Img,
  OffthreadVideo,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT, ON_ACCENT } from "../../shared/vertical/palette";
import { Provenance } from "../../shared/vertical/type";
import { clamp } from "../../shared/video/timing";
import { SIGN, simAt } from "./beats";
import { CONDITIONS, HERO } from "./measurements";
import type { Rule } from "./simulation";

/**
 * Two cabins of the same flight at the gate, one above the other, rendered
 * in Blender from the model's timeline by `scripts/blender/deplane/render.sh`:
 * a cutaway airliner at dusk whose roof lifts away, 72 passengers, the same
 * people with the same bags in both. Above, everyone stands when the
 * seatbelt sign goes off. Below, everyone stays seated until the row in
 * front has gone.
 *
 * Orange is one thing: you. Your shirt, the label over your head, and your
 * clock.
 */

export const HEADLINE_TOP = 232;
const PROVENANCE_TOP = 424;
const LEFT = 150;
const W = 780;
const H = 380;
const PANELS: { rule: Rule; label: string; top: number }[] = [
  { rule: "stand", label: "Stand right away", top: 494 },
  { rule: "sit", label: "Stay seated", top: 920 },
];
const LABEL_GAP = 34;

type Track = [number, number, number][];

/** Your head's place on screen each frame, written by the Blender pass. */
const useTrack = (rule: Rule) => {
  const [track, setTrack] = useState<Track | null>(null);
  const [handle] = useState(() => delayRender(`track ${rule}`));
  useEffect(() => {
    fetch(staticFile(`vr36/track-${rule}.json`))
      .then((r) => r.json())
      .then((t: Track) => {
        setTrack(t);
        continueRender(handle);
      });
  }, [handle, rule]);
  return track;
};

const mmss = (s: number) => {
  const r = Math.max(0, Math.floor(s));
  return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, "0")}`;
};

/** What you are doing, and the clock that goes with it, from the model. */
const yourClock = (rule: Rule, t: number) => {
  const h = HERO[rule];
  if (t < 0) return { word: "seatbelt sign on", clock: null };
  if (t >= h.off) return { word: "off the plane at", clock: h.off };
  if (t >= h.up) return { word: "on your feet", clock: t - h.up };
  return { word: "seated", clock: t };
};

const Panel: React.FC<{
  rule: Rule;
  label: string;
  top: number;
  frame: number;
  /** Set for a still: the video frame to hold. */
  still?: number;
}> = ({ rule, label, top, frame, still }) => {
  const track = useTrack(rule);
  const t = simAt(frame);
  const now = yourClock(rule, t);
  const at = track
    ? track[Math.max(0, Math.min(track.length - 1, frame))]
    : null;
  const showYou = at && at[2] === 1 && frame >= 30;
  const youX = at ? at[0] * W : 0;
  const youY = at ? at[1] * H : 0;
  const youIn = interpolate(frame, [30, 44], [0, 1], clamp);
  return (
    <>
      <div
        style={{
          position: "absolute",
          top,
          left: LEFT,
          width: W,
          height: H,
          borderRadius: 14,
          overflow: "hidden",
          background: theme.colors.black,
          boxShadow: "0 0 0 1px #2A2B30",
        }}
      >
        {still === undefined ? (
          <OffthreadVideo
            src={staticFile(`vr36/${rule}.mp4`)}
            muted
            style={{ width: W, height: H }}
          />
        ) : (
          <Img
            src={staticFile(
              `vr36/${rule}-${String(still).padStart(4, "0")}.png`,
            )}
            style={{ width: W, height: H }}
          />
        )}
        {showYou ? (
          <div
            style={{
              position: "absolute",
              left: youX - 40,
              top: youY - 54,
              width: 80,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              opacity: youIn,
            }}
          >
            <div
              style={{
                padding: "3px 10px",
                borderRadius: 6,
                background: ACCENT,
                color: ON_ACCENT,
                fontFamily: theme.monoFamily,
                fontSize: 21,
                fontWeight: 800,
                letterSpacing: "0.1em",
                boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
              }}
            >
              YOU
            </div>
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderTop: `10px solid ${ACCENT}`,
              }}
            />
          </div>
        ) : null}
      </div>
      <div
        style={{
          position: "absolute",
          top: top - LABEL_GAP,
          left: LEFT,
          width: W,
          height: 30,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          color: theme.colors.chalk,
        }}
      >
        <div
          style={{
            fontFamily: theme.monoFamily,
            fontSize: 23,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            paddingBottom: 2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: theme.monoFamily,
            fontSize: 19,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: theme.colors.grayDark,
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}
        >
          {now.word}{" "}
          {now.clock !== null ? (
            <span style={{ fontSize: 34, fontWeight: 700, color: ACCENT }}>
              {mmss(now.clock ?? 0)}
            </span>
          ) : null}
        </div>
      </div>
    </>
  );
};

/** The seatbelt sign going off: a chime, and the sign itself for a moment. */
const SignOff: React.FC<{ frame: number }> = ({ frame }) => {
  const o = interpolate(
    frame,
    [SIGN - 4, SIGN, SIGN + 34, SIGN + 42],
    [0, 1, 1, 0],
    clamp,
  );
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 880 - 16,
        left: 0,
        width: 1080,
        display: "flex",
        justifyContent: "center",
        opacity: o,
        transform: `scale(${0.94 + 0.06 * o})`,
      }}
    >
      <div
        style={{
          padding: "6px 16px",
          borderRadius: 8,
          background: "#0B0C0F",
          border: "1px solid #3A3B40",
          fontFamily: theme.monoFamily,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: theme.colors.chalk,
        }}
      >
        SEATBELT SIGN OFF
      </div>
    </div>
  );
};

/** `still` holds every part of the scene at one frame, for the cover. */
export const Cabin: React.FC<{ still?: number }> = ({ still }) => {
  const current = useCurrentFrame();
  const frame = still ?? current;
  return (
    <>
      <Provenance top={PROVENANCE_TOP}>{CONDITIONS}</Provenance>
      {PANELS.map((p) => (
        <Panel key={p.rule} {...p} frame={frame} still={still} />
      ))}
      <SignOff frame={frame} />
    </>
  );
};
