import { AbsoluteFill, random, useCurrentFrame } from "remotion";

type GradeProps = {
  /** Grain strength. Above about 0.05 it stops reading as film and starts reading as noise. */
  grain?: number;
  vignette?: number;
};

/**
 * The pass that makes a frame look photographed rather than generated.
 *
 * A perfectly clean render is the other clear tell of computer output. Real
 * footage has grain, falls off toward the edges, and never has a mathematically
 * flat field of colour. All three are restrained here on purpose, because the
 * canvas is warm paper and heavy grading would fight the channel's restraint.
 */
export const Grade: React.FC<GradeProps> = ({
  grain = 0.028,
  vignette = 0.16,
}) => {
  const frame = useCurrentFrame();
  // Reseeded per frame so the grain moves. Deterministic, so renders repeat.
  const seed = Math.floor(random(`grain-${frame}`) * 10000);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 78% 74% at 50% 46%, rgba(0,0,0,0) 42%, rgba(23,20,14,${vignette}) 100%)`,
          mixBlendMode: "multiply",
        }}
      />
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
      >
        <filter id="grade-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.82"
            numOctaves={2}
            seed={seed}
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter="url(#grade-grain)"
          opacity={grain}
          style={{ mixBlendMode: "overlay" }}
        />
      </svg>
    </AbsoluteFill>
  );
};
