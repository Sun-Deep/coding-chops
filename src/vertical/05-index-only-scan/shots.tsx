import { interpolate, useCurrentFrame } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { theme } from "../../shared/brand/theme";
import { EASE_IN_OUT, EASE_OUT } from "../../shared/video/motion";
import { clamp } from "../../shared/video/timing";
import { ACCENT } from "../../shared/vertical/palette";
import {
  Headline,
  Label,
  Provenance,
  Punch,
  Readout,
} from "../../shared/vertical/type";
import {
  Heap,
  INDEX_STRIPS_COVERING,
  INDEX_STRIPS_PLAIN,
  IndexSlab,
  Sql,
} from "./Field";
import {
  CONTIGUOUS,
  INDEX_PAGES_READ,
  INDEX_SIZE,
  LAYOUT,
  PAGE_RATIO,
  SCATTERED,
  SETUP,
  STALE_VISIBILITY_MAP,
  commas,
} from "./measurements";

/**
 * The shots.
 *
 * Every one is a pure function of the frame within its own sequence, so a shot
 * can be scrubbed on its own in the studio without the rest of the reel.
 *
 * The vertical rhythm is shared and it is held harder here than in any previous
 * cut, because three of the five shots are the same layout with different
 * behaviour and the comparison only works if nothing moves between them. Label
 * at 292, the query at 342, the index definition at 396, the index slab bottom
 * anchored at 582, the heap from 626 to 926, the count at 956, the receipt at
 * 1150, and the narration on a baseline at 1460.
 *
 * No shot draws its own closing line. Those are the payoff lines in
 * `narration.tsx`, set large, which `Reel.tsx` lays over the top.
 */

const ramp = (frame: number, from: number, over: number) =>
  interpolate(frame, [from, from + over], [0, 1], { ...clamp, ...EASE_OUT });

/**
 * A number counting toward a target, rounded so the digits stay readable.
 *
 * Linear in `t`, because `t` is already the eased progress of the thing being
 * counted. A counter that finishes before the field it is counting is the one
 * detail that would tell a viewer the numbers are decoration.
 */
const counting = (t: number, to: number, step: number) => {
  if (t >= 1) return to;
  const value = interpolate(t, [0, 1], [0, to], clamp);
  return Math.min(to, Math.round(value / step) * step);
};

const PLAIN = SCATTERED[1];
const COVERING = SCATTERED[2];
const NO_INDEX = SCATTERED[0];

const QUERY = `SELECT sum(amount) FROM events WHERE ${LAYOUT.scattered.column} = ${SETUP.key};`;

/** The fraction of the heap a lane touches, which is what the field draws. */
const heapFraction = (pages: number) => pages / SETUP.heapPages;

/** The fraction of the index a lane touches. About one percent either way. */
const PLAIN_INDEX_READ = INDEX_PAGES_READ / INDEX_SIZE.plainPages;
const COVERING_INDEX_READ = COVERING.pages / INDEX_SIZE.coveringPages;

/** 1,322 over 277. The same comparison on a key whose rows are already ordered. */
const CONTIGUOUS_RATIO = (CONTIGUOUS[0].pages / CONTIGUOUS[1].pages).toFixed(1);

/**
 * Shot 1. The index is already there and the query still reads the table.
 *
 * The index finishes almost immediately and the heap goes on lighting up for
 * another four seconds. That gap is the shot: the part everybody pictures was
 * never the expensive part.
 */
export const Fetch: React.FC = () => {
  const frame = useCurrentFrame();
  const probe = ramp(frame, 6, 16);
  const t = interpolate(frame, [26, 154], [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT.easing,
  });

  return (
    <>
      <Label top={292} opacity={ramp(frame, -6, 10)}>
        With an index · bitmap heap scan
      </Label>

      <Sql top={342} opacity={ramp(frame, -4, 10)} lines={[QUERY]} />
      <Sql
        top={396}
        opacity={probe * 0.8}
        lines={[`CREATE INDEX ON events (${LAYOUT.scattered.column});`]}
      />

      <IndexSlab
        strips={INDEX_STRIPS_PLAIN}
        read={PLAIN_INDEX_READ}
        glow={probe}
        opacity={ramp(frame, 2, 12)}
      />
      <Heap
        read={t * heapFraction(PLAIN.pages)}
        opacity={ramp(frame, 2, 12)}
      />

      <Readout top={956} size={62} weight={600}>
        {commas(counting(t, PLAIN.pages, 100))}
      </Readout>
      <Label top={1046} opacity={ramp(frame, 10, 12)}>
        pages read of {commas(SETUP.heapPages)}
      </Label>

      <Provenance top={1150} opacity={ramp(frame, 158, 28)}>
        pg_stats correlation: {LAYOUT.scattered.correlation} · rows removed by
        index recheck: 872,200
      </Provenance>
      <Provenance top={1196} opacity={ramp(frame, 190, 24)}>
        the index found all {commas(LAYOUT.scattered.matchingRows)} in{" "}
        {INDEX_PAGES_READ} page reads
      </Provenance>
    </>
  );
};

/**
 * Shot 2. The covering index.
 *
 * Same layout, same query, same position. This is the exception the playbook
 * allows for two shots sharing a layout: the comparison is the point and the
 * behaviour visibly differs. The slab thickens by the measured 3.3, the same
 * one percent band lights, and the heap never does.
 */
export const Covering: React.FC = () => {
  const frame = useCurrentFrame();
  const strips = interpolate(
    frame,
    [8, 46],
    [INDEX_STRIPS_PLAIN, INDEX_STRIPS_COVERING],
    { ...clamp, ...EASE_OUT },
  );
  const probe = ramp(frame, 52, 22);
  const t = interpolate(frame, [52, 120], [0, 1], { ...clamp, ...EASE_OUT });

  return (
    <>
      <Label top={292} opacity={ramp(frame, -6, 10)}>
        Carrying the answer · index only scan
      </Label>

      <Sql top={342} lines={[QUERY]} />
      <Sql
        top={396}
        opacity={ramp(frame, 4, 12)}
        lines={[
          `CREATE INDEX ON events (${LAYOUT.scattered.column}) INCLUDE (amount);`,
        ]}
      />

      <IndexSlab
        strips={strips}
        read={COVERING_INDEX_READ}
        glow={probe}
      />
      {/* Drawn, and never lit. The absence is the hero of this shot, so the
          field has to be present for the whole of it rather than removed. */}
      <Heap read={0} />

      <Readout top={956} size={62} weight={600}>
        {commas(counting(t, COVERING.pages, 1))}
      </Readout>
      <Label top={1046}>pages read of {commas(SETUP.heapPages)}</Label>

      <Provenance top={1150} opacity={ramp(frame, 124, 26)}>
        heap fetches: 0 · execution time: {COVERING.ms} ms
      </Provenance>
      <Provenance top={1196} opacity={ramp(frame, 160, 24)}>
        amount is on the leaf pages, so the answer never leaves the index
      </Provenance>
    </>
  );
};

/**
 * Shot 3. The catch.
 *
 * The stale fraction is 0.56 rather than the one percent of rows the `UPDATE`
 * touches, and that is the mechanism rather than an exaggeration. Ten million
 * rows over 123,457 pages is 81 rows a page, so dirtying every hundredth row
 * leaves 1 - 0.99^81, about 56 percent of pages, no longer all-visible. That is
 * why 70,103 pages come back and not seven hundred: an update spread thinly
 * over a table hits most of its pages. The derivation is in `learning-notes.md`.
 *
 * The refill is the fastest movement in the cut, 46 frames against the first
 * shot's 128. The other shots explain. This one is the floor going out.
 */
export const Stale: React.FC = () => {
  const frame = useCurrentFrame();
  const stale = ramp(frame, 14, 30) * 0.56;
  const t = interpolate(frame, [50, 96], [0, 1], { ...clamp, ...EASE_OUT });
  // Snapped to the exact figure once the refill finishes, the same way
  // `counting` does. Rounding unconditionally held the counter on 70,100 while
  // the payoff line said 70,103.
  //
  // The hundreds step only applies over a thousand. Applied all the way down it
  // rounded the shot's own starting value, 281, up to 300, so the shot opened
  // by contradicting the one before it for the fifty frames before the refill.
  const raw = interpolate(
    t,
    [0, 1],
    [COVERING.pages, STALE_VISIBILITY_MAP.stalePages],
    clamp,
  );
  const pages =
    t >= 1
      ? STALE_VISIBILITY_MAP.stalePages
      : raw < 1000
        ? Math.round(raw)
        : Math.round(raw / 100) * 100;

  return (
    <>
      <Label top={292} opacity={ramp(frame, -6, 10)}>
        The visibility map · same index
      </Label>

      <Sql top={342} lines={[QUERY]} />
      <Sql
        top={396}
        opacity={ramp(frame, 6, 12)}
        lines={["UPDATE events SET amount = amount + 1 WHERE id % 100 = 0;"]}
      />

      {/* Unchanged, and that is the claim. The index is exactly the object it
          was in the previous shot. */}
      <IndexSlab
        strips={INDEX_STRIPS_COVERING}
        read={COVERING_INDEX_READ}
        glow={1}
      />
      <Heap read={t * heapFraction(STALE_VISIBILITY_MAP.stalePages)} stale={stale} />

      <Readout top={956} size={62} weight={600}>
        {commas(pages)}
      </Readout>
      <Label top={1046}>pages read of {commas(SETUP.heapPages)}</Label>

      <Provenance top={1150} opacity={ramp(frame, 104, 26)}>
        the index did not change · vacuum did not run
      </Provenance>
      <Provenance top={1196} opacity={ramp(frame, 136, 24)}>
        one vacuum puts it back to {commas(STALE_VISIBILITY_MAP.afterVacuumPages)}{" "}
        pages
      </Provenance>
    </>
  );
};

const Row: React.FC<{
  top: number;
  cells: string[];
  opacity?: number;
  color?: string;
  weight?: number;
}> = ({ top, cells, opacity = 1, color = theme.colors.chalk, weight = 500 }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: (1080 - 800) / 2,
      width: 800,
      display: "grid",
      gridTemplateColumns: "1.15fr 0.85fr 0.6fr",
      alignItems: "baseline",
      opacity,
      fontFamily: theme.monoFamily,
      fontSize: 34,
      fontWeight: weight,
      fontVariantNumeric: "tabular-nums",
      color,
    }}
  >
    <span style={{ textAlign: "left" }}>{cells[0]}</span>
    <span style={{ textAlign: "right" }}>{cells[1]}</span>
    <span style={{ textAlign: "right" }}>{cells[2]}</span>
  </div>
);

/**
 * Shot 4. Verdict.
 *
 * The first row is VR01's sequential scan and it appears here only. This cut
 * does not re-teach it, and without it the other two rows are a comparison
 * between two indexes rather than the completion of the earlier one.
 */
export const Verdict: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <>
      <Label top={292} opacity={ramp(frame, -6, 10)}>
        Same query · same {commas(SETUP.rows)} rows
      </Label>

      <Row
        top={396}
        cells={["", "pages", "time"]}
        opacity={ramp(frame, 2, 10) * 0.72}
        color={theme.colors.gray}
      />
      <Row
        top={466}
        cells={["No index", commas(NO_INDEX.pages), `${NO_INDEX.ms} ms`]}
        opacity={ramp(frame, 12, 10)}
      />
      <Row
        top={532}
        cells={["Index", commas(PLAIN.pages), `${PLAIN.ms} ms`]}
        opacity={ramp(frame, 22, 10)}
      />
      <Row
        top={598}
        cells={["Covering index", commas(COVERING.pages), `${COVERING.ms} ms`]}
        opacity={ramp(frame, 32, 10)}
        color={ACCENT}
        weight={700}
      />

      <Headline
        top={760}
        size={172}
        color={ACCENT}
        opacity={ramp(frame, 42, 20)}
        dy={interpolate(ramp(frame, 42, 20), [0, 1], [18, 0])}
      >
        {PAGE_RATIO}×
      </Headline>

      <Label top={966} opacity={ramp(frame, 66, 14)}>
        Fewer pages, on the same machine
      </Label>

      <Provenance top={1150} opacity={ramp(frame, 86, 22)}>
        postgres {SETUP.postgres} · {commas(SETUP.rows)} rows · {SETUP.heapMb} mb
        · {commas(SETUP.heapPages)} pages · warm cache
      </Provenance>
    </>
  );
};

/**
 * The end card, and it is the cost.
 *
 * A cut that stops at 246x teaches people to put INCLUDE on everything. The two
 * receipts are the two things that would then bite them: the index is a second
 * copy of the column, and the win is a property of the correlation rather than
 * of the feature.
 */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const lockup = ramp(frame, 40, 20);

  return (
    <>
      {/* Broken by hand. Left to wrap, this lands "copy." alone on a second
          row and it sits on the receipt under it. */}
      <Punch top={330} size={62} opacity={ramp(frame, 0, 12)}>
        A covering index
        <br />
        is a second copy.
      </Punch>

      <Readout
        top={508}
        size={29}
        color={theme.colors.gray}
        opacity={ramp(frame, 10, 14)}
      >
        {INDEX_SIZE.plainMb} MB index becomes {INDEX_SIZE.coveringMb} MB
        <br />
        worth {CONTIGUOUS_RATIO}× on rows already in order, not {PAGE_RATIO}×
      </Readout>

      <Provenance top={648} opacity={ramp(frame, 20, 16)}>
        measured, not estimated · full run in the repo
      </Provenance>

      <div
        style={{
          position: "absolute",
          top: 830,
          left: 0,
          width: 1080,
          display: "flex",
          justifyContent: "center",
          opacity: lockup,
          transform: `translateY(${interpolate(lockup, [0, 1], [16, 0])}px)`,
        }}
      >
        <Lockup size={62} tone="black" stacked />
      </div>
    </>
  );
};
