import type { Caption } from "@remotion/captions";
import { Canvas } from "../../shared/primitives/Canvas";
import { Captions } from "../../shared/primitives/Captions";
import { theme } from "../../shared/brand/theme";

/**
 * The frame regions from section 8, with a real caption rendered under them.
 *
 * The instructional floor of y=940 is derived rather than chosen: captions sit
 * at bottom 42 with a 28px face at 1.3 line height, so two lines occupy 72.8px
 * and the block's top edge lands at 965. This exists so that number is checked
 * against what `Captions` actually draws rather than against arithmetic.
 *
 * The sentence is a deliberate worst case. `toSentences` caps a line at 13
 * words, so this is 13 long ones, which is the widest caption the pipeline can
 * produce.
 */
const WORST_CASE =
  "Understanding the relationship between consecutive transactions requires remembering exactly which purchasing opportunity preceded todays decision";

const captions: Caption[] = WORST_CASE.split(" ").map((word, i) => ({
  text: (i === 0 ? "" : " ") + word,
  startMs: i * 200,
  endMs: i * 200 + 200,
  timestampMs: null,
  confidence: null,
}));

const REGIONS = [
  { name: "hero", top: 120, bottom: 700, tint: "rgba(23,105,224,0.05)" },
  { name: "working", top: 700, bottom: 940, tint: "rgba(23,105,224,0.11)" },
  { name: "caption", top: 940, bottom: 1038, tint: "rgba(168,50,42,0.10)" },
];

const Rule: React.FC<{ y: number; label: string; strong?: boolean }> = ({
  y,
  label,
  strong = false,
}) => (
  <>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        height: strong ? 2 : 1,
        background: strong ? theme.colors.ink : theme.colors.grayLight,
      }}
    />
    <div
      style={{
        position: "absolute",
        right: 24,
        top: y - 22,
        fontFamily: theme.monoFamily,
        fontSize: 15,
        color: strong ? theme.colors.ink : theme.colors.gray,
      }}
    >
      {label}
    </div>
  </>
);

export const CaptionSafeArea: React.FC = () => (
  <Canvas tone="paper" padding={0}>
    {REGIONS.map((region) => (
      <div
        key={region.name}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: region.top,
          height: region.bottom - region.top,
          background: region.tint,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 24,
            top: 10,
            fontFamily: theme.monoFamily,
            fontSize: 15,
            color: theme.colors.gray,
          }}
        >
          {region.name} {region.top} to {region.bottom}
        </div>
      </div>
    ))}

    {/* The caption safe margins, 280 each side. */}
    {[280, 1640].map((x) => (
      <div
        key={x}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: x,
          width: 1,
          background: theme.colors.grayLight,
        }}
      />
    ))}

    <Rule y={940} label="y=940 instructional floor" strong />
    <Rule y={965} label="y=965 predicted caption top" />
    <Rule y={1038} label="y=1038 caption baseline box" />

    <Captions captions={captions} />
  </Canvas>
);
