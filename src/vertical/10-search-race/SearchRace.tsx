import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { clamp } from "../../shared/video/timing";
import { LEFT, RIGHT } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline } from "../../shared/vertical/type";
import {
  CHEAP_WALK_FROM,
  CHEAP_WALK_TO,
  STEPS_WALK_FROM,
  STEPS_WALK_TO,
  VERDICT_FROM,
  walkedAt,
} from "./beats";
import { routePoints, staticLayers } from "./draw";
import {
  BIG_CELL,
  BIG_HEIGHT,
  BIG_LEFT,
  BIG_TOP,
  BIG_WIDTH,
  panelAt,
} from "./grid";
import { byKey, GOAL, MUD, START, xOf, yOf } from "./maze";
import { MUD_COST, RUNS } from "./measurements";
import { CELLS } from "./maze";
import { cellsPath } from "./draw";
import { SearchPanel } from "./SearchPanel";
import { SEARCHES } from "./maze";

const Meta: React.FC<{ children: React.ReactNode; opacity: number }> = ({
  children,
  opacity,
}) => (
  <div
    style={{
      position: "absolute",
      top: 368,
      left: LEFT,
      width: RIGHT - LEFT,
      opacity,
      textAlign: "center",
      fontFamily: theme.monoFamily,
      fontSize: 17,
      fontWeight: 600,
      letterSpacing: "0.15em",
      color: theme.colors.grayDark,
    }}
  >
    {children}
  </div>
);

/**
 * The two routes, laid over one map.
 *
 * This is the whole cut and it is why the verdict does not simply keep two of
 * the six panels the way the sorting cut did. The claim is not that one search
 * is faster, it is that two of them are answering different questions, and the
 * only way to see that is to put both answers on the same map and watch them
 * come apart at the mud and rejoin at the exit.
 *
 * One accent still means one thing. The cheapest route wears it because that is
 * the thing being looked for; the route with the fewest steps is drawn in the
 * neutral the rest of the format uses for everything that is merely true.
 */
/** Mud the walker has already paid for. The same ground, lit. */
const MUD_PAID = "#C8913C";

type Walk = {
  readonly path: Int32Array;
  readonly at: number;
  readonly steps: number;
  readonly stroke: string;
  readonly width: number;
};

const Verdict: React.FC<{ walks: readonly Walk[] }> = ({ walks }) => {
  const layers = staticLayers(BIG_CELL);

  const dot = (c: number) => ({
    cx: xOf(c) * BIG_CELL + BIG_CELL / 2,
    cy: yOf(c) * BIG_CELL + BIG_CELL / 2,
  });

  const paidMud: number[] = [];
  for (const walk of walks) {
    for (let i = 1; i <= walk.at; i++) {
      if (CELLS[walk.path[i]] === MUD) paidMud.push(walk.path[i]);
    }
  }

  return (
    <svg
      width={BIG_WIDTH}
      height={BIG_HEIGHT}
      viewBox={`0 0 ${BIG_WIDTH} ${BIG_HEIGHT}`}
      style={{ position: "absolute", left: BIG_LEFT, top: BIG_TOP }}
      aria-label="the two routes walked over one map"
    >
      <rect x={0} y={0} width={BIG_WIDTH} height={BIG_HEIGHT} fill="#2B323B" />
      <path d={layers.walls} fill="#07080A" />
      <path d={layers.mud} fill="#4E3C1B" />
      <path d={cellsPath(paidMud, BIG_CELL, 0.5)} fill={MUD_PAID} />
      {walks.map((walk) =>
        walk.at <= 0 ? null : (
          <g key={walk.stroke}>
            <polyline
              points={routePoints(walk.path, BIG_CELL)}
              fill="none"
              stroke={walk.stroke}
              strokeWidth={walk.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={walk.path.length * BIG_CELL}
              strokeDashoffset={
                walk.path.length * BIG_CELL * (1 - walk.at / walk.steps)
              }
            />
            <circle
              {...dot(walk.path[Math.min(walk.path.length - 1, walk.at)])}
              r={BIG_CELL * 0.46}
              fill={walk.stroke}
            />
          </g>
        ),
      )}
      <circle {...dot(START)} r={BIG_CELL * 0.6} fill={theme.colors.chalk} />
      <circle {...dot(GOAL)} r={BIG_CELL * 0.6} fill={ACCENT} />
    </svg>
  );
};

const Legend: React.FC<{
  rows: readonly {
    colour: string;
    label: string;
    steps: number;
    mud: number;
    cost: number;
    shown: boolean;
  }[];
}> = ({ rows }) => (
  <>
    {rows.map((row, i) => (
      <div
        key={row.label}
        style={{
          position: "absolute",
          top: BIG_TOP + BIG_HEIGHT + 34 + i * 50,
          left: BIG_LEFT,
          width: BIG_WIDTH,
          opacity: row.shown ? 1 : 0.2,
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: theme.monoFamily,
          fontSize: 25,
          fontWeight: 700,
          color: theme.colors.chalk,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span
          style={{
            width: 40,
            height: 6,
            borderRadius: 3,
            background: row.colour,
            flex: "none",
          }}
        />
        <span style={{ flex: 1, fontWeight: 500, fontSize: 22 }}>
          {row.label}
        </span>
        <span style={{ color: theme.colors.grayDark, fontSize: 20 }}>
          {row.steps} steps
        </span>
        <span
          style={{
            color: MUD_PAID,
            fontSize: 20,
            width: 132,
            textAlign: "right",
          }}
        >
          {row.mud} in mud
        </span>
        <span style={{ color: row.colour, width: 140, textAlign: "right" }}>
          cost {row.cost}
        </span>
      </div>
    ))}
  </>
);

/**
 * Six searches on one clock, then the two answers on one map.
 *
 * Every panel is handed the same number of cells to expand per frame, so
 * nothing on screen is choreographed: greedy runs out of work at three and a
 * half seconds because it expands 99 cells, and the other five finish in a
 * flurry at the end because on a maze they all end up looking at most of it.
 *
 * The finish is not the point and the cut does not pretend otherwise. What each
 * search brings back is the point, which is why every panel draws its route the
 * moment it arrives and why the last three seconds put two of those routes on
 * the same map.
 */
export const SearchRace: React.FC = () => {
  const frame = useCurrentFrame();
  const verdict = interpolate(
    frame,
    [VERDICT_FROM, VERDICT_FROM + 14],
    [0, 1],
    clamp,
  );
  const trace = (
    key: "bfs" | "dijkstra",
    from: number,
    to: number,
    stroke: string,
    width: number,
  ) => {
    const { path, prefixCost, prefixMud } = byKey(key).playback;
    const steps = path.length - 1;
    const at = Math.round(walkedAt(frame, steps, from, to));
    return {
      walk: { path, at, steps, stroke, width },
      row: {
        colour: stroke,
        label: key === "bfs" ? "Fewest steps" : "Cheapest",
        steps: RUNS[key].steps,
        mud: prefixMud[at],
        cost: prefixCost[at],
        shown: frame >= from,
      },
    };
  };

  const steps = trace("bfs", STEPS_WALK_FROM, STEPS_WALK_TO, "#FFFFFF", 5);
  const cheap = trace("dijkstra", CHEAP_WALK_FROM, CHEAP_WALK_TO, ACCENT, 6);

  return (
    <>
      <Eyebrow top={244}>Pathfinding</Eyebrow>
      <Headline top={286} size={62}>
        Six searches. One maze.
      </Headline>

      <Meta opacity={1 - verdict}>
        SAME MAZE · MUD COSTS {MUD_COST} · ONE SHARED CLOCK
      </Meta>
      <Meta opacity={verdict}>
        THE SHORTEST WAY OUT IS NOT{" "}
        <span style={{ color: ACCENT }}>THE CHEAPEST</span>
      </Meta>

      <div style={{ opacity: 1 - verdict }}>
        {SEARCHES.map((search, i) => (
          <SearchPanel key={search.key} search={search} {...panelAt(i)} />
        ))}
      </div>

      {verdict > 0 ? (
        <div style={{ opacity: verdict }}>
          <Verdict walks={[steps.walk, cheap.walk]} />
          <Legend rows={[steps.row, cheap.row]} />
        </div>
      ) : null}
    </>
  );
};
