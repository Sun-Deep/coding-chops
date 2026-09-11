import { interpolate } from "remotion";
import { theme } from "../../shared/brand/theme";
import { clamp } from "../../shared/video/timing";
import { ACCENT } from "../../shared/vertical/palette";
import { NODE_Y, SVG_H, nodeX } from "./AttentionField";
import { TEMPLATED } from "./measurements";

/**
 * The message becoming the row the rest of the cut is built on.
 *
 * The six tokens the viewer typed lift out of the chat bubble, fly down, and
 * land in their slots. Then the nineteen the template added fill in around
 * them, and the row is complete at exactly the positions shot 2 opens on, so
 * the cut moves from the interface into the network without a jump.
 *
 * This replaced a static wall of chips on 2026-09-11. The chips carried the
 * same information and nothing crossed the frame, which is the failure the
 * playbook names when it says to build objects rather than readouts.
 *
 * Text rides the flight and drops away on landing. Twenty-five labels will not
 * fit at a 35 pixel pitch and `<|im_start|>` will not fit at any pitch, so the
 * row ends as marks and a receipt underneath names a few of them with their
 * ids. Shrinking the type until it technically fitted would have been a chart
 * nobody can read rather than an object anybody can.
 */

const OWN = TEMPLATED.map((p, i) => ({ ...p, index: i })).filter((p) => p.own);
const CHIP_FONT = 22;
/**
 * Where the six start, relative to the row they are flying to.
 *
 * Negative because the chat window sits above the network now and stays there.
 * The six lift off the question bubble, which is right aligned, so the pack is
 * right aligned to match rather than centred: a token has to leave from the
 * word it is.
 */
const SOURCE_Y = -222;
const PACK_RIGHT = 906;

/** Rough advance width of the mono face at the flight size, plus padding. */
const chipWidth = (text: string) => text.length * (CHIP_FONT * 0.6) + 22;

/**
 * Template tokens fill outward from the middle, so the six the viewer typed
 * stay legible for as long as possible while the row completes around them.
 *
 * Computed once. The first version worked this out inside the render for every
 * token on every frame, which is nineteen sorts a frame for an answer that
 * never changes.
 */
const TEMPLATE_RANK = (() => {
  const mid = TEMPLATED.length / 2;
  const order = TEMPLATED.map((p, k) => ({ k, own: p.own, d: Math.abs(k - mid) }))
    .filter((p) => !p.own)
    .sort((a, b) => a.d - b.d)
    .map((p) => p.k);
  const rank = new Map<number, number>();
  order.forEach((k, r) => rank.set(k, r));
  return rank;
})();

/** Where the six sit while they are still a sentence, packed and centred. */
const packX = (() => {
  const widths = OWN.map((p) => chipWidth(p.text));
  const total = widths.reduce((a, b) => a + b, 0) + (OWN.length - 1) * 8;
  let x = PACK_RIGHT - total;
  return widths.map((w) => {
    const at = x + w / 2;
    x += w + 8;
    return at;
  });
})();

export const TokenArrival: React.FC<{
  top: number;
  /** 0 to 1, the six leaving the bubble and travelling to their slots. */
  fly: number;
  /** 0 to 1, the nineteen the template added filling in. */
  template: number;
  opacity?: number;
}> = ({ top, fly, template, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 0,
      width: 1080,
      height: SVG_H,
      opacity,
    }}
  >
    {TEMPLATED.map((p, i) => {
      const own = p.own;
      const ownIndex = OWN.findIndex((o) => o.index === i);

      // Each of the six leaves a little after the one before it, so the
      // sentence comes apart left to right instead of all at once.
      const t = own
        ? interpolate(fly * (OWN.length + 2.5) - ownIndex, [0, 2.6], [0, 1], clamp)
        : 1;

      const x = own
        ? interpolate(t, [0, 1], [packX[ownIndex], nodeX(i)])
        : nodeX(i);
      const y = own ? interpolate(t, [0, 1], [SOURCE_Y, NODE_Y]) : NODE_Y;

      // Text is legible for the whole flight and drops away as it lands. The
      // first version faded it from 55 percent of the travel, so the words were
      // anonymous bars before they were halfway down and the one thing the shot
      // is for, reading your own sentence come apart, never happened.
      // Invisible until its own token lifts, so the chip never sits on top of
      // the bubble text it came from. At [0.82, 1] every chip was drawn at full
      // opacity from frame zero and the opening showed the sentence twice, once
      // as prose and once as chips, in two different faces.
      const label = own
        ? interpolate(t, [0.02, 0.18, 0.82, 1], [0, 1, 1, 0], clamp)
        : 0;
      const mark = own
        ? interpolate(t, [0.86, 1], [0, 1], clamp)
        : interpolate(
            template * (TEMPLATED.length - OWN.length) -
              (TEMPLATE_RANK.get(i) ?? 0),
            [0, 1.4],
            [0, 1],
            clamp,
          );

      return (
        <div key={i}>
          <div
            style={{
              position: "absolute",
              left: x - 3,
              top: y - 9,
              width: 6,
              height: 18,
              borderRadius: 1.5,
              background: own ? ACCENT : "#E9E4D8",
              opacity: mark * (own ? 0.95 : 0.34),
            }}
          />
          {label > 0 ? (
            <div
              style={{
                position: "absolute",
                left: x - chipWidth(p.text) / 2,
                top: y - 20,
                width: chipWidth(p.text),
                textAlign: "center",
                opacity: label,
                fontFamily: theme.monoFamily,
                fontSize: CHIP_FONT,
                fontWeight: 500,
                whiteSpace: "pre",
                color: theme.colors.chalk,
              }}
            >
              {p.text}
            </div>
          ) : null}
        </div>
      );
    })}
  </div>
);
