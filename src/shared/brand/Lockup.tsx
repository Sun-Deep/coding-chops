import { Mark } from "./Mark";
import { theme } from "./theme";
import {
  CAP_RATIO,
  LOCKUP_GAP,
  STACKED_CAP_RATIO,
  STACKED_GAP,
  WORDMARK_CAP,
} from "./geometry";

/**
 * Which ground the lockup is standing on. It picks the pair of colours, so no
 * caller has to remember that the burnt accent goes muddy on near black and
 * the bright one is thin on paper.
 */
export type Tone = "paper" | "black" | "mono";

const tones: Record<Tone, { word: string; accent: string }> = {
  paper: { word: theme.colors.ink, accent: theme.colors.orange },
  black: { word: theme.colors.chalk, accent: theme.colors.orangeBright },
  // One colour, for embroidery, engraving and anything with a single ink.
  // The Coding and Chops split is dropped rather than faked with a tint: a
  // wordmark that needs two values to read is the fault this rebrand started
  // out fixing.
  mono: { word: "currentColor", accent: "currentColor" },
};

/**
 * The logotype on its own.
 *
 * `size` is the font size. Everything else in the lockup derives from the cap
 * height that follows from it.
 */
export const Wordmark: React.FC<{ size?: number; tone?: Tone }> = ({
  size = 64,
  tone = "paper",
}) => {
  const { word, accent } = tones[tone];

  return (
    <div
      style={{
        fontFamily: theme.wordmarkFamily,
        fontSize: size,
        fontWeight: 800,
        letterSpacing: "-0.045em",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: word }}>Coding</span>{" "}
      <span style={{ color: accent }}>Chops</span>
    </div>
  );
};

/**
 * Mark and wordmark, locked.
 *
 * The mark is 1.6 cap heights beside the type and 2.6 above it. Not one to
 * one: both forms are flat topped so neither needs optical overshoot to line
 * up, but alignment is not the question. Two C forms with open counters and a
 * gap between them carry about half the ink of twelve characters at weight
 * 800, so matched cap heights leave the mark reading as a stray glyph.
 */
export const Lockup: React.FC<{
  size?: number;
  tone?: Tone;
  stacked?: boolean;
}> = ({ size = 64, tone = "paper", stacked = false }) => {
  const cap = size * WORDMARK_CAP;
  const markHeight = cap * (stacked ? STACKED_CAP_RATIO : CAP_RATIO);
  const gap = markHeight * (stacked ? STACKED_GAP : LOCKUP_GAP);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: stacked ? "column" : "row",
        alignItems: "center",
        gap,
      }}
    >
      <Mark height={markHeight} color={tones[tone].accent} />
      <Wordmark size={size} tone={tone} />
    </div>
  );
};
