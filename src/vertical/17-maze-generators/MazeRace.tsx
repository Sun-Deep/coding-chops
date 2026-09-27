import { Easing, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { clamp } from "../../shared/video/timing";
import { LEFT, RIGHT } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline, Provenance } from "../../shared/vertical/type";
import {
  GROW,
  LONG_WALK_FROM,
  LONG_WALK_TO,
  SHORT_WALK_FROM,
  SHORT_WALK_TO,
  SHUFFLES,
  shuffleAt,
  VERDICT_FROM,
  walkedAt,
} from "./beats";
import { openPath, routePoints } from "./draw";
import {
  BIG_CELL,
  BIG_HEIGHT,
  BIG_LEFT,
  BIG_WIDTH,
  FIELD_WIDTH,
  fieldAt,
  LABEL_OFFSET,
  MAP_TOP,
  PROVENANCE_TOP,
  panelAt,
} from "./grid";
import { CH, CW, GENERATORS, reshuffled, roomCell, type Maze } from "./maze";
import { Bands, MazePanel, OPEN, ROCK } from "./MazePanel";
import { MH, MW, PASSAGES, SEED, SWEEP } from "./measurements";

const EASE_IN_OUT = {
  ...clamp,
  easing: Easing.bezier(0.45, 0, 0.55, 1),
};

const Meta: React.FC<{ children: React.ReactNode; opacity: number }> = ({
  children,
  opacity,
}) => (
  <div
    style={{
      position: "absolute",
      top: 402,
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

const SHUFFLED = reshuffled(SHUFFLES);

type Walk = {
  readonly from: number;
  readonly to: number;
  readonly stroke: string;
};

/**
 * One maze, grown out of its panel into a map two and a bit times the size.
 *
 * It grows from where the panel's maze sat rather than fading in somewhere
 * else, so the viewer is still looking at the same object they watched being
 * dug. The dig-order colours drain to one neutral as it grows: on the map the
 * question is no longer how it was made but how you get through it.
 */
const BigMap: React.FC<{
  index: number;
  top: number;
  walk: Walk;
  shuffle?: boolean;
}> = ({ index, top, walk, shuffle = false }) => {
  const frame = useCurrentFrame();
  const { maze: fixture, name } = GENERATORS[index];
  const k = shuffle ? shuffleAt(frame) : -1;
  const maze: Maze = k >= 0 ? SHUFFLED[k] : fixture;

  const grow = interpolate(
    frame,
    [VERDICT_FROM, VERDICT_FROM + GROW],
    [0, 1],
    EASE_IN_OUT,
  );
  const origin = fieldAt(index);
  const scale = interpolate(grow, [0, 1], [FIELD_WIDTH / BIG_WIDTH, 1]);
  const left = interpolate(grow, [0, 1], [origin.left, BIG_LEFT]);
  const y = interpolate(grow, [0, 1], [origin.top, top]);
  const shown = interpolate(
    frame,
    [VERDICT_FROM, VERDICT_FROM + 4],
    [0, 1],
    clamp,
  );

  const rooms = walkedAt(frame, maze.route.length, walk.from, walk.to);
  const head = rooms > 0 ? roomCell(maze.route[rooms - 1]) : -1;
  const done = rooms >= maze.route.length;
  const centre = (c: number) => ({
    cx: (c % CW) * BIG_CELL + BIG_CELL / 2,
    cy: Math.floor(c / CW) * BIG_CELL + BIG_CELL / 2,
  });

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: BIG_LEFT,
          top: top - LABEL_OFFSET,
          width: BIG_WIDTH,
          opacity: interpolate(grow, [0.6, 1], [0, 1], clamp),
          display: "flex",
          alignItems: "baseline",
          gap: 14,
          fontFamily: theme.monoFamily,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span
          style={{
            flex: 1,
            fontSize: 24,
            fontWeight: 700,
            color: theme.colors.chalk,
          }}
        >
          {name}
        </span>
        {shuffle && k >= 0 ? (
          <span
            style={{
              fontSize: 19,
              fontWeight: 500,
              color: theme.colors.grayDark,
            }}
          >
            maze {k + 2}
          </span>
        ) : null}
        <span
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: rooms > 0 ? walk.stroke : theme.colors.grayDark,
            minWidth: 190,
            textAlign: "right",
          }}
        >
          {rooms > 0 ? `${rooms} rooms` : ""}
        </span>
      </div>

      <svg
        width={BIG_WIDTH}
        height={BIG_HEIGHT}
        viewBox={`0 0 ${BIG_WIDTH} ${BIG_HEIGHT}`}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          opacity: shown,
          transformOrigin: "0 0",
          transform: `translate(${left}px, ${y}px) scale(${scale})`,
        }}
        aria-label={`${name} maze, the route walked ${rooms} rooms`}
      >
        <rect x={0} y={0} width={BIG_WIDTH} height={BIG_HEIGHT} fill={ROCK} />
        <path d={openPath(maze, BIG_CELL)} fill={OPEN} />
        {grow < 1 ? (
          <g opacity={1 - grow}>
            <Bands
              openedAt={fixture.openedAt}
              carved={PASSAGES}
              cell={BIG_CELL}
            />
          </g>
        ) : null}
        {rooms > 0 ? (
          <>
            <polyline
              points={routePoints(maze.route, BIG_CELL, rooms)}
              fill="none"
              stroke={walk.stroke}
              strokeWidth={BIG_CELL * 0.42}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {done ? null : (
              <circle
                {...centre(head)}
                r={BIG_CELL * 0.62}
                fill={walk.stroke}
              />
            )}
          </>
        ) : null}
        <rect
          x={0}
          y={BIG_CELL}
          width={BIG_CELL}
          height={BIG_CELL}
          fill={theme.colors.chalk}
        />
        <rect
          x={(CW - 1) * BIG_CELL}
          y={(CH - 2) * BIG_CELL}
          width={BIG_CELL}
          height={BIG_CELL}
          fill={done ? walk.stroke : theme.colors.chalk}
        />
      </svg>
    </>
  );
};

/**
 * Six generators on one clock, then the two routes that are furthest apart.
 *
 * All six knock down the same 299 walls on the same frames, so nothing is
 * choreographed and nothing races: they finish together. What each one leaves
 * is the point, and every panel draws the one route through its maze the
 * moment the last wall is down.
 *
 * The verdict keeps two of them. Depth-first, whose route winds through 114 of
 * the 300 rooms, and binary tree, whose route is the top row and the right
 * column and nothing else. Then binary tree's maze is swapped for new ones
 * under a route that does not move, because "every time" is a claim a frame
 * can show rather than state.
 */
export const MazeRace: React.FC = () => {
  const frame = useCurrentFrame();
  const verdict = interpolate(
    frame,
    [VERDICT_FROM, VERDICT_FROM + 14],
    [0, 1],
    clamp,
  );

  return (
    <>
      <Eyebrow top={242}>Maze generation</Eyebrow>
      <Headline top={268} size={58}>
        Six ways to build a maze.
      </Headline>
      <Headline top={326} size={58} color={ACCENT}>
        One you can solve blind.
      </Headline>

      <Meta opacity={1 - verdict}>
        SAME {MW} × {MH} GRID · ONE SHARED CLOCK
      </Meta>

      <div style={{ opacity: 1 - verdict }}>
        {GENERATORS.map((generator, i) => (
          <MazePanel
            key={generator.key}
            generator={generator}
            {...panelAt(i)}
          />
        ))}
      </div>

      {frame >= VERDICT_FROM ? (
        <>
          <BigMap
            index={0}
            top={MAP_TOP[0]}
            walk={{
              from: LONG_WALK_FROM,
              to: LONG_WALK_TO,
              stroke: theme.colors.white,
            }}
          />
          <BigMap
            index={4}
            top={MAP_TOP[1]}
            walk={{ from: SHORT_WALK_FROM, to: SHORT_WALK_TO, stroke: ACCENT }}
            shuffle
          />
          <Provenance top={PROVENANCE_TOP} opacity={verdict}>
            {MW} × {MH} rooms · seed {SEED} · binary tree checked on{" "}
            {SWEEP.seeds.toLocaleString()} seeds
          </Provenance>
        </>
      ) : null}
    </>
  );
};
