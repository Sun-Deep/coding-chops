import { interpolate, Sequence, useCurrentFrame } from "remotion";
import { theme } from "../../../shared/brand/theme";
import { Canvas } from "../../../shared/primitives/Canvas";
import { PrototypeBadge } from "../../../shared/primitives/PrototypeBadge";
import { clamp, seconds } from "../../../shared/video/timing";
import { SingleServerDiagram } from "./SingleServerDiagram";

export const SingleServerMaster: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(
    frame,
    [0, 10, seconds(7), seconds(8)],
    [0, 1, 1, 0],
    clamp,
  );
  const secondTitleOpacity = interpolate(
    frame,
    [seconds(8), seconds(9), seconds(18), seconds(19)],
    [0, 1, 1, 0],
    clamp,
  );
  const dangerTitleOpacity = interpolate(
    frame,
    [seconds(19), seconds(20), seconds(29)],
    [0, 1, 1],
    clamp,
  );

  return (
    <Canvas>
      <PrototypeBadge />

      <div
        style={{
          position: "absolute",
          top: 92,
          left: 110,
          right: 110,
          textAlign: "center",
          opacity: titleOpacity,
        }}
      >
        <div
          style={{ color: theme.colors.blue, fontSize: 25, fontWeight: 760 }}
        >
          SYSTEM DESIGN 01
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 72,
            fontWeight: 780,
            letterSpacing: -3,
          }}
        >
          Every click starts a journey.
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 102,
          left: 110,
          right: 110,
          textAlign: "center",
          opacity: secondTitleOpacity,
        }}
      >
        <div style={{ fontSize: 62, fontWeight: 770, letterSpacing: -2.6 }}>
          One request. Three responsibilities.
        </div>
        <div style={{ marginTop: 15, color: theme.colors.muted, fontSize: 28 }}>
          Ask, compute, store, respond.
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 92,
          left: 110,
          right: 110,
          textAlign: "center",
          opacity: dangerTitleOpacity,
        }}
      >
        <div style={{ color: theme.colors.red, fontSize: 25, fontWeight: 760 }}>
          THE FIRST BOTTLENECK
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 62,
            fontWeight: 780,
            letterSpacing: -2.6,
          }}
        >
          Every request depends on one machine.
        </div>
      </div>

      <Sequence durationInFrames={seconds(19)}>
        <SingleServerDiagram orientation="horizontal" instant />
      </Sequence>
      <Sequence from={seconds(19)}>
        <SingleServerDiagram orientation="horizontal" overload instant />
      </Sequence>
    </Canvas>
  );
};
