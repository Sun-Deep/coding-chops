import { interpolate } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import { INDEX_SIZE, SETUP } from "./measurements";

/**
 * The two objects this cut is made of, and they are deliberately not the same
 * object.
 *
 * The heap is a field of tiles, one per 193 pages. The index is a slab of
 * strips standing above it. Section 4 of the playbook is explicit that two
 * things meaning different things get drawn as different forms, and here the
 * whole argument turns on the difference: the index is small, ordered and
 * cheap to walk, and the heap is large and, for a scattered key, visited
 * almost everywhere.
 *
 * The tile field is the same material treatment VR01 used for the same table,
 * which is intended. This cut is VR01's third lane and the viewer who saw the
 * first one should recognise the table on sight. The granularity is not the
 * same: VR01's tiles were ten thousand rows each because that shot was about a
 * sweep crossing rows, and these are pages, because this shot is about which
 * pages get read.
 */

export const COLUMNS = 40;
export const HEAP_ROWS = 16;
export const HEAP_TILES = COLUMNS * HEAP_ROWS;
export const PITCH = 19;
export const TILE = 15;

export const FIELD_WIDTH = COLUMNS * PITCH - (PITCH - TILE);
export const FIELD_LEFT = (1080 - FIELD_WIDTH) / 2;

/** Pages of heap per tile, which is what makes the lit fraction a measurement. */
export const PAGES_PER_TILE = SETUP.heapPages / HEAP_TILES;

/**
 * How tall the index slab is drawn, in strips.
 *
 * The ratio is the measured one. 66 MB against 215 MB is 3.3, and three strips
 * against ten is 3.33, so the growth in shot two is the disk cost to scale
 * rather than an emphasis.
 */
export const INDEX_STRIPS_PLAIN = 3;
export const INDEX_STRIPS_COVERING = Math.round(
  INDEX_STRIPS_PLAIN * INDEX_SIZE.growth,
);

/**
 * The index draws at its own pitch, tighter than the heap's.
 *
 * Not a style choice. At the heap's pitch a ten strip slab is 186 tall and
 * collides with the query above it, and moving the query is worse: it is the
 * one thing on screen that must not move between the three shots being
 * compared.
 */
export const INDEX_PITCH = 13;
export const INDEX_TILE = 10;
export const INDEX_MAX_HEIGHT =
  INDEX_STRIPS_COVERING * INDEX_PITCH - (INDEX_PITCH - INDEX_TILE);

/** The block's fixed anchors, held across all three field shots. */
export const INDEX_BOTTOM = 582;
export const HEAP_TOP = 626;
export const HEAP_HEIGHT = HEAP_ROWS * PITCH - (PITCH - TILE);

/**
 * A stable pseudo-random rank in [0, 1) per tile.
 *
 * The fill order has to look scattered rather than swept, because scatter is
 * the mechanism: `pg_stats` reports correlation 0.006 on `cust_id`, so one
 * customer's rows are spread across the whole table and the fetches land
 * everywhere at once. A left to right fill would draw the contiguous key by
 * mistake, which is the other half of the measurement and the opposite claim.
 *
 * Two independent ranks per tile, so the pages an `UPDATE` dirties are not the
 * same pages the query reads first.
 *
 * A full avalanche hash rather than the usual `sin` trick. `sin` correlates
 * across neighbouring indices, and on a forty column grid that correlation
 * lands as diagonal banding: the field reads as a pattern, which is the one
 * thing scatter must not look like.
 */
const rank = (i: number, salt: number) => {
  let x = (Math.imul(i, 2654435761) + salt) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 2246822519);
  x ^= x >>> 13;
  x = Math.imul(x, 3266489917);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
};

const FETCH_SALT = 0x9e3779b9;
const STALE_SALT = 0x85ebca6b;

/**
 * The heap.
 *
 * `read` is the fraction of the table's pages this query has touched, straight
 * out of `Buffers: shared`. `stale` is the fraction the visibility map no
 * longer marks all-visible.
 */
export const Heap: React.FC<{
  /** 0 to 1, the fraction of heap pages read. */
  read: number;
  /** 0 to 1, the fraction of pages an UPDATE has dirtied. */
  stale?: number;
  opacity?: number;
}> = ({ read, stale = 0, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      top: HEAP_TOP,
      left: FIELD_LEFT,
      width: FIELD_WIDTH,
      height: HEAP_HEIGHT,
      display: "grid",
      gridTemplateColumns: `repeat(${COLUMNS}, ${TILE}px)`,
      gap: PITCH - TILE,
      opacity,
    }}
  >
    {Array.from({ length: HEAP_TILES }, (_, i) => {
      const isRead = rank(i, FETCH_SALT) < read;
      const isStale = rank(i, STALE_SALT) < stale;

      // The accent marks where the answer is being found, and the whole cut is
      // that place moving out of the heap and back into it. Stale is a dim
      // outline instead, because a page losing its all-visible bit is a change
      // in what is known about it, not a change in the page, so it must not
      // read as another kind of read.
      return (
        <div
          key={i}
          style={{
            height: TILE,
            borderRadius: 2,
            background: isRead ? ACCENT : `rgba(233, 228, 216, 0.09)`,
            boxShadow:
              isStale && !isRead
                ? `inset 0 0 0 1.5px rgba(233, 228, 216, 0.34)`
                : undefined,
          }}
        />
      );
    })}
  </div>
);

/**
 * The index, as a slab of strips, bottom anchored so it grows upward.
 *
 * Bottom anchored because the heap below it must not move when the index gets
 * taller in shot two. A layout that shifts between two shots whose whole
 * purpose is to be compared costs the comparison.
 *
 * Every strip is always rendered and the extra ones are faded in, so `strips`
 * can be a fraction and the growth is continuous. Rounding it would make the
 * slab jump seven times on its way up.
 *
 * `read` is the fraction of the index actually touched and it is genuinely
 * tiny: 88 pages of 8,468 on the plain index, 281 of 27,460 on the covering
 * one. Both are about one percent, and drawing them as one percent is the
 * point. The index does the same small amount of work in both shots. The only
 * thing that changes is whether the heap below has to do any.
 */
export const IndexSlab: React.FC<{
  /** How many strips tall, fractional during the growth. */
  strips: number;
  /** 0 to 1, the fraction of the index's own pages read. */
  read: number;
  /** 0 to 1, how lit the read band is. */
  glow?: number;
  opacity?: number;
}> = ({ strips, read, glow = 1, opacity = 1 }) => {
  const cells = COLUMNS * INDEX_STRIPS_COVERING;
  // Where the entries for this key sit. Fixed, so the band is in the same place
  // in both shots and the viewer compares like with like.
  const bandFrom = 0.34;
  const bandWidth = Math.max(1 / COLUMNS, read);

  return (
    <div
      style={{
        position: "absolute",
        top: INDEX_BOTTOM - INDEX_MAX_HEIGHT,
        left: FIELD_LEFT,
        width: FIELD_WIDTH,
        height: INDEX_MAX_HEIGHT,
        display: "grid",
        gridTemplateColumns: `repeat(${COLUMNS}, ${INDEX_TILE}px)`,
        gridAutoRows: `${INDEX_TILE}px`,
        gap: INDEX_PITCH - INDEX_TILE,
        opacity,
      }}
    >
      {Array.from({ length: cells }, (_, i) => {
        const row = Math.floor(i / COLUMNS);
        const fromBottom = INDEX_STRIPS_COVERING - 1 - row;
        // The strip exists once the slab has grown past it. A soft edge over
        // one strip, so the growth reads as the index thickening rather than
        // as rows switching on.
        const exists = interpolate(strips - fromBottom, [0, 1], [0, 1], clamp);

        const across = (i % COLUMNS) / COLUMNS;
        const inBand = across >= bandFrom && across < bandFrom + bandWidth;
        const lit = inBand ? glow : 0;

        return (
          <div
            key={i}
            style={{
              borderRadius: 2,
              opacity: exists,
              background: lit
                ? ACCENT
                : `rgba(233, 228, 216, ${0.13 + 0.05 * (fromBottom < INDEX_STRIPS_PLAIN ? 1 : 0)})`,
            }}
          />
        );
      })}
    </div>
  );
};

/** The query, held above the block in the material it was typed in. */
export const Sql: React.FC<{ top: number; opacity?: number; lines: string[] }> =
  ({ top, opacity = 1, lines }) => (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        width: 1080,
        textAlign: "center",
        opacity,
        fontFamily: theme.monoFamily,
        fontSize: 26,
        fontWeight: 500,
        lineHeight: 1.44,
        letterSpacing: "-0.01em",
        color: theme.colors.grayDark,
        whiteSpace: "pre",
      }}
    >
      {lines.join("\n")}
    </div>
  );
