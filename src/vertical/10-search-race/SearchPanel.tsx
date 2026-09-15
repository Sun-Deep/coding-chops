import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { clamp } from "../../shared/video/timing";
import { ACCENT } from "../../shared/vertical/palette";
import { budgetAt, finishFrame, ROUTE_DRAW } from "./beats";
import { cellsPath, routePoints, staticLayers } from "./draw";
import {
  CELL,
  FIELD_HEIGHT,
  FIELD_TOP,
  FIELD_WIDTH,
  PAD,
  PANEL_HEIGHT,
  PANEL_WIDTH,
} from "./grid";
import { GOAL, START, xOf, yOf } from "./maze";
import { HEIGHT, MAX_EXPANSIONS, WIDTH } from "./measurements";
import type { Search } from "./maze";

/** A corridor nothing has reached yet. */
const CORRIDOR = "#2B323B";
/** Ground that charges nine to cross. Warm, so it is not read as a wall. */
const MUD_FILL = "#4E3C1B";

/**
 * Explored ground, oldest first.
 *
 * The set of cells a search has looked at is not the interesting thing about
 * it. On a maze every one of these except greedy ends up looking at most of the
 * corridors, so a panel that draws explored and unexplored in two colours is a
 * panel that is identical to four others by halfway through. The order is what
 * differs, so the order is what is drawn: each cell keeps the colour of when it
 * was reached, running from cold at the start of the search to the accent at
 * the frontier.
 *
 * That leaves each panel showing the shape of its own search rather than its
 * progress. Breadth-first lays down rings, Dijkstra lays down rings bent around
 * the mud, A* a cone leaning at the exit, depth-first one long ribbon, and
 * bidirectional two ramps that grow toward each other and meet.
 *
 * One hue. The ramp runs neutral to accent, so the accent still marks the place
 * work is happening and nothing else has been given a colour.
 */
const BANDS = 10;
const COLD_EXPLORED = [0x4a, 0x55, 0x62] as const;
const HOT_EXPLORED = [0xff, 0x7a, 0x33] as const;

const bandFill = (i: number) => {
  const t = (i / (BANDS - 1)) ** 1.6;
  const c = COLD_EXPLORED.map((v, k) =>
    Math.round(v + (HOT_EXPLORED[k] - v) * t),
  );
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

const BAND_FILLS = Array.from({ length: BANDS }, (_, i) => bandFill(i));

export const SearchPanel: React.FC<{
  search: Search;
  left: number;
  top: number;
  opacity?: number;
}> = ({ search, left, top, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const { playback } = search;
  const { visitedAt, path, run } = playback;

  const spent = Math.min(run.expansions, budgetAt(frame));
  const finished = frame >= finishFrame(search.key);

  const bands: number[][] = Array.from({ length: BANDS }, () => []);
  for (let i = 0; i < WIDTH * HEIGHT; i++) {
    const at = visitedAt[i];
    if (at < 0 || at >= spent) continue;
    const band = Math.min(
      BANDS - 1,
      Math.floor(((at + 1) / Math.max(1, spent)) * BANDS),
    );
    bands[band].push(i);
  }

  const layers = staticLayers(CELL);
  const reveal = finished
    ? interpolate(
        frame,
        [finishFrame(search.key), finishFrame(search.key) + ROUTE_DRAW],
        [0, 1],
        clamp,
      )
    : 0;
  const routeLength = path.length * CELL;

  const dot = (c: number) => ({
    cx: xOf(c) * CELL + CELL / 2,
    cy: yOf(c) * CELL + CELL / 2,
  });

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
        opacity,
        overflow: "hidden",
        borderRadius: 16,
        border: "1px solid rgba(255, 255, 255, 0.12)",
        background: "linear-gradient(150deg, #12161B 0%, #090B0E 100%)",
        boxShadow: "0 14px 30px #0000004A",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: PAD + 2,
          top: 13,
          fontFamily: theme.monoFamily,
          fontSize: 22,
          fontWeight: 700,
          color: theme.colors.chalk,
        }}
      >
        {search.name}
      </div>
      <div
        style={{
          position: "absolute",
          right: PAD + 2,
          top: 17,
          fontFamily: theme.monoFamily,
          fontSize: 16,
          fontWeight: 500,
          color: theme.colors.grayDark,
        }}
      >
        {search.note}
      </div>

      <svg
        width={PANEL_WIDTH}
        height={PANEL_HEIGHT}
        viewBox={`0 0 ${PANEL_WIDTH} ${PANEL_HEIGHT}`}
        style={{ position: "absolute", inset: 0 }}
        aria-label={`${search.name} search, ${spent} cells expanded`}
      >
        <g transform={`translate(${PAD} ${FIELD_TOP})`}>
          <rect
            x={0}
            y={0}
            width={FIELD_WIDTH}
            height={FIELD_HEIGHT}
            fill={CORRIDOR}
          />
          <path d={layers.walls} fill="#07080A" />
          <path d={layers.mud} fill={MUD_FILL} />
          {bands.map((cells, i) =>
            cells.length ? (
              <path
                key={i}
                d={cellsPath(cells, CELL, 0.4)}
                fill={BAND_FILLS[i]}
              />
            ) : null,
          )}
          {reveal > 0 ? (
            <polyline
              points={routePoints(path, CELL)}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={2.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={routeLength}
              strokeDashoffset={routeLength * (1 - reveal)}
            />
          ) : null}
          <circle {...dot(START)} r={CELL * 0.62} fill={theme.colors.chalk} />
          <circle
            {...dot(GOAL)}
            r={CELL * 0.62}
            fill={finished ? theme.colors.chalk : "none"}
            stroke={theme.colors.chalk}
            strokeWidth={1.4}
          />
        </g>
      </svg>

      <div
        style={{
          position: "absolute",
          left: PAD + 2,
          bottom: 14,
          fontFamily: theme.monoFamily,
          fontSize: 21,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          color: finished ? ACCENT : theme.colors.chalk,
        }}
      >
        {spent}
        <span
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: theme.colors.grayDark,
            marginLeft: 5,
          }}
        >
          cells
        </span>
      </div>

      {finished ? (
        <div
          style={{
            position: "absolute",
            right: PAD + 2,
            bottom: 16,
            fontFamily: theme.monoFamily,
            fontSize: 19,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            color: theme.colors.chalk,
          }}
        >
          cost {run.cost.toLocaleString()}
        </div>
      ) : null}

      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: PANEL_WIDTH,
          height: 6,
          background: "#1C2128",
        }}
      >
        <div
          style={{
            width: (spent / MAX_EXPANSIONS) * PANEL_WIDTH,
            height: 6,
            background: ACCENT,
          }}
        />
      </div>
    </div>
  );
};
