import { interpolate } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT, ON_ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import { EASE_OUT } from "../../shared/video/motion";
import { DESCENT, commas } from "./measurements";

/**
 * One page read, drawn as the range it narrows to.
 *
 * The bar is the set of rows still possible when the read begins, cut into that
 * page's real fanout: 97 entries in the root, 285 in the internal page, 367 in
 * the leaf. One entry lights, and the next bar is that entry opened up to full
 * width. The descent is a repeated zoom, which is what a b-tree lookup
 * literally is, so the picture and the mechanism are the same thing.
 *
 * Below about four pixels a segment stops being a segment and the bar reads as
 * a solid rule, which is why the internal and leaf bars are drawn as a texture
 * with one lit entry rather than as 285 and 367 countable cells. The count is
 * on the label instead. Drawing 367 two-pixel boxes would claim a precision the
 * frame cannot deliver.
 */
export const BAR_WIDTH = 836;
export const BAR_HEIGHT = 44;
const LEFT = (1080 - BAR_WIDTH) / 2;

/** Which entry of each page the key happens to sit in. */
const CHOSEN = [0.47, 0.31, 0.64, 0];

const Bar: React.FC<{
  top: number;
  fanout: number;
  chosen: number;
  /** 0 to 1 as this page is read. */
  lit: number;
}> = ({ top, fanout, chosen, lit }) => {
  const pitch = BAR_WIDTH / fanout;
  const segment = Math.max(4, pitch - 1);
  const x = chosen * BAR_WIDTH;

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: LEFT,
        width: BAR_WIDTH,
        height: BAR_HEIGHT,
        borderRadius: 3,
        overflow: "hidden",
        background: `rgba(233, 228, 216, ${0.07 + lit * 0.05})`,
        // The comb reads as entries where the pitch allows and as an even
        // texture where it does not, which is the honest rendering of both.
        backgroundImage: `repeating-linear-gradient(90deg, rgba(233,228,216,${
          0.1 + lit * 0.12
        }) 0px, rgba(233,228,216,${0.1 + lit * 0.12}) ${Math.max(
          1,
          pitch - 1,
        )}px, rgba(0,0,0,0) ${Math.max(1, pitch - 1)}px, rgba(0,0,0,0) ${pitch}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: x,
          top: 0,
          width: segment,
          height: BAR_HEIGHT,
          background: ACCENT,
          opacity: lit,
        }}
      />
    </div>
  );
};

/** The guide lines that open one entry into the whole of the next bar. */
const Zoom: React.FC<{
  top: number;
  height: number;
  from: number;
  width: number;
  progress: number;
}> = ({ top, height, from, width, progress }) => {
  const a = LEFT + from * BAR_WIDTH;
  const b = a + width;

  // Faded in rather than drawn. These are guides showing that the next bar is
  // this entry opened up, not marks being made, and a drawn line implies an
  // event happening that the descent does not have room to explain.
  return (
    <svg
      style={{ position: "absolute", top, left: 0, opacity: progress * 0.45 }}
      width={1080}
      height={height}
    >
      <path
        d={`M${a} 0 L${LEFT} ${height}`}
        stroke={ACCENT}
        strokeWidth={1.5}
        fill="none"
      />
      <path
        d={`M${b} 0 L${LEFT + BAR_WIDTH} ${height}`}
        stroke={ACCENT}
        strokeWidth={1.5}
        fill="none"
      />
    </svg>
  );
};

const Caption: React.FC<{
  top: number;
  page: string;
  fanout: number;
  opacity: number;
}> = ({ top, page, fanout, opacity }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: LEFT,
      width: BAR_WIDTH,
      display: "flex",
      justifyContent: "space-between",
      opacity,
      fontFamily: theme.monoFamily,
      fontSize: 21,
      fontWeight: 500,
      letterSpacing: "0.1em",
      color: theme.colors.gray,
    }}
  >
    <span style={{ textTransform: "uppercase" }}>{page}</span>
    <span>{commas(fanout)} entries</span>
  </div>
);

/**
 * The three page reads and the row they land on.
 *
 * `step` runs from 0 to 4: one whole number per page read, and the fraction is
 * how far into that read the frame is.
 */
export const Tree: React.FC<{ top: number; step: number }> = ({
  top,
  step,
}) => {
  const rows = DESCENT.slice(0, 3);
  const pitch = 148;

  return (
    <>
      {rows.map((row, i) => {
        const lit = interpolate(step, [i, i + 0.55], [0, 1], {
          ...clamp,
          ...EASE_OUT,
        });
        const y = top + i * pitch;
        return (
          <div key={row.page}>
            <Caption
              top={y}
              page={`${i + 1}. ${row.page} page`}
              fanout={row.fanout}
              opacity={0.35 + lit * 0.65}
            />
            <Bar
              top={y + 34}
              fanout={row.fanout}
              chosen={CHOSEN[i]}
              lit={lit}
            />
            {i < 2 ? (
              <Zoom
                top={y + 34 + BAR_HEIGHT}
                height={pitch - 34 - BAR_HEIGHT}
                from={CHOSEN[i]}
                width={Math.max(4, BAR_WIDTH / row.fanout - 1)}
                progress={interpolate(step, [i + 0.5, i + 1], [0, 1], clamp)}
              />
            ) : null}
          </div>
        );
      })}

      {/* The heap fetch. The only thing in the shot that is a row rather than
          a page, so it is the only thing drawn as one. */}
      <Heap
        top={top + 3 * pitch}
        lit={interpolate(step, [3, 3.5], [0, 1], { ...clamp, ...EASE_OUT })}
      />
    </>
  );
};

const Heap: React.FC<{ top: number; lit: number }> = ({ top, lit }) => (
  <>
    <div
      style={{
        position: "absolute",
        top,
        left: LEFT,
        width: BAR_WIDTH,
        opacity: 0.35 + lit * 0.65,
        fontFamily: theme.monoFamily,
        fontSize: 21,
        fontWeight: 500,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: theme.colors.gray,
      }}
    >
      4. the row
    </div>
    <div
      style={{
        position: "absolute",
        top: top + 34,
        left: LEFT,
        width: BAR_WIDTH,
        height: BAR_HEIGHT,
        borderRadius: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: ACCENT,
        opacity: lit,
        fontFamily: theme.monoFamily,
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: "0.04em",
        color: ON_ACCENT,
      }}
    >
      user_id = 8675309
    </div>
  </>
);
