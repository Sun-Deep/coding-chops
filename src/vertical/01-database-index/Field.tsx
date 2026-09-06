import { interpolate } from "remotion";
import { ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import { SETUP } from "./measurements";

/**
 * The table, as one tile per ten thousand rows.
 *
 * A thousand tiles rather than a symbolic handful, because the whole point of
 * the shot is that the sweep has to cross all of them and that takes visibly
 * too long. Six tiles standing in for ten million rows would make the seq scan
 * look like a reasonable thing to do.
 *
 * The tile the match lives in is not chosen for composition. `user_id` 8675309
 * out of ten million lands 86.75 percent of the way through the table, which
 * puts it in tile 867, near the end of the sweep. That is why the scan feels
 * long before anything is found.
 */
export const COLUMNS = 40;
export const ROWS = 25;
export const TILES = COLUMNS * ROWS;
export const PITCH = 21;
export const TILE = 17;
export const FIELD_WIDTH = COLUMNS * PITCH - (PITCH - TILE);
export const FIELD_HEIGHT = ROWS * PITCH - (PITCH - TILE);

export const MATCH_TILE = Math.floor((Number(SETUP.key) / SETUP.rows) * TILES);

/** How wide the leading edge of the sweep is, in tiles. */
const EDGE = 26;

export const Field: React.FC<{
  top: number;
  /** 0 to 1 across the sweep. */
  progress: number;
  /** 0 to 1 as the matching tile comes up. */
  match?: number;
  opacity?: number;
}> = ({ top, progress, match = 0, opacity = 1 }) => {
  const readTo = progress * TILES;
  // The leading edge has to stop existing once the sweep does, or the last
  // couple of rows stay brighter than the rest forever and the finished field
  // reads as unevenly scanned rather than as entirely scanned.
  const edgeStrength = interpolate(progress, [0.93, 1], [1, 0], clamp);

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: (1080 - FIELD_WIDTH) / 2,
        width: FIELD_WIDTH,
        height: FIELD_HEIGHT,
        display: "grid",
        gridTemplateColumns: `repeat(${COLUMNS}, ${TILE}px)`,
        gap: PITCH - TILE,
        opacity,
      }}
    >
      {Array.from({ length: TILES }, (_, i) => {
        // Behind the edge the tile is read; at the edge it is being read. The
        // brightness carries which, so the sweep needs no separate marker.
        const behind = readTo - i;
        const edge = interpolate(behind, [0, EDGE], [1, 0], clamp);
        const read = behind > 0 ? 1 : 0;
        const level = 0.09 + read * 0.17 + edge * read * 0.52 * edgeStrength;
        const found = i === MATCH_TILE ? match : 0;

        return (
          <div
            key={i}
            style={{
              height: TILE,
              borderRadius: 2,
              background: found > 0 ? ACCENT : `rgba(233, 228, 216, ${level})`,
              opacity: found > 0 ? 0.35 + found * 0.65 : 1,
            }}
          />
        );
      })}
    </div>
  );
};
