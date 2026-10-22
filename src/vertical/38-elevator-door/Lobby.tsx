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
import { frameAt, simAt } from "./beats";
import { CONDITIONS, HERO } from "./measurements";
import { PEOPLE, RUNS } from "./runs";
import type { Rule } from "./simulation";

/**
 * Two lobbies on the same morning, one above the other, rendered in Blender
 * from the model's timeline by `scripts/blender/elevator/render.sh`: an
 * office lobby, one lift, the same people coming in at the same seconds.
 * Above, the people inside hold the doors for anyone they can see coming.
 * Below, nobody does.
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
  { rule: "hold", label: "Hold it for anyone running", top: 494 },
  { rule: "close", label: "Let it close", top: 920 },
];
const LABEL_GAP = 34;

/** Each time the doors on top were held: from about to close to shut. */
const HELD = RUNS.hold.trips
  .filter((t) => t.holds.length > 0)
  .map((t) => ({ from: t.shut, to: t.close }));

type Track = [number, number, number, number, number][];

/** Your head's place on screen each frame, and the floor display's. */
const useTrack = (rule: Rule) => {
  const [track, setTrack] = useState<Track | null>(null);
  const [handle] = useState(() => delayRender(`track ${rule}`));
  useEffect(() => {
    fetch(staticFile(`vr38/track-${rule}.json`))
      .then((r) => r.json())
      .then((t: Track) => {
        setTrack(t);
        continueRender(handle);
      });
  }, [handle, rule]);
  return track;
};

/** Frames the YOU tag takes to move from your head to the floor display. */
const GLIDE = 8;

/**
 * Where the YOU tag sits: over your head, then on the floor display once
 * your car is shut, gliding between the two.
 */
const tagAt = (track: Track, frame: number) => {
  const f = Math.max(0, Math.min(track.length - 1, Math.round(frame)));
  const head = (k: number) => ({ x: track[k][0] * W, y: track[k][1] * H });
  const sign = (k: number) => ({
    x: track[k][3] * W + 62,
    y: track[k][4] * H + 16,
  });
  if (track[f][2] === 1) return head(f);
  let shut = f;
  while (shut > 0 && track[shut - 1][2] === 0) shut--;
  const to = sign(f);
  if (shut === 0 || f - shut >= GLIDE) return to;
  const from = head(shut - 1);
  const u = (f - shut) / GLIDE;
  const e = u * u * (3 - 2 * u);
  return { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e };
};

const mmss = (s: number) => {
  const r = Math.max(0, Math.floor(s));
  return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, "0")}`;
};

/** What you are doing, and the clock that goes with it, from the model. */
const yourClock = (rule: Rule, t: number) => {
  const at = PEOPLE[HERO.id].at;
  const out = HERO[rule].out;
  if (t < at) return { word: "walking in", clock: null };
  if (t >= out)
    return { word: `at floor ${PEOPLE[HERO.id].to} in`, clock: out - at };
  return { word: "your trip", clock: t - at };
};

const Tag: React.FC<{ x: number; y: number; opacity: number }> = ({
  x,
  y,
  opacity,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - 40,
      top: y - 54,
      width: 80,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      opacity,
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
);

/** How long the doors on top have been held open, while they are. */
const HeldChip: React.FC<{ t: number }> = ({ t }) => {
  const held = HELD.find((h) => t >= h.from && t <= h.to + 3);
  if (!held) return null;
  const o = interpolate(t, [held.to - 0.01, held.to + 3], [1, 0], clamp);
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 16,
        top: 14,
        padding: "5px 12px",
        borderRadius: 8,
        background: "rgba(11,12,15,0.82)",
        border: "1px solid #3A3B40",
        fontFamily: theme.monoFamily,
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: "0.1em",
        color: theme.colors.chalk,
        fontVariantNumeric: "tabular-nums",
        opacity: o,
      }}
    >
      DOORS HELD{" "}
      <span style={{ fontSize: 26 }}>
        {mmss(Math.min(t, held.to) - held.from)}
      </span>
    </div>
  );
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
  const tag = track ? tagAt(track, frame) : null;
  const out = frameAt(HERO[rule].out);
  const tagIn = interpolate(frame, [6, 20], [0, 1], clamp);
  const tagOut = interpolate(frame, [out - 2, out + 6], [1, 0], clamp);
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
            src={staticFile(`vr38/${rule}.mp4`)}
            muted
            style={{ width: W, height: H }}
          />
        ) : (
          <Img
            src={staticFile(
              `vr38/${rule}-${String(still).padStart(4, "0")}.png`,
            )}
            style={{ width: W, height: H }}
          />
        )}
        {rule === "hold" ? <HeldChip t={t} /> : null}
        {tag ? <Tag x={tag.x} y={tag.y} opacity={tagIn * tagOut} /> : null}
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
              {mmss(now.clock)}
            </span>
          ) : null}
        </div>
      </div>
    </>
  );
};

/** `still` holds every part of the scene at one frame, for the cover. */
export const Lobby: React.FC<{ still?: number }> = ({ still }) => {
  const current = useCurrentFrame();
  const frame = still ?? current;
  return (
    <>
      <Provenance top={PROVENANCE_TOP}>{CONDITIONS}</Provenance>
      {PANELS.map((p) => (
        <Panel key={p.rule} {...p} frame={frame} still={still} />
      ))}
    </>
  );
};
