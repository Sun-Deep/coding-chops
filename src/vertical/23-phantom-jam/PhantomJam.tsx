import { Easing, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { Provenance } from "../../shared/vertical/type";
import { clamp } from "../../shared/video/timing";
import { HOLD, PULL, ZOOM, partOf, simAt } from "./beats";
import { CONDITIONS } from "./measurements";
import { RING_M, TAPPER, carAt } from "./physics";
import { RingRoad } from "./RingRoad";
import { HUMAN, HUMAN_PINNED_KMH, SMOOTHED } from "./tracks";

/**
 * The ring, twice. First 22 human drivers: one taps the brakes and the red
 * travels backwards round the ring until a third of it is standing still.
 * Then the same seconds again with one car, the orange one, holding a steady
 * speed and a gap: the same tap, the same first wave, and the wave dies at it.
 *
 * Each run opens close on the car that brakes, so the first thing on screen
 * is a car lighting up its brake lights, and pulls back to the whole ring
 * inside a window under the headline.
 */

export const HEADLINE_TOP = 256;
const LABEL_TOP = 512;
const PROVENANCE_TOP = 548;
export const RING_R = 330;
export const RING_CY = 930;
const WINDOW_TOP = 580;
const WINDOW_BOTTOM = 1296;
const MID = 540;

export const PhantomJam: React.FC = () => {
  const frame = useCurrentFrame();
  const { replay, local } = partOf(frame);
  const t = simAt(frame);
  const track = replay ? SMOOTHED : HUMAN;

  const c = carAt(track, TAPPER, t);
  const theta = (c.x / RING_M) * 2 * Math.PI - Math.PI / 2;
  const carX = MID + RING_R * Math.cos(theta);
  const carY = RING_CY + RING_R * Math.sin(theta);
  const u = interpolate(local, [HOLD, HOLD + PULL], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.45, 0, 0.55, 1),
  });
  const scale = ZOOM + (1 - ZOOM) * u;
  const fx = carX + (MID - carX) * u;
  const fy = carY + (RING_CY - carY) * u;
  const readout = interpolate(u, [0.8, 1], [0, 1], clamp);

  return (
    <>
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <clipPath id="window">
            <rect
              x={0}
              y={WINDOW_TOP}
              width={1080}
              height={WINDOW_BOTTOM - WINDOW_TOP}
            />
          </clipPath>
        </defs>
        <g clipPath="url(#window)">
          <g
            transform={`translate(${MID} ${RING_CY}) scale(${scale}) translate(${-fx} ${-fy})`}
          >
            <RingRoad
              id={replay ? "smooth" : "human"}
              cx={MID}
              cy={RING_CY}
              r={RING_R}
              track={track}
              t={t}
              smoother={replay}
              readout={readout}
              compare={
                replay
                  ? {
                      label: "HUMANS ALONE",
                      kmh: HUMAN_PINNED_KMH,
                      opacity: readout,
                    }
                  : undefined
              }
            />
          </g>
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          top: LABEL_TOP,
          left: 140,
          width: 800,
          textAlign: "center",
          fontFamily: theme.monoFamily,
          fontSize: 24,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: replay ? ACCENT : theme.colors.chalk,
        }}
      >
        {replay ? "Same tap. 1 car keeps a gap" : "22 human drivers"}
      </div>
      <Provenance top={PROVENANCE_TOP}>{CONDITIONS}</Provenance>
    </>
  );
};
