import { interpolate } from "remotion";
import { theme } from "../../shared/brand/theme";
import { clamp } from "../../shared/video/timing";
import { ACCENT } from "../../shared/vertical/palette";
import { MODEL } from "./measurements";

/**
 * The three objects the interior of the cut is made of, drawn as three
 * different forms because they mean three different things.
 *
 * Tokens are chips, because a token is a discrete piece of text with an id and
 * that is what a tokenizer viewer shows. The stack is a grid, because the thing
 * worth seeing is that every token crosses every layer. The cache is a strip
 * that only ever grows, because that is its entire behaviour.
 */

export const STAGE_TOP = 350;
export const STAGE_BOTTOM = 930;

/* ------------------------------------------------------------------ tokens */

export type Piece = { text: string; id: number; fromTemplate: boolean };

/**
 * The tokenized prompt, as chips.
 *
 * Leading spaces are drawn as a visible gap inside the chip rather than
 * stripped, because `' is'` carrying its space is the thing that makes a token
 * not a word, and stripping it would make six becoming twenty-five look
 * arbitrary.
 *
 * Template tokens are dimmer than the question's own. The shot is about the
 * difference between what was typed and what arrived, so the two have to be
 * told apart at a glance.
 */
export const Tokens: React.FC<{
  top: number;
  pieces: readonly Piece[];
  /** 0 to 1, how many of the question's own chips have appeared. */
  ownReveal: number;
  /** 0 to 1, how many of the template's chips have appeared. */
  templateReveal: number;
  opacity?: number;
}> = ({ top, pieces, ownReveal, templateReveal, opacity = 1 }) => {
  // Each chip is staggered inside its own group, so the six the viewer typed
  // can land first and the nineteen the template added can arrive around them.
  // That order is the whole shot; a single left-to-right reveal would bury it.
  const ownCount = pieces.filter((p) => !p.fromTemplate).length;
  const templateCount = pieces.length - ownCount;
  let ownSeen = 0;
  let templateSeen = 0;

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 96,
        width: 888,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignContent: "flex-start",
        gap: 8,
        opacity,
      }}
    >
      {pieces.map((p, i) => {
        const own = !p.fromTemplate;
        const index = own ? ownSeen++ : templateSeen++;
        const total = own ? ownCount : templateCount;
        const reveal = own ? ownReveal : templateReveal;
        const on = interpolate(reveal * total - index, [0, 1], [0, 1], clamp);

        return (
          <div
            key={i}
            style={{
              opacity: on,
              transform: `translateY(${interpolate(on, [0, 1], [8, 0])}px)`,
              padding: "7px 11px 6px",
              borderRadius: 7,
              background: own
                ? "rgba(240,110,42,0.16)"
                : "rgba(233,228,216,0.06)",
              border: `1px solid ${own ? "rgba(240,110,42,0.5)" : "rgba(233,228,216,0.14)"}`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: theme.monoFamily,
                fontSize: 22,
                fontWeight: 500,
                color: own ? theme.colors.chalk : theme.colors.grayLight,
                whiteSpace: "pre",
              }}
            >
              {p.text}
            </div>
            <div
              style={{
                fontFamily: theme.monoFamily,
                fontSize: 13,
                marginTop: 2,
                color: own ? ACCENT : theme.colors.grayDark,
              }}
            >
              {p.id}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------- stack */

const STACK_COLS = 25;
const COL_PITCH = 26;
const COL_W = 19;
const ROW_PITCH = 13;
const ROW_H = 8;

export const STACK_WIDTH = STACK_COLS * COL_PITCH - (COL_PITCH - COL_W);
export const STACK_HEIGHT = MODEL.layers * ROW_PITCH - (ROW_PITCH - ROW_H);

/**
 * Twenty-five columns crossing thirty-six layers.
 *
 * Thirty-six is `n_layer`, measured, not a number chosen because it looked
 * right. Twenty-five is the templated token count. Both are the figures the
 * narration says out loud, so the picture and the words cannot disagree.
 *
 * `rise` runs a front from the bottom to the top. `keep` then dims every column
 * but the last, which is the shot's first real event: only the final position
 * produces anything used for the next token.
 *
 * Nothing inside a block is drawn. No normalisation, no feed-forward, no
 * residuals. A block is a block, and the moment this starts teaching what is
 * inside one the cut is a tour rather than a claim.
 */
export const Stack: React.FC<{
  top: number;
  /** 0 to 1, the activation front travelling up. */
  rise: number;
  /** 0 to 1, how far the all-but-last columns have dimmed. */
  keep?: number;
  /** Draw a single column instead of all of them, for the decode shot. */
  single?: boolean;
  /** Where the column sits. Defaults to centred. */
  left?: number;
  /** Row sizing, so the decode shot can run a shorter stack beside a cache. */
  rowPitch?: number;
  rowH?: number;
  opacity?: number;
}> = ({
  top,
  rise,
  keep = 0,
  single = false,
  left,
  rowPitch = ROW_PITCH,
  rowH = ROW_H,
  opacity = 1,
}) => {
  const cols = single ? 1 : STACK_COLS;
  const width = single ? COL_W : STACK_WIDTH;

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: left ?? (1080 - width) / 2,
        width,
        height: MODEL.layers * rowPitch - (rowPitch - rowH),
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${COL_W}px)`,
        gridAutoRows: `${rowH}px`,
        columnGap: COL_PITCH - COL_W,
        rowGap: rowPitch - rowH,
        opacity,
      }}
    >
      {Array.from({ length: cols * MODEL.layers }, (_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        // Row 0 is the top of the grid and the front travels upward, so the
        // front's position is measured from the bottom.
        const fromBottom = MODEL.layers - 1 - row;
        const behind = rise * MODEL.layers - fromBottom;
        const lit = interpolate(behind, [0, 1.6], [0, 1], clamp);
        // A leading edge, so the front reads as something travelling rather
        // than as a block filling in. Without it the whole stack is one flat
        // texture two seconds in and there is nothing to watch.
        const edge = interpolate(behind, [0, 3.5], [1, 0], clamp) * lit;

        const isLast = col === cols - 1;
        const dim = isLast ? 0 : keep;
        const level =
          (0.08 + lit * 0.3 + edge * 0.45) * (1 - dim * 0.86) + dim * 0.05;

        return (
          <div
            key={i}
            style={{
              borderRadius: 1.5,
              background:
                isLast && keep > 0.4 && lit > 0.5
                  ? ACCENT
                  : `rgba(233, 228, 216, ${level})`,
            }}
          />
        );
      })}
    </div>
  );
};

/* -------------------------------------------------------------- vocabulary */

const VOCAB_COLS = 64;
const VOCAB_ROWS = 14;
const VOCAB_MARKS = VOCAB_COLS * VOCAB_ROWS;

/**
 * The vocabulary being scored, then collapsing.
 *
 * 896 marks stand for 151,936 entries, which is a scale the frame cannot hold
 * one to one. The number is on screen beside it for exactly that reason: the
 * field says "an enormous number of them" and the label says which enormous
 * number, and neither pretends to be the other.
 */
export const Vocabulary: React.FC<{
  top: number;
  /** 0 to 1, the field arriving. */
  arrive: number;
  /** 0 to 1, everything dimming except the survivors. */
  collapse: number;
  opacity?: number;
}> = ({ top, arrive, collapse, opacity = 1 }) => {
  const width = VOCAB_COLS * 11 - 3;

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: (1080 - width) / 2,
        width,
        display: "grid",
        gridTemplateColumns: `repeat(${VOCAB_COLS}, 8px)`,
        gridAutoRows: "8px",
        gap: 3,
        opacity,
      }}
    >
      {Array.from({ length: VOCAB_MARKS }, (_, i) => {
        const x = Math.sin(i * 12.9898) * 43758.5453;
        const rank = x - Math.floor(x);
        const on = interpolate(arrive * 1.4 - rank * 0.4, [0, 1], [0, 1], clamp);
        // The five that survive are a fixed scatter, so the eye can follow them
        // out of the field rather than losing them.
        const survives = rank > 0.9944;

        // Survivors grow and brighten while everything else goes out. The first
        // version left them the same eight pixels as the 890 marks around them,
        // so the collapse the whole shot builds to registered as a few dots
        // getting slightly oranger.
        const grow = survives ? 1 + collapse * 1.9 : 1;
        const level = survives ? 0.3 + collapse * 0.7 : 0.22 * (1 - collapse);

        return (
          <div
            key={i}
            style={{
              borderRadius: 1,
              opacity: on,
              transform: `scale(${grow})`,
              background: survives
                ? `rgba(240,110,42,${level})`
                : `rgba(233,228,216,${level})`,
            }}
          />
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------- cache */

/**
 * The KV cache, as a strip that only grows.
 *
 * It widens by one slot per generated token and lights across its whole width
 * every time the stack runs, which is the difference the cut exists to draw:
 * attention reads every stored position, and the compute is still one token
 * wide.
 */
export const CACHE_SLOT = 11;
export const CACHE_GAP = 3;
export const CACHE_MAX_WIDTH = 820;
export const CACHE_LEFT = (1080 - CACHE_MAX_WIDTH) / 2;

/** How many slots actually fit, so the strip cannot run off the frame. */
export const cacheShown = (slots: number) =>
  Math.min(slots, Math.floor(CACHE_MAX_WIDTH / (CACHE_SLOT + CACHE_GAP)));

/**
 * The x of the strip's growing right hand end.
 *
 * The decode column stands here, because the newest token is at the end of the
 * sequence and not in the middle of the frame. The first version pinned the
 * column to the strip's full width, so it floated in empty space a long way
 * right of where the strip actually ended.
 */
export const cacheRightEdge = (slots: number) =>
  CACHE_LEFT + cacheShown(slots) * (CACHE_SLOT + CACHE_GAP) - CACHE_GAP;

export const Cache: React.FC<{
  top: number;
  /** How many slots exist. */
  slots: number;
  /** 0 to 1, how lit the whole strip is on this pass. */
  read: number;
  opacity?: number;
}> = ({ top, slots, read, opacity = 1 }) => {
  const SLOT = CACHE_SLOT;
  const GAP = CACHE_GAP;
  const HEIGHT = 26;
  const width = CACHE_MAX_WIDTH;
  const shown = cacheShown(slots);

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: CACHE_LEFT,
        width,
        height: HEIGHT,
        display: "flex",
        gap: GAP,
        opacity,
      }}
    >
      {Array.from({ length: shown }, (_, i) => (
        <div
          key={i}
          style={{
            width: SLOT,
            height: HEIGHT,
            borderRadius: 2,
            background: `rgba(233,228,216,${0.14 + read * 0.42})`,
          }}
        />
      ))}
    </div>
  );
};
