import { useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { carvedAt, routeDrawnAt } from "./beats";
import { cellsPath, roomsPath, routePoints } from "./draw";
import {
  CELL,
  FIELD_HEIGHT,
  FIELD_TOP,
  FIELD_WIDTH,
  PAD,
  PANEL_HEIGHT,
  PANEL_WIDTH,
} from "./grid";
import type { Generator } from "./maze";
import { PASSAGES } from "./measurements";

/** Solid rock: the border and every wall still standing. */
export const ROCK = "#07080A";
/** A room nothing has reached yet. Just visible, so the grid reads as a grid. */
export const UNDUG = "#161B21";
/** Open ground in a finished maze, where the order it was dug no longer matters. */
export const OPEN = "#39424D";

/**
 * Dug ground, oldest first.
 *
 * Drawing open against closed would show six mazes filling up, which is the
 * same picture six times. The order is what differs between generators, so the
 * order is what is drawn: every cell keeps the colour of when it was opened,
 * cold for the first walls down and the accent at the newest. Each panel then
 * shows the shape of its own method for the whole cut. Depth-first is one long
 * ribbon, Prim's a blob spreading from the corner, Kruskal's scraps everywhere
 * at once, and the two row-by-row methods a sweep from the top.
 *
 * One hue, running neutral to accent, so the accent still marks where work is
 * happening and nothing else has been given a colour. VR10's ramp, unchanged.
 */
const BANDS = 10;
const COLD = [0x4a, 0x55, 0x62] as const;
const HOT = [0xff, 0x7a, 0x33] as const;
const BAND_FILLS = Array.from({ length: BANDS }, (_, i) => {
  const t = (i / (BANDS - 1)) ** 1.6;
  const c = COLD.map((v, k) => Math.round(v + (HOT[k] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
});

/** The dug cells split into age bands, for any cell size. */
export const bandsOf = (openedAt: Int32Array, carved: number) => {
  const bands: number[][] = Array.from({ length: BANDS }, () => []);
  openedAt.forEach((at, c) => {
    if (at < 0 || at >= carved) return;
    const band = Math.min(
      BANDS - 1,
      Math.floor(((at + 1) / Math.max(1, carved)) * BANDS),
    );
    bands[band].push(c);
  });
  return bands;
};

export const Bands: React.FC<{
  openedAt: Int32Array;
  carved: number;
  cell: number;
}> = ({ openedAt, carved, cell }) => (
  <>
    {bandsOf(openedAt, carved).map((cells, i) =>
      cells.length ? (
        <path key={i} d={cellsPath(cells, cell)} fill={BAND_FILLS[i]} />
      ) : null,
    )}
  </>
);

export const MazePanel: React.FC<{
  generator: Generator;
  left: number;
  top: number;
}> = ({ generator, left, top }) => {
  const frame = useCurrentFrame();
  const { maze } = generator;
  const carved = carvedAt(frame);
  const rooms = routeDrawnAt(frame, maze.route.length);
  const reveal = rooms > 0;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
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
        {generator.name}
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
        {generator.note}
      </div>

      <svg
        width={PANEL_WIDTH}
        height={PANEL_HEIGHT}
        viewBox={`0 0 ${PANEL_WIDTH} ${PANEL_HEIGHT}`}
        style={{ position: "absolute", inset: 0 }}
        aria-label={`${generator.name} maze, ${carved} walls down`}
      >
        <g transform={`translate(${PAD} ${FIELD_TOP})`}>
          <rect
            x={0}
            y={0}
            width={FIELD_WIDTH}
            height={FIELD_HEIGHT}
            fill={ROCK}
          />
          <path d={roomsPath(CELL)} fill={UNDUG} />
          <Bands openedAt={maze.openedAt} carved={carved} cell={CELL} />
          {reveal ? (
            <polyline
              points={routePoints(maze.route, CELL, rooms)}
              fill="none"
              stroke={theme.colors.white}
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
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
          color: reveal ? ACCENT : theme.colors.chalk,
        }}
      >
        {reveal ? rooms : carved}
        <span
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: theme.colors.grayDark,
            marginLeft: 6,
          }}
        >
          {reveal ? "rooms to the exit" : `of ${PASSAGES} walls down`}
        </span>
      </div>

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
            width: (carved / PASSAGES) * PANEL_WIDTH,
            height: 6,
            background: ACCENT,
          }}
        />
      </div>
    </div>
  );
};
