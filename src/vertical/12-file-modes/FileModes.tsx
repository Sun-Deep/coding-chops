import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { clamp } from "../../shared/video/timing";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow } from "../../shared/vertical/type";
import {
  dialAt,
  listedBy,
  READBACK_FROM,
  READBACK_STEP,
  TOTAL_FROM,
} from "./beats";
import {
  COLUMN_LEFT,
  COLUMN_WIDTH,
  LIST_ROW,
  LIST_TOP,
  TOTAL_TOP,
} from "./layout";
import { SCAN, TOP_FOUR_SHARE, TOP_MODES, TOTAL_MODES } from "./measurements";
import { Lock } from "./Lock";
import { symbolicOf } from "./modes";

/**
 * The headline is the command, and it is live.
 *
 * Frame zero is `chmod 755` in the largest type in the frame, which is the
 * thing every cut this channel has published above 275,000 views does. It is
 * also the string a viewer has typed themselves, which is the whole reason this
 * topic was picked, and it keeps up with the dials rather than sitting over
 * them as a caption.
 */
const Command: React.FC<{ mode: string }> = ({ mode }) => (
  <div
    style={{
      position: "absolute",
      top: 280,
      left: 0,
      width: 1080,
      textAlign: "center",
      fontFamily: theme.monoFamily,
      fontSize: 78,
      fontWeight: 700,
      letterSpacing: "-0.02em",
      color: theme.colors.chalk,
      fontVariantNumeric: "tabular-nums",
    }}
  >
    chmod <span style={{ color: ACCENT }}>{mode}</span>
  </div>
);

/** The four a real disk carries, landing one at a time as the dials reach them. */
const ModeList: React.FC<{ shown: number }> = ({ shown }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {TOP_MODES.map((row, i) => {
        const on = i < shown;
        // Once all four are down they are read back in turn, so the closing
        // seconds carry the reference rather than holding a still frame.
        const read = interpolate(
          frame,
          [
            READBACK_FROM + i * READBACK_STEP,
            READBACK_FROM + i * READBACK_STEP + 7,
            READBACK_FROM + i * READBACK_STEP + 26,
          ],
          [0, 1, 0.35],
          clamp,
        );
        return (
          <div
            key={row.mode}
            style={{
              position: "absolute",
              top: LIST_TOP + i * LIST_ROW,
              left: COLUMN_LEFT,
              width: COLUMN_WIDTH,
              height: LIST_ROW - 12,
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "0 22px",
              boxSizing: "border-box",
              borderRadius: 14,
              opacity: on ? 1 : 0.22,
              background: on
                ? `rgba(${20 + read * 26}, ${25 + read * 20}, ${32 + read * 12}, 1)`
                : "#0D1116",
              border: `1px solid ${
                on
                  ? `rgba(255, 122, 51, ${0.13 + read * 0.7})`
                  : "rgba(255,255,255,0.05)"
              }`,
              transform: `translateX(${read * 8}px)`,
              fontFamily: theme.monoFamily,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span
              style={{
                fontSize: 38,
                fontWeight: 700,
                color: on ? ACCENT : theme.colors.grayDark,
                width: 96,
              }}
            >
              {row.mode}
            </span>
            <span
              style={{
                fontSize: 27,
                fontWeight: 500,
                color: theme.colors.grayDark,
                width: 168,
              }}
            >
              {symbolicOf(row.mode)}
            </span>
            <span
              style={{
                flex: 1,
                fontSize: 23,
                fontWeight: 500,
                whiteSpace: "nowrap",
                color: theme.colors.chalk,
              }}
            >
              {row.label}
            </span>
            <span
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: theme.colors.chalk,
              }}
            >
              {row.share}%
            </span>
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          top: TOTAL_TOP,
          left: COLUMN_LEFT,
          width: COLUMN_WIDTH,
          textAlign: "center",
          opacity: interpolate(
            frame,
            [TOTAL_FROM, TOTAL_FROM + 12],
            [0, 1],
            clamp,
          ),
          fontFamily: theme.monoFamily,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: theme.colors.grayDark,
        }}
      >
        {TOTAL_MODES} POSSIBLE ·{" "}
        <span style={{ color: ACCENT }}>FOUR COVER {TOP_FOUR_SHARE}%</span> OF{" "}
        {SCAN.files.toLocaleString()} FILES
      </div>
    </>
  );
};

/**
 * chmod, as the combination lock it actually is.
 *
 * Three digits dialled onto a file, each digit three tumblers worth 4, 2 and 1,
 * and the digit is the sum of the ones that are on. That is the whole
 * mechanism and it is the thing almost nobody who types `755` has ever been
 * shown, which is what the first half is for.
 *
 * Then the dials run through the four modes a real disk carries and each lands
 * in a list, so the cut leaves a reference behind as well as an explanation.
 * Section 1 of the playbook says the two shapes that carry this page are a
 * search space collapsing and a reference somebody wants to keep; 512 down to
 * four is both of them at once.
 */
export const FileModes: React.FC = () => {
  const frame = useCurrentFrame();
  const { mode } = dialAt(frame);
  return (
    <>
      <Eyebrow top={240}>File permissions</Eyebrow>
      <Command mode={mode} />
      <Lock />
      <ModeList shown={listedBy(frame)} />
    </>
  );
};
