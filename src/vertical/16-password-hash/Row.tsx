import { useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { HEIGHT, WIDTH } from "../../shared/vertical/geometry";
import { ACCENT, ON_ACCENT } from "../../shared/vertical/palette";
import {
  CELL_H,
  CELL_W,
  CHIP_HEIGHT,
  CHIP_LEFT,
  CHIP_TOP,
  CHIP_WIDTH,
  COLS,
  COUNT_SIZE,
  COUNT_TOP,
  COUNT_UNIT_SIZE,
  FIELD_HEIGHT,
  FIELD_LABEL_TOP,
  FIELD_LEFT,
  FIELD_TEXT,
  FIELD_TOP,
  FIELD_WIDTH,
  GLYPH_SIZE,
  GRID_LEFT,
  GRID_WIDTH,
  GRID_TOP,
  ROW_LABEL_TOP,
} from "./layout";
import { HEX_DIGITS } from "./measurements";
import {
  STATES,
  SWEEP_FROM,
  SWEEP_TO,
  chipAt,
  digestAt,
  digestBefore,
  lastKeyAt,
  localAt,
  maskAt,
  matchesAt,
  stateAt,
  sweptAt,
  typedAt,
} from "./beats";

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/** How long a cell takes to turn over, and how far the wave lags across the row. */
const FLIP = 5;
const WAVE = 4;

/**
 * A login box, and the row a site keeps instead of the password.
 *
 * One object for the whole cut. The field is typed into three times and the row
 * underneath is recomputed from whatever is in it, character by character, by
 * the SHA-256 in this folder. Nothing here is a stored picture of a hash: type
 * a different password into `beats.ts` and every glyph in the frame changes,
 * which is the only honest way to animate this claim.
 *
 * The row is the largest object in the frame because watching sixty-four
 * characters turn over on one keystroke is the argument. The count underneath
 * is the precise version of the same fact, and the two never use different
 * units: both are survivors, never the sixty-one that changed.
 */
export const Row: React.FC = () => {
  const frame = useCurrentFrame();
  const state = stateAt(frame);
  const local = localAt(frame);
  const typed = typedAt(frame);
  const digest = digestAt(frame);
  const previous = digestBefore(frame);
  const lastKey = lastKeyAt(frame);
  const mask = maskAt(frame);
  const swept = sweptAt(frame);
  const settled = Math.floor(swept);
  const matches = matchesAt(frame);
  const chip = chipAt(frame);
  const sweeping = local > SWEEP_FROM && local < SWEEP_TO;

  const password = STATES[state].password;
  const signup = STATES[state].signup;
  const shown = password.slice(0, typed);
  const verdict = STATES[state].verdict;
  const passed = verdict !== "NO MATCH";

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0 }}
    >
      {/* What the box is. A login field is recognised before it is read. */}
      <text
        x={FIELD_LEFT}
        y={FIELD_LABEL_TOP}
        fontFamily={theme.monoFamily}
        fontSize={22}
        fontWeight={600}
        letterSpacing="0.2em"
        fill={theme.colors.gray}
      >
        PASSWORD
      </text>

      <rect
        x={FIELD_LEFT}
        y={FIELD_TOP}
        width={FIELD_WIDTH}
        height={FIELD_HEIGHT}
        rx={12}
        fill="#14161B"
        stroke={typed > 0 && typed < password.length ? ACCENT : "#2A2E36"}
        strokeWidth={2}
      />

      {/*
        The characters, not dots.

        A field of bullets would be truer to a login screen and would hide the
        one thing the middle pass is about, which is which character changed.
        The character that differs from the password this account signed up
        with is drawn in the accent, derived rather than typed, so it cannot
        drift if the passwords change.
      */}
      {[...shown].map((c, i) => (
        <text
          key={`ch-${i}`}
          x={FIELD_LEFT + 26 + i * 27}
          y={FIELD_TOP + FIELD_HEIGHT / 2 + 15}
          fontFamily={theme.monoFamily}
          fontSize={FIELD_TEXT}
          fontWeight={600}
          fill={c === STATES[0].password[i] ? theme.colors.chalk : ACCENT}
        >
          {c}
        </text>
      ))}

      {/* The caret, blinking, so the field is never a still object. */}
      <rect
        x={FIELD_LEFT + 26 + shown.length * 27}
        y={FIELD_TOP + FIELD_HEIGHT / 2 - 22}
        width={3}
        height={44}
        fill={ACCENT}
        opacity={typed < password.length ? 1 : Math.floor(local / 9) % 2 === 0 ? 0.85 : 0.15}
      />

      {/* What the row is, and what put it there, on one line. */}
      <text
        x={GRID_LEFT + GRID_WIDTH}
        y={ROW_LABEL_TOP}
        textAnchor="end"
        fontFamily={theme.monoFamily}
        fontSize={22}
        fontWeight={600}
        letterSpacing="0.2em"
        fill={theme.colors.gray}
      >
        SHA-256
      </text>

      <text
        x={GRID_LEFT}
        y={ROW_LABEL_TOP}
        fontFamily={theme.monoFamily}
        fontSize={22}
        fontWeight={600}
        letterSpacing="0.2em"
        fill={theme.colors.gray}
      >
        {signup ? "THE ROW BEING WRITTEN" : "THE ROW IN THE DATABASE"}
      </text>

      {/* The row itself. Sixty-four characters, recomputed every keystroke. */}
      {[...Array(HEX_DIGITS)].map((_, i) => {
        const col = i % COLS;
        const line = Math.floor(i / COLS);
        const cx = GRID_LEFT + col * CELL_W + CELL_W / 2;
        const cy = GRID_TOP + line * CELL_H + CELL_H * 0.72;

        // The turnover, lagging across the row so a keystroke reads as a wave
        // rather than as sixty-four things blinking at once.
        const since = local - lastKey - (i / HEX_DIGITS) * WAVE;
        const p = clamp(since / FLIP);
        const flipping = since >= 0 && since < FLIP;
        const glyph = flipping && p < 0.5 ? previous[i] : digest[i];
        const squash = flipping ? Math.max(0.06, Math.abs(Math.cos(p * Math.PI))) : 1;

        const done = i < settled;
        const kept = done && mask[i];
        // The head only exists while the comparison is running. Left on, it
        // parks on the last cell for the rest of the pass and reads as a cursor
        // waiting for input rather than as a read that finished.
        const head = sweeping && Math.abs(swept - i - 0.5) < 0.9;

        return (
          <g key={`cell-${i}`}>
            {/*
              A survivor is filled rather than tinted.

              A washed accent behind an accent glyph is two versions of the same
              hue a few per cent apart, and at the size a cover is seen in a
              profile grid the three that came back were barely distinguishable
              from the sixty-one that did not. Solid, with the glyph knocked out
              of it, is the only treatment that survives the thumbnail.
            */}
            {kept ? (
              <rect
                x={cx - CELL_W / 2 + 3}
                y={GRID_TOP + line * CELL_H + 4}
                width={CELL_W - 6}
                height={CELL_H - 8}
                rx={7}
                fill={ACCENT}
              />
            ) : null}
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              fontFamily={theme.monoFamily}
              fontSize={GLYPH_SIZE}
              fontWeight={kept ? 700 : 500}
              fill={kept ? ON_ACCENT : done ? theme.colors.grayDark : theme.colors.chalk}
              opacity={done && !kept ? 0.62 : 1}
              transform={`translate(0 ${cy}) scale(1 ${squash}) translate(0 ${-cy})`}
            >
              {glyph}
            </text>
            {head ? (
              <rect
                x={cx - CELL_W / 2 + 1}
                y={GRID_TOP + line * CELL_H + 2}
                width={CELL_W - 2}
                height={CELL_H - 4}
                rx={7}
                fill="none"
                stroke={ACCENT}
                strokeWidth={2.5}
                opacity={0.85}
              />
            ) : null}
          </g>
        );
      })}

      {/* How many came back. Counted as the comparison passes, never announced. */}
      <text
        x={WIDTH / 2}
        y={COUNT_TOP + COUNT_SIZE}
        textAnchor="middle"
        fontFamily={theme.monoFamily}
        fontSize={COUNT_SIZE}
        fontWeight={700}
        fill={ACCENT}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {matches}
      </text>
      <text
        x={WIDTH / 2}
        y={COUNT_TOP + COUNT_SIZE + 36}
        textAnchor="middle"
        fontFamily={theme.monoFamily}
        fontSize={COUNT_UNIT_SIZE}
        fontWeight={600}
        letterSpacing="0.1em"
        fill={theme.colors.chalk}
      >
        {signup ? `OF ${HEX_DIGITS} WRITTEN` : `OF ${HEX_DIGITS} MATCH`}
      </text>

      {/* The verdict, arriving rather than appearing. */}
      {chip > 0 ? (
        <g opacity={chip} transform={`translate(0 ${(1 - chip) * 26})`}>
          <rect
            x={CHIP_LEFT}
            y={CHIP_TOP}
            width={CHIP_WIDTH}
            height={CHIP_HEIGHT}
            rx={14}
            fill={passed ? ACCENT : "#14161B"}
            stroke={passed ? ACCENT : "#3A3F49"}
            strokeWidth={2}
          />
          <text
            x={WIDTH / 2}
            y={CHIP_TOP + CHIP_HEIGHT / 2 + 15}
            textAnchor="middle"
            fontFamily={theme.monoFamily}
            fontSize={42}
            fontWeight={700}
            letterSpacing="0.14em"
            fill={passed ? ON_ACCENT : theme.colors.grayLight}
          >
            {verdict}
          </text>
        </g>
      ) : null}
    </svg>
  );
};
