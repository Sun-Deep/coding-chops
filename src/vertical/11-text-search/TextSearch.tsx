import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { clamp } from "../../shared/video/timing";
import { LEFT, RIGHT } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline } from "../../shared/vertical/type";
import { floodAt, positionAt, replayAt, VERDICT_FROM } from "./beats";
import { cellsPath, rowOf } from "./draw";
import {
  BIG_ADVANCE,
  BIG_FONT,
  BIG_HEIGHT,
  BIG_LEFT,
  BIG_LINE,
  BIG_TOP,
  BIG_WIDTH,
  COLUMN_X,
  FIND_HEIGHT,
  FIND_TOP,
  HEADING_TOP,
  PANEL_WIDTH,
  panelAt,
} from "./grid";
import { COLS, LENGTH, OCCURRENCES, PATTERN, ROWS, RUNS } from "./measurements";
import { byKey, MATCHERS, readsAtPosition, TEXT } from "./search";
import { TextPanel } from "./TextPanel";

const Meta: React.FC<{ children: React.ReactNode; opacity: number }> = ({
  children,
  opacity,
}) => (
  <div
    style={{
      position: "absolute",
      top: HEADING_TOP,
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
 * The find bar.
 *
 * The cut shipped once without it and the creator's first note was that nobody
 * can tell what word is being looked for. That was exactly right: the panels
 * highlight the hits and nothing anywhere in the frame said what the hits were.
 *
 * It is drawn as the thing a viewer already knows rather than as a label. A
 * rounded field, a magnifier, the phrase in quotes and a result count is a
 * find-in-page bar, and recognising it answers what this is and what it is
 * looking for in the same glance. It stays on screen for the whole cut, the
 * verdict included, because it is the only thing anchoring the six panels to
 * something familiar.
 */
const FindBar: React.FC = () => {
  const width = 470;
  const left = (1080 - width) / 2;
  return (
    <div
      style={{
        position: "absolute",
        top: FIND_TOP,
        left,
        width,
        height: FIND_HEIGHT,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 18px",
        boxSizing: "border-box",
        borderRadius: FIND_HEIGHT / 2,
        border: "1px solid rgba(255, 255, 255, 0.22)",
        background: "#151A20",
        boxShadow: "0 8px 20px #00000055",
      }}
    >
      <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden>
        <circle
          cx={7.5}
          cy={7.5}
          r={5.2}
          fill="none"
          stroke={theme.colors.grayDark}
          strokeWidth={2}
        />
        <line
          x1={11.4}
          y1={11.4}
          x2={16}
          y2={16}
          stroke={theme.colors.grayDark}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
      <span
        style={{
          flex: 1,
          fontFamily: theme.monoFamily,
          fontSize: 25,
          fontWeight: 700,
          color: theme.colors.chalk,
        }}
      >
        {PATTERN}
      </span>
      <span
        style={{
          fontFamily: theme.monoFamily,
          fontSize: 19,
          fontWeight: 600,
          color: ACCENT,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {OCCURRENCES} results
      </span>
    </div>
  );
};

/** Which column is which, said plainly, over the grid from frame zero. */
const Headings: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div style={{ opacity }}>
    {[
      ["Read every character", COLUMN_X[0]],
      ["Skip ahead", COLUMN_X[1]],
    ].map(([label, x]) => (
      <div
        key={label as string}
        style={{
          position: "absolute",
          top: HEADING_TOP,
          left: x as number,
          width: PANEL_WIDTH,
          textAlign: "center",
          fontFamily: theme.monoFamily,
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: theme.colors.gray,
        }}
      >
        {label}
      </div>
    ))}
  </div>
);

/**
 * One page, and Boyer-Moore walked across it slowly enough to see the jump.
 *
 * The grid says what happened and this says why. The window is drawn as a box
 * around the eleven characters the pattern is currently lined up against, and
 * on a mismatch it does not slide one place, it leaps: the characters it
 * crosses are never read and stay dark behind it. That is the entire mechanism
 * and it cannot be seen at panel size.
 */
const Verdict: React.FC = () => {
  const frame = useCurrentFrame();
  const bm = byKey("boyermoore").playback;
  const progress = replayAt(frame);
  const reads = Math.max(1, Math.round(progress * bm.frontier.length));

  const lit: number[] = [];
  for (let i = 0; i < LENGTH; i++) {
    const at = bm.touchedAt[i];
    if (at >= 0 && at < reads) lit.push(i);
  }

  const hitCells: number[] = [];
  for (const h of bm.hits) {
    if (bm.touchedAt[h] < 0 || bm.touchedAt[h] >= reads) continue;
    for (let k = 0; k < PATTERN.length; k++) hitCells.push(h + k);
  }

  // The straight scan, arriving underneath at the very end.
  const flood = floodAt(frame);
  const naive = byKey("naive").playback;
  const flooded: number[] = [];
  if (flood > 0) {
    const upTo = flood * naive.frontier.length;
    for (let i = 0; i < LENGTH; i++) {
      const at = naive.touchedAt[i];
      if (at >= 0 && at < upTo) flooded.push(i);
    }
  }

  const window = bm.windows[Math.min(bm.windows.length - 1, reads - 1)];
  const wx = (window % COLS) * BIG_ADVANCE;
  const wy = Math.floor(window / COLS) * BIG_LINE;
  const sameRow = (window % COLS) + PATTERN.length <= COLS;

  return (
    <svg
      width={BIG_WIDTH}
      height={BIG_HEIGHT}
      viewBox={`0 0 ${BIG_WIDTH} ${BIG_HEIGHT}`}
      style={{ position: "absolute", left: BIG_LEFT, top: BIG_TOP }}
      aria-label="Boyer-Moore walked across one page"
    >
      <rect x={0} y={0} width={BIG_WIDTH} height={BIG_HEIGHT} fill="#0B0E12" />
      {/*
        The read characters wear the accent here, not the cold neutral the
        panels use for old ground. At panel size the claim is carried by one
        column being denser than the other; on one page it has to be carried by
        how little of the page is marked at all, and a dim grey does not carry
        it. What should be obvious in this frame is the amount of untouched
        page between the marks.
      */}
      {flooded.length ? (
        <path d={cellsPath(flooded, BIG_ADVANCE, BIG_LINE)} fill="#5A6470" />
      ) : null}
      <path
        d={cellsPath(lit, BIG_ADVANCE, BIG_LINE)}
        fill={ACCENT}
        opacity={0.62}
      />
      <path d={cellsPath(hitCells, BIG_ADVANCE, BIG_LINE)} fill={ACCENT} />
      {Array.from({ length: ROWS }, (_, row) => (
        <text
          key={row}
          x={0}
          y={row * BIG_LINE + BIG_FONT * 0.78}
          fill="#6E7883"
          fontFamily={theme.monoFamily}
          fontSize={BIG_FONT}
          xmlSpace="preserve"
        >
          {rowOf(TEXT, row)}
        </text>
      ))}
      {sameRow ? (
        <g>
          <rect
            x={wx - 2}
            y={wy - 1}
            width={BIG_ADVANCE * PATTERN.length + 4}
            height={BIG_LINE + 2}
            fill={theme.colors.white}
            opacity={0.14}
          />
          <rect
            x={wx - 2}
            y={wy - 1}
            width={BIG_ADVANCE * PATTERN.length + 4}
            height={BIG_LINE + 2}
            fill="none"
            stroke={theme.colors.white}
            strokeWidth={3}
            rx={2}
          />
        </g>
      ) : null}
    </svg>
  );
};

/**
 * Six matchers on one clock, then the one that reads least, enlarged.
 *
 * The clock is position on the page rather than work done, so all six sweep it
 * together and nothing is choreographed: what separates them is how much of the
 * page each one has to light up to be sure, and that is a picture rather than a
 * number. The left column reads every character and the right column does not,
 * so the two columns are two different pictures by the end.
 */
export const TextSearch: React.FC = () => {
  const frame = useCurrentFrame();
  const position = positionAt(frame);
  const verdict = interpolate(
    frame,
    [VERDICT_FROM, VERDICT_FROM + 14],
    [0, 1],
    clamp,
  );

  return (
    <>
      <Eyebrow top={242}>Text search</Eyebrow>
      <Headline top={284} size={62}>
        Ctrl+F. Six ways.
      </Headline>

      <FindBar />
      <Headings opacity={1 - verdict} />
      <Meta opacity={verdict}>
        IT RULES GROUND OUT{" "}
        <span style={{ color: ACCENT }}>WITHOUT READING IT</span>
      </Meta>

      <div style={{ opacity: 1 - verdict }}>
        {MATCHERS.map((matcher, i) => (
          <TextPanel
            key={matcher.key}
            matcher={matcher}
            {...panelAt(i)}
            reads={readsAtPosition(matcher.playback, position)}
          />
        ))}
      </div>

      {verdict > 0 ? (
        <div style={{ opacity: verdict }}>
          <Verdict />
          <div
            style={{
              position: "absolute",
              top: BIG_TOP + BIG_HEIGHT + 34,
              left: BIG_LEFT + 10,
              width: BIG_WIDTH - 20,
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              fontFamily: theme.monoFamily,
              fontSize: 27,
              fontWeight: 700,
              color: theme.colors.chalk,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span style={{ flex: 1, fontWeight: 500, fontSize: 23 }}>
              A straight scan looks at
            </span>
            <span>{RUNS.naive.distinct.toLocaleString()}</span>
          </div>
          <div
            style={{
              position: "absolute",
              top: BIG_TOP + BIG_HEIGHT + 82,
              left: BIG_LEFT + 10,
              width: BIG_WIDTH - 20,
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              fontFamily: theme.monoFamily,
              fontSize: 27,
              fontWeight: 700,
              color: ACCENT,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span style={{ flex: 1, fontWeight: 500, fontSize: 23 }}>
              Boyer-Moore looks at
            </span>
            <span>{RUNS.boyermoore.distinct.toLocaleString()}</span>
          </div>
        </div>
      ) : null}
    </>
  );
};
