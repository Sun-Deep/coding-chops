import { useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { HEIGHT, WIDTH } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import {
  BAND_TOP,
  SYMBOL_TOP,
  SYMBOL_WIDTH,
  CHIPS_LEFT,
  CHIP_COLS,
  CHIP_PITCH,
  CHIP_SIZE,
  LADDER_ROW,
  SUM_TOP,
} from "./layout";
import { HERO, LEVELS, MODULES_TOTAL } from "./measurements";
import {
  bandStateAt,
  chipAt,
  chipsShown,
  holeAt,
  ladderAt,
  ladderShown,
  splitAt,
} from "./beats";

const n = (v: number) => v.toLocaleString("en-US");

/**
 * The band under the symbol, saying one of three things.
 *
 * How much has been taken out, then what the symbol is made of, then the four
 * levels as the thing worth keeping. One slot rather than three stacked,
 * because a strip of readouts under a diagram turns the bottom of the frame
 * into a dashboard reporting on the picture above it.
 */
export const Band: React.FC = () => {
  const frame = useCurrentFrame();
  const state = bandStateAt(frame);

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0 }}
    >
      {state === "hole" ? <Hole frame={frame} /> : null}
      {state === "parts" ? <Parts frame={frame} /> : null}
      {state === "ladder" ? <Ladder frame={frame} /> : null}
    </svg>
  );
};

/** How much of the symbol has been taken out, counted as it goes. */
const Hole: React.FC<{ frame: number }> = ({ frame }) => {
  const side = holeAt(frame);
  const blanked = side * side;
  return (
    <>
      <text
        x={WIDTH / 2}
        y={BAND_TOP + 64}
        textAnchor="middle"
        fontFamily={theme.monoFamily}
        fontSize={54}
        fontWeight={600}
        fill={theme.colors.chalk}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {n(blanked)} of {n(MODULES_TOTAL)}
      </text>
      <text
        x={WIDTH / 2}
        y={BAND_TOP + 112}
        textAnchor="middle"
        fontFamily={theme.monoFamily}
        fontSize={27}
        fontWeight={500}
        letterSpacing="0.16em"
        fill={theme.colors.grayDark}
      >
        SQUARES BLANKED
      </text>
    </>
  );
};

/**
 * The seventy pieces, and how few of them are the link.
 *
 * This is the answer to the hole, and the reason the cut is not just a stunt.
 * Twenty-six chips take the accent and forty-four stay neutral, in reading
 * order, so the split is something you see rather than something you are told.
 */
const Parts: React.FC<{ frame: number }> = ({ frame }) => {
  const shown = chipsShown(frame);
  const split = splitAt(frame);

  // Where the pieces come from: the middle of the code they were read out of.
  const originX = WIDTH / 2;
  const originY = SYMBOL_TOP + SYMBOL_WIDTH / 2;

  return (
    <>
      {Array.from({ length: HERO.codewords }).map((_, i) => {
        if (i >= shown) return null;
        const flown = chipAt(i, frame);
        if (flown <= 0) return null;
        const eased = flown * flown * (3 - 2 * flown);

        const col = i % CHIP_COLS;
        const row = Math.floor(i / CHIP_COLS);
        const homeX = CHIPS_LEFT + col * CHIP_PITCH;
        const homeY = BAND_TOP + row * CHIP_PITCH;

        const x = originX + (homeX - originX) * eased;
        const y = originY + (homeY - originY) * eased;
        // Small on the way, full size once it lands.
        const size = CHIP_SIZE * (0.35 + 0.65 * eased);

        const mine = i < HERO.data;
        return (
          <rect
            key={`chip-${i}`}
            x={x + (CHIP_SIZE - size) / 2}
            y={y + (CHIP_SIZE - size) / 2}
            width={size}
            height={size}
            rx={6}
            fill={mine ? ACCENT : theme.colors.grayDark}
            opacity={
              (mine ? 0.35 + split * 0.65 : 0.5 - split * 0.18) *
              (0.4 + 0.6 * eased)
            }
          />
        );
      })}
      <text
        x={WIDTH / 2}
        y={SUM_TOP}
        textAnchor="middle"
        fontFamily={theme.monoFamily}
        fontSize={28}
        fontWeight={600}
        fill={theme.colors.grayDark}
        opacity={split}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        <tspan fill={ACCENT}>{HERO.data} your link</tspan>
        {"  +  "}
        {HERO.ec} backup {"  =  "}
        {HERO.codewords} pieces
      </text>
    </>
  );
};

/**
 * The four levels.
 *
 * The reference somebody keeps, and the proof that the hole was not a fluke:
 * every step up buys more backup and every step up survives a bigger hole.
 */
const Ladder: React.FC<{ frame: number }> = ({ frame }) => {
  const shown = ladderShown(frame);
  return (
    <>
      {LEVELS.map((level, i) => {
        if (i >= shown) return null;
        const on = ladderAt(i, frame);
        const eased = on * on * (3 - 2 * on);
        const y = BAND_TOP + 6 + i * LADDER_ROW;
        // Slid in from the left, because a row that fades changes too few
        // pixels for the frozen-frame check to see it happen at all.
        const dx = (1 - eased) * -180;
        const hero = level.level === HERO.level;
        return (
          <g key={level.level} opacity={on} transform={`translate(${dx}, 0)`}>
            <text
              x={276}
              y={y + 30}
              textAnchor="middle"
              fontFamily={theme.monoFamily}
              fontSize={31}
              fontWeight={700}
              fill={hero ? ACCENT : theme.colors.chalk}
            >
              {level.level}
            </text>
            <text
              x={352}
              y={y + 30}
              fontFamily={theme.monoFamily}
              fontSize={28}
              fontWeight={500}
              fill={hero ? ACCENT : theme.colors.grayDark}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {String(level.backup).padStart(2, " ")}% backup
            </text>
            <text
              x={660}
              y={y + 30}
              fontFamily={theme.monoFamily}
              fontSize={28}
              fontWeight={600}
              fill={hero ? ACCENT : theme.colors.chalk}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {level.hole} x {level.hole} hole
            </text>
          </g>
        );
      })}
    </>
  );
};
