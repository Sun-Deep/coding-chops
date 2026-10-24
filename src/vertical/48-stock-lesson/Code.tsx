import { interpolate } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import { B, T } from "./clock";
import { RUN } from "./measurements";

/**
 * The code, changing with what is being said: the prices, then every pair
 * while the arcs are drawn, the prices again for the trick, then the one
 * pass while the walker walks it, the line running lit and the two values
 * it carries in the header. For time and space, every pair comes back
 * beside its O(n²), then the one pass beside its O(n) and O(1).
 *
 * Both loops are the ones `scripts/measure-stock.mjs` runs, without the
 * lines that count pairs and steps.
 */

export const CODE_TOP = 420;
export const CODE_H = 282;
const LEFT = 96;
const WIDTH = 888;
const HEADER = 38;
const C = theme.colors;

const PAIRS = [
  "let best = 0;",
  "for (let buy = 0; buy < prices.length; buy++)",
  "  for (let sell = buy + 1; sell < prices.length; sell++)",
  "    best = Math.max(best, prices[sell] - prices[buy]);",
  "return best;",
];
const PASS = [
  "let minPrice = prices[0], maxProfit = 0;",
  "for (let i = 1; i < prices.length; i++) {",
  "  maxProfit = Math.max(maxProfit, prices[i] - minPrice);",
  "  minPrice = Math.min(minPrice, prices[i]);",
  "}",
  "return maxProfit;",
];

const S = T.stems.map((s) => s.at);

type View = "prices" | "pairs" | "pass";
const viewAt = (f: number): View => {
  if (f < S[1]) return "prices";
  if (f < S[2]) return "pairs";
  if (f < S[3]) return "prices";
  if (f < B.nSquared) return "pass";
  if (f < B.n) return "pairs";
  return "pass";
};

/** The values the one pass carries, as the walk reaches each day. */
export const carried = (f: number) => {
  const p = RUN.example.prices;
  let minPrice: number = p[0];
  let maxProfit = 0;
  for (let i = 1; i < 6; i++) {
    if (f < B.day[i]) break;
    maxProfit = Math.max(maxProfit, p[i] - minPrice);
    minPrice = Math.min(minPrice, p[i]);
  }
  return { minPrice, maxProfit };
};

/** Which line of the one pass is running. */
const passLine = (f: number) => {
  if (f < B.day[0]) return -1;
  if (f < B.day[1] - 4) return 0;
  for (let i = 5; i >= 1; i--)
    if (f >= B.day[i] - 4) {
      const t = f - (B.day[i] - 4);
      return t < 14 ? 2 : t < 26 ? 3 : 1;
    }
  return -1;
};

const pairsLine = (f: number) =>
  f >= B.compare && f < B.fifteen ? 3 : f >= B.nSquared ? 2 : -1;

const Line: React.FC<{
  text: string;
  lit: boolean;
  size: number;
  height: number;
  accent?: string[];
}> = ({ text, lit, size, height, accent = [] }) => {
  const parts = accent.length
    ? text.split(new RegExp(`(${accent.join("|")})`))
    : [text];
  return (
    <div
      style={{
        height,
        lineHeight: `${height}px`,
        padding: "0 10px",
        borderRadius: 7,
        fontSize: size,
        whiteSpace: "pre",
        color: lit ? C.chalk : C.grayLight,
        background: lit ? "rgba(233,228,216,0.09)" : "transparent",
      }}
    >
      {parts.map((p, i) =>
        accent.includes(p) ? (
          <span key={i} style={{ color: ACCENT, fontWeight: 700 }}>
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </div>
  );
};

export const Code: React.FC<{ frame: number }> = ({ frame }) => {
  const view = viewAt(frame);
  const p = RUN.example.prices;
  const { minPrice, maxProfit } = carried(frame);
  const walking = frame >= S[3] && frame < B.nSquared;
  const two = interpolate(
    frame,
    [B.twoNumbers, B.twoNumbers + 6],
    [0, 1],
    clamp,
  );
  return (
    <div
      style={{
        position: "absolute",
        top: CODE_TOP,
        left: LEFT,
        width: WIDTH,
        height: CODE_H,
        borderRadius: 16,
        background: "#0A0B0D",
        border: "1px solid rgba(233,228,216,0.12)",
        overflow: "hidden",
        fontFamily: theme.monoFamily,
        fontVariantLigatures: "none",
        fontFeatureSettings: '"liga" 0, "calt" 0',
      }}
    >
      <div
        style={{
          height: HEADER,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 22px",
          borderBottom: "1px solid rgba(233,228,216,0.08)",
          fontSize: 17,
          letterSpacing: "0.04em",
          color: C.grayDark,
        }}
      >
        <span>LeetCode 121 · Best Time to Buy and Sell Stock</span>
        {walking ? (
          <span style={{ color: C.chalk }}>
            minPrice <span style={{ color: ACCENT }}>{minPrice}</span> ·
            maxProfit {maxProfit}
          </span>
        ) : (
          <span>JavaScript</span>
        )}
      </div>
      <div
        style={{ position: "absolute", top: HEADER + 14, left: 14, right: 14 }}
      >
        {view === "prices" ? (
          <div style={{ padding: "18px 10px" }}>
            <div style={{ fontSize: 40, color: C.chalk, whiteSpace: "pre" }}>
              {"prices = ["}
              {p.map((v, i) => {
                const lit = interpolate(
                  frame,
                  [B.sixDays + i * 6, B.sixDays + i * 6 + 6],
                  [0.35, 1],
                  clamp,
                );
                const buy =
                  frame >= B.cheapestBefore && frame < S[3] && i === 1;
                const sell = frame >= B.sellDay && frame < S[3] && i === 4;
                return (
                  <span key={i}>
                    <span
                      style={{
                        opacity: lit,
                        color: buy ? ACCENT : C.chalk,
                        fontWeight: buy || sell ? 800 : 400,
                        textDecoration: sell ? "underline" : "none",
                        textUnderlineOffset: 8,
                      }}
                    >
                      {v}
                    </span>
                    {i < 5 ? ", " : ""}
                  </span>
                );
              })}
              {"]"}
            </div>
            <div
              style={{
                marginTop: 26,
                fontSize: 24,
                color: C.grayDark,
                whiteSpace: "pre",
              }}
            >
              {frame >= S[2]
                ? "// sell on day 5: only the cheapest day before it counts"
                : "// buy once, then sell on a later day"}
            </div>
          </div>
        ) : view === "pairs" ? (
          PAIRS.map((t, i) => (
            <Line
              key={i}
              text={t}
              lit={pairsLine(frame) === i}
              size={25}
              height={38}
            />
          ))
        ) : (
          PASS.map((t, i) => (
            <Line
              key={i}
              text={t}
              lit={passLine(frame) === i}
              size={25}
              height={36}
              accent={two > 0 ? ["minPrice", "maxProfit"] : []}
            />
          ))
        )}
      </div>
    </div>
  );
};
