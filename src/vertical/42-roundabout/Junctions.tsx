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
import { HEROES } from "./hero";
import { CONDITIONS } from "./measurements";
import type { Rule } from "./simulation";

/**
 * The same crossroads twice, edge to edge, one above the other, rendered
 * in Blender from the model by `scripts/blender/roundabout/render.sh`:
 * traffic lights above, a roundabout below, the same cars arriving at the
 * same seconds. No panel frames: two views of one town.
 *
 * Orange is one thing: you. Your car, the tag over it, and the seconds
 * you have stood still.
 */

export const HEADLINE_TOP = 232;
const PROVENANCE_TOP = 404;
export const SCENES: { rule: Rule; label: string; top: number }[] = [
  { rule: "lights", label: "Traffic lights", top: 436 },
  { rule: "roundabout", label: "Roundabout", top: 868 },
];
export const SCENE_H = 432;
const WIDTH = 1080;
/** Renders are 1620 x 675; at full width they are 450 tall. */
const VIDEO_H = 450;
const CROP = (VIDEO_H - SCENE_H) / 2;

type Track = [number, number, number][];

const useTrack = (rule: Rule) => {
  const [track, setTrack] = useState<Track | null>(null);
  const [handle] = useState(() => delayRender(`track ${rule}`));
  useEffect(() => {
    fetch(staticFile(`vr42/track-${rule}.json`))
      .then((r) => r.json())
      .then((t: Track) => {
        setTrack(t);
        continueRender(handle);
      });
  }, [handle, rule]);
  return track;
};

const Tag: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div
    style={{
      position: "absolute",
      left: x - 40,
      top: y - 58,
      width: 80,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
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
        boxShadow: "0 2px 8px rgba(0,0,0,0.45)",
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

const Chip: React.FC<{ children: React.ReactNode; right?: boolean }> = ({
  children,
  right,
}) => (
  <div
    style={{
      position: "absolute",
      top: 14,
      ...(right ? { right: 150 + 14 } : { left: 96 - 40 }),
      padding: "6px 14px",
      borderRadius: 8,
      background: "rgba(11,12,15,0.84)",
      fontFamily: theme.monoFamily,
      color: theme.colors.chalk,
      whiteSpace: "nowrap",
      display: "flex",
      alignItems: "baseline",
      gap: 10,
    }}
  >
    {children}
  </div>
);

const Scene: React.FC<{
  rule: Rule;
  label: string;
  top: number;
  frame: number;
  still?: number;
}> = ({ rule, label, top, frame, still }) => {
  const track = useTrack(rule);
  const f = Math.max(0, Math.min(419, Math.round(frame)));
  const hero = HEROES[rule];
  const t = track ? track[f] : null;
  const tagIn = interpolate(frame, [4, 14], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        width: WIDTH,
        height: SCENE_H,
        overflow: "hidden",
        background: theme.colors.black,
      }}
    >
      {still === undefined ? (
        <OffthreadVideo
          src={staticFile(`vr42/${rule}.mp4`)}
          muted
          style={{
            position: "absolute",
            top: -CROP,
            width: WIDTH,
            height: VIDEO_H,
          }}
        />
      ) : (
        <Img
          src={staticFile(`vr42/${rule}-${String(still).padStart(4, "0")}.png`)}
          style={{
            position: "absolute",
            top: -CROP,
            width: WIDTH,
            height: VIDEO_H,
          }}
        />
      )}
      {t &&
      t[2] === 1 &&
      t[0] > 0.03 &&
      // Clear of the like and share buttons below y 1000.
      t[0] * WIDTH < (top + t[1] * VIDEO_H - CROP > 1000 ? 890 : 1040) ? (
        <div style={{ opacity: tagIn }}>
          <Tag x={t[0] * WIDTH} y={t[1] * VIDEO_H - CROP} />
        </div>
      ) : null}
      <Chip>
        <span
          style={{
            fontSize: 23,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </Chip>
      <Chip right>
        <span
          style={{
            fontSize: 18,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: theme.colors.grayDark,
          }}
        >
          you stood still
        </span>
        <span
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: ACCENT,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {hero.still[f].toFixed(1)} s
        </span>
      </Chip>
    </div>
  );
};

/** `still` holds every part of the scene at one frame, for the cover. */
export const Junctions: React.FC<{ still?: number }> = ({ still }) => {
  const current = useCurrentFrame();
  const frame = still ?? current;
  return (
    <>
      {SCENES.map((s) => (
        <Scene key={s.rule} {...s} frame={frame} still={still} />
      ))}
      {/* Where one view ends and the other begins. */}
      <div
        style={{
          position: "absolute",
          top: SCENES[1].top - 2,
          left: 0,
          width: WIDTH,
          height: 4,
          background: theme.colors.black,
        }}
      />
      <Provenance top={PROVENANCE_TOP}>{CONDITIONS}</Provenance>
    </>
  );
};
