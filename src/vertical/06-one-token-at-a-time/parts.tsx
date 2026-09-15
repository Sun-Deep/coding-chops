import { interpolate } from "remotion";
import { theme } from "../../shared/brand/theme";
import { clamp } from "../../shared/video/timing";
import { ACCENT } from "../../shared/vertical/palette";

/**
 * The three objects the interior of the cut is made of, drawn as three
 * different forms because they mean three different things.
 *
 * Tokens are chips, because a token is a discrete piece of text with an id and
 * that is what a tokenizer viewer shows. The vocabulary is a field, because the
 * only honest thing to say about 151,936 candidates in one frame is that there
 * are an enormous number of them.
 *
 * The stack grid and the cache strip that used to live here are gone. They drew
 * thirty-six layers as squares and the context as a bar, and both were replaced
 * on 2026-09-11 by the attention field and the generation fan, which draw the
 * same two things as measured connections.
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
        const on = interpolate(
          arrive * 1.4 - rank * 0.4,
          [0, 1],
          [0, 1],
          clamp,
        );
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
