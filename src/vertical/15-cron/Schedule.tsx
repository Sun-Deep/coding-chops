import { useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { HEIGHT, WIDTH } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import {
  CELL_H,
  CELL_W,
  COLUMN_LEFT,
  COUNT_SIZE,
  COUNT_TOP,
  DAY_LABEL_RIGHT,
  GRID_TOP,
  LABEL_TOP,
  SLOT_SIZE,
  SLOT_TOP,
  SLOT_WIDTH,
  UNIT_SIZE,
} from "./layout";
import { DAYS, FIELDS, HOURS, STEPS, UNITS } from "./measurements";
import { PINNED, STEP_GRIDS, slotsOf } from "./fields";
import { countAt, headAt, headFrac, settledAt, stepAt } from "./beats";

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Full sixty minutes fills the cell; one minute still leaves a mark you can see.
 *
 * The first version scaled linearly, so an hour that fires once drew at a
 * thirtieth of full and came out a seven pixel dot, about two points on a
 * phone. The square root keeps the ordering while giving the sparse states a
 * mark worth drawing, which matters because the sparse states are the ones the
 * cut is arguing towards.
 */
const pipOf = (density: number) => {
  if (density <= 0) return 0;
  const full = Math.min(CELL_W, CELL_H) - 6;
  return full * (0.46 + 0.54 * Math.sqrt(density / 60));
};

/**
 * The expression, the week it selects, and how often it fires in a year.
 *
 * The five slots carry the lesson and so they carry the type. Underneath, a
 * week drawn as 24 hours across by 7 days down, because a year has 525,600
 * minutes and no grid can draw them: the grid shows the shape that repeats and
 * the counter holds the year.
 *
 * Each cell is one hour, and how much of it is filled is how many of its sixty
 * minutes fire. That is what lets `* * * * *` and `0 * * * *` look different
 * when both light all 168 hours, which is the one step in the sequence that is
 * a change of density rather than a change of shape.
 */
export const Schedule: React.FC = () => {
  const frame = useCurrentFrame();
  const step = stepAt(frame);
  const settled = settledAt(frame);
  const slots = slotsOf(STEPS[step].expression);
  const before = STEP_GRIDS[Math.max(0, step - 1)];
  const now = STEP_GRIDS[step];
  const count = countAt(frame);
  const head = headAt(frame, HOURS);
  const frac = headFrac(frame, HOURS);

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0 }}
    >
      {/* The five fields, and what each one is called. */}
      {slots.map((value, i) => {
        const justPinned = PINNED[step] === i;
        const flare = justPinned ? 1 - clamp(settled * 1.6) : 0;
        const pinned = value !== "*";
        return (
          <g key={`slot-${i}`}>
            {flare > 0 ? (
              <rect
                x={COLUMN_LEFT + i * SLOT_WIDTH + 6}
                y={SLOT_TOP - 8}
                width={SLOT_WIDTH - 12}
                height={SLOT_SIZE + 28}
                rx={10}
                fill={ACCENT}
                opacity={flare * 0.3}
              />
            ) : null}
            <text
              x={COLUMN_LEFT + i * SLOT_WIDTH + SLOT_WIDTH / 2}
              y={SLOT_TOP + SLOT_SIZE}
              textAnchor="middle"
              fontFamily={theme.monoFamily}
              fontSize={SLOT_SIZE}
              fontWeight={700}
              fill={pinned ? ACCENT : theme.colors.chalk}
            >
              {value}
            </text>
            <text
              x={COLUMN_LEFT + i * SLOT_WIDTH + SLOT_WIDTH / 2}
              y={LABEL_TOP}
              textAnchor="middle"
              fontFamily={theme.monoFamily}
              fontSize={26}
              fontWeight={600}
              letterSpacing="0.08em"
              fill={pinned ? ACCENT : theme.colors.grayLight}
              opacity={pinned ? 1 : 0.9}
            >
              {FIELDS[i].label}
            </text>
          </g>
        );
      })}

      {/* The week. Days down the side, hours across. */}
      {DAYS.map((day, d) => (
        <text
          key={`day-${day}`}
          x={DAY_LABEL_RIGHT}
          y={GRID_TOP + d * CELL_H + CELL_H / 2 + 6}
          textAnchor="end"
          fontFamily={theme.monoFamily}
          fontSize={17}
          fontWeight={500}
          fill={theme.colors.grayDark}
        >
          {day}
        </text>
      ))}

      {/*
        The week itself, drawn empty first.

        Without a skeleton the grid only exists where it fires, so the late
        states read as a few dots floating in the dark rather than as one hour
        out of a hundred and sixty-eight. The empty cells are what make the
        collapse mean anything.
      */}
      {DAYS.map((_, d) =>
        Array.from({ length: HOURS }).map((__, h) => (
          <rect
            key={`bg-${d}-${h}`}
            x={COLUMN_LEFT + h * CELL_W + 2}
            y={GRID_TOP + d * CELL_H + 2}
            width={CELL_W - 4}
            height={CELL_H - 4}
            rx={5}
            fill="#14161B"
            stroke="#1E2128"
            strokeWidth={1}
          />
        )),
      )}

      {/* The hour the marker is on, so the sweep reads as a column not a line. */}
      <rect
        x={COLUMN_LEFT + head * CELL_W}
        y={GRID_TOP - 5}
        width={CELL_W}
        height={DAYS.length * CELL_H + 10}
        rx={6}
        fill={ACCENT}
        opacity={0.1}
      />
      <rect
        x={COLUMN_LEFT + (head + frac) * CELL_W - 1.5}
        y={GRID_TOP - 5}
        width={3}
        height={DAYS.length * CELL_H + 10}
        rx={1.5}
        fill={ACCENT}
        opacity={0.75}
      />

      {DAYS.map((_, d) =>
        Array.from({ length: HOURS }).map((__, h) => {
          const density = mix(before[d][h], now[d][h], settled);
          const pip = pipOf(density);
          if (pip <= 0) return null;
          // Lit as the marker crosses, then fading back down behind it.
          const since = (h - head + HOURS) % HOURS;
          const struck = since === 0 ? 1 : since <= 1 ? clamp(1 - frac) : 0;
          const grow = 1 + struck * 0.55;
          const size = pip * grow;
          return (
            <rect
              key={`c-${d}-${h}`}
              x={COLUMN_LEFT + h * CELL_W + (CELL_W - size) / 2}
              y={GRID_TOP + d * CELL_H + (CELL_H - size) / 2}
              width={size}
              height={size}
              rx={Math.min(5, size / 3)}
              fill={ACCENT}
              // Live is live. How much of the hour fires shows as size, not as
              // brightness: driving both off density left an hour that fires
              // once at a tenth of the opacity of one that fires sixty times,
              // which read as "almost off" rather than "once".
              opacity={Math.min(
                1,
                0.78 + 0.12 * (density / 60) + struck * 0.22,
              )}
            />
          );
        }),
      )}

      {/* Marks every six hours, so the columns can be read as a clock. */}
      {[0, 6, 12, 18].map((h) => (
        <text
          key={`h-${h}`}
          x={COLUMN_LEFT + h * CELL_W + CELL_W / 2}
          y={GRID_TOP - 12}
          textAnchor="middle"
          fontFamily={theme.monoFamily}
          fontSize={17}
          fontWeight={500}
          fill={theme.colors.grayDark}
        >
          {String(h).padStart(2, "0")}
        </text>
      ))}

      {/* How often it fires in a year. */}
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
        {count.toLocaleString("en-US")}
      </text>
      {/*
        What that number is a year of, named as it lands.

        It used to read TIMES A YEAR at every step, which is true and says
        nothing: the whole claim is that each field drops you to the next unit
        of time, and the unit was only spelled out in the small list at the end.
        Saying it here, at the size of the thing it explains, is what makes the
        count a lesson rather than a counter.
      */}
      <text
        x={WIDTH / 2}
        y={COUNT_TOP + COUNT_SIZE + 34}
        textAnchor="middle"
        fontFamily={theme.monoFamily}
        fontSize={UNIT_SIZE}
        fontWeight={600}
        letterSpacing="0.1em"
        fill={theme.colors.chalk}
      >
        {UNITS[step].toUpperCase()} IN A YEAR
      </text>
    </svg>
  );
};
