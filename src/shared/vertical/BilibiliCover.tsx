import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { Lockup } from "../brand/Lockup";
import { theme } from "../brand/theme";
import { ACCENT } from "./palette";

/**
 * A 16:9 cover for Bilibili, where a reel shows up on cards cut like a
 * YouTube thumbnail rather than in a 9:16 feed. Composed for 1920 x 1080.
 *
 * Left: the hook in Chinese on top, the number or result large in the
 * accent, a second Chinese line, and the English under it for viewers who
 * read both. Right: a window onto the reel's own frame, the same 1080 x 1920
 * picture the vertical cover uses, cropped to the part that tells the
 * story. The card's play count and length sit along the bottom edge on
 * Bilibili, so the mark sits above it and nothing readable goes below
 * y 960. Every line is one line: write the Chinese short enough to fit the
 * 816 px column (about nine characters at the sub size) rather than let a
 * character wrap onto a line of its own.
 */

const W = 1920;
const H = 1080;
const ZH = `"PingFang SC", "Hiragino Sans GB", "Heiti SC", ${theme.fontFamily}, sans-serif`;

/** Which part of the 1080 x 1920 frame shows, as fractions of it. */
export type Crop = { x: number; y: number; w: number; h: number };

export const BilibiliCover: React.FC<{
  /** The reel's frame, drawn at 1080 x 1920. */
  frame: ReactNode;
  crop: Crop;
  /** The hook, in Chinese. */
  zh: ReactNode;
  /** The result, large and in the accent: a number, usually. */
  big: ReactNode;
  /** What the number is, in Chinese. */
  zhSub: ReactNode;
  /** The same claim in English, quieter. */
  en: ReactNode;
}> = ({ frame, crop, zh, big, zhSub, en }) => {
  const boxW = 900;
  const boxH = Math.min(860, (boxW * (crop.h * 1920)) / (crop.w * 1080));
  const scale = boxW / (crop.w * 1080);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.colors.black,
        color: theme.colors.chalk,
        fontFamily: theme.fontFamily,
      }}
    >
      <div
        style={{
          position: "absolute",
          right: 60,
          top: (H - boxH) / 2 - 20,
          width: boxW,
          height: boxH,
          overflow: "hidden",
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 94%, transparent), linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)",
          maskComposite: "intersect",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1080,
            height: 1920,
            transformOrigin: "0 0",
            transform: `scale(${scale}) translate(${-crop.x * 1080}px, ${-crop.y * 1920}px)`,
          }}
        >
          {frame}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 104,
          top: 150,
          width: W - 104 - boxW - 100,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div
          lang="zh-Hans"
          style={{
            fontFamily: ZH,
            fontSize: 112,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.08,
            whiteSpace: "nowrap",
          }}
        >
          {zh}
        </div>
        <div
          style={{
            fontSize: 196,
            fontWeight: 800,
            letterSpacing: "-0.06em",
            lineHeight: 0.95,
            color: ACCENT,
            whiteSpace: "nowrap",
          }}
        >
          {big}
        </div>
        <div
          lang="zh-Hans"
          style={{
            fontFamily: ZH,
            fontSize: 84,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            lineHeight: 1.12,
            whiteSpace: "nowrap",
          }}
        >
          {zhSub}
        </div>
        <div
          lang="en"
          style={{
            fontSize: 46,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: theme.colors.grayLight,
            marginTop: 6,
            whiteSpace: "nowrap",
          }}
        >
          {en}
        </div>
      </div>
      <div style={{ position: "absolute", left: 110, top: 880 }}>
        <Lockup size={44} tone="black" />
      </div>
    </AbsoluteFill>
  );
};
