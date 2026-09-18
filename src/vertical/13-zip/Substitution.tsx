import { useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { HEIGHT, WIDTH } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import {
  CALLOUT_HEIGHT,
  CALLOUT_TOP,
  COLUMN_LEFT,
  COLUMN_WIDTH,
  PAD,
} from "./layout";
import { MEMBERS } from "./lz77";
import { showcaseAt } from "./beats";

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/** Monospace advance, as a fraction of the point size. */
const ADVANCE = 0.6;

/** Room for the text, inside the callout's own padding. */
const TEXT_WIDTH = COLUMN_WIDTH - 36;

const MAX_SIZE = 38;
const MIN_SIZE = 24;

/** The second row: the count, the word, and the pointer chip. */
const ROW_SIZE = 26;
const BECOMES = "becomes";
const GAP = 22;

/**
 * One substitution, at a size somebody can read.
 *
 * This is the thing VR13 did not have and VR12 did. chmod's `4 + 2 + 1 = 4` is
 * why people called that cut the best explanation they had seen: the viewer
 * does the arithmetic themselves, in the frame, so the understanding is theirs
 * rather than something they were told.
 *
 * VR13's mechanism was a three pixel arc over eight point text, about one point
 * on a phone, and the byte counts at the end had to be taken on trust. Here the
 * characters that matched are spelled out and the pointer that replaces them is
 * written underneath, so the trade is countable: this many characters, or these
 * two numbers.
 *
 * The pointer is not labelled with a byte cost, because it does not have a
 * fixed one. A length and a distance are Huffman coded, so what they weigh
 * depends on the rest of the block. "One pointer" is exactly true and a
 * number there would not be.
 */
export const Substitution: React.FC = () => {
  const frame = useCurrentFrame();
  const show = showcaseAt(frame);
  if (!show) return null;

  const member = MEMBERS[show.member];
  const copy = member.copies[show.copy];
  const text = member.text.slice(copy.at, copy.at + copy.length);

  const size = Math.max(
    MIN_SIZE,
    Math.min(MAX_SIZE, TEXT_WIDTH / (text.length * ADVANCE)),
  );
  const width = text.length * ADVANCE * size;

  // The second row is laid out from the strings rather than from fixed offsets.
  // "8 characters" and "29 characters" are different widths, and a constant
  // gap put them through each other on the first render.
  const countText = `${copy.length} characters`;
  const becomesX = COLUMN_LEFT + countText.length * ADVANCE * ROW_SIZE + GAP;
  const chipX = becomesX + BECOMES.length * ADVANCE * ROW_SIZE + GAP;

  // In quickly, and never out: the next one replaces it.
  const on = clamp((frame - show.from) / 5);

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0 }}
    >
      <g opacity={on}>
        <rect
          x={COLUMN_LEFT - PAD}
          y={CALLOUT_TOP}
          width={COLUMN_WIDTH + PAD * 2}
          height={CALLOUT_HEIGHT}
          rx={14}
          fill={theme.colors.blackSoft}
          stroke="#23252C"
          strokeWidth={2}
        />

        {/* The characters that matched, spelled out. */}
        <rect
          x={COLUMN_LEFT - 4}
          y={CALLOUT_TOP + 14}
          width={width + 8}
          height={size + 10}
          rx={5}
          fill={ACCENT}
          opacity={0.22}
        />
        <text
          x={COLUMN_LEFT}
          y={CALLOUT_TOP + 14 + size}
          textLength={width}
          lengthAdjust="spacing"
          fontFamily={theme.monoFamily}
          fontSize={size}
          fontWeight={500}
          fill={ACCENT}
          style={{ whiteSpace: "pre" }}
        >
          {text}
        </text>

        {/* What the archive writes instead. */}
        <text
          x={COLUMN_LEFT}
          y={CALLOUT_TOP + CALLOUT_HEIGHT - 18}
          fontFamily={theme.monoFamily}
          fontSize={ROW_SIZE}
          fontWeight={500}
          fill={theme.colors.grayDark}
        >
          {countText}
        </text>
        <text
          x={becomesX}
          y={CALLOUT_TOP + CALLOUT_HEIGHT - 18}
          fontFamily={theme.monoFamily}
          fontSize={ROW_SIZE}
          fontWeight={500}
          fill={theme.colors.grayDark}
        >
          {BECOMES}
        </text>
        <rect
          x={chipX}
          y={CALLOUT_TOP + CALLOUT_HEIGHT - 44}
          width={COLUMN_LEFT + COLUMN_WIDTH - chipX}
          height={36}
          rx={7}
          fill={ACCENT}
        />
        <text
          x={(chipX + COLUMN_LEFT + COLUMN_WIDTH) / 2}
          y={CALLOUT_TOP + CALLOUT_HEIGHT - 18}
          textAnchor="middle"
          fontFamily={theme.monoFamily}
          fontSize={ROW_SIZE}
          fontWeight={700}
          fill={theme.colors.black}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          back {copy.distance}, copy {copy.length}
        </text>
      </g>
    </svg>
  );
};
