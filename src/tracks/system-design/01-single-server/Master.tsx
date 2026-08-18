import { interpolate, Sequence, useCurrentFrame } from "remotion";
import { theme } from "../../../shared/brand/theme";
import { Canvas } from "../../../shared/primitives/Canvas";
import { PrototypeBadge } from "../../../shared/primitives/PrototypeBadge";
import { clamp, seconds } from "../../../shared/video/timing";
import { SingleServerDiagram } from "./SingleServerDiagram";

const BaselineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(
    frame,
    [0, 8, seconds(17), seconds(18)],
    [0, 1, 1, 0],
    clamp,
  );

  return (
    <Canvas tone="paper">
      <PrototypeBadge />
      <div
        style={{
          position: "absolute",
          top: 82,
          left: 155,
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            color: theme.colors.blue,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.14em",
          }}
        >
          SYSTEM DESIGN 01
        </div>
        <div
          style={{
            marginTop: 18,
            color: theme.colors.ink,
            fontSize: 82,
            fontWeight: 800,
            letterSpacing: "-0.07em",
            lineHeight: 0.92,
          }}
        >
          ONE REQUEST.
          <br />
          <span style={{ color: theme.colors.blue }}>ONE JOURNEY.</span>
        </div>
      </div>
      <SingleServerDiagram orientation="horizontal" instant tone="paper" />
    </Canvas>
  );
};

const BottleneckScene: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], clamp);

  return (
    <Canvas tone="black">
      <PrototypeBadge tone="black" />
      <div
        style={{
          position: "absolute",
          top: 88,
          left: 155,
          opacity,
        }}
      >
        <div
          style={{
            color: theme.colors.blueBright,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.14em",
          }}
        >
          THE FIRST BOTTLENECK
        </div>
        <div
          style={{
            marginTop: 18,
            color: theme.colors.white,
            fontSize: 82,
            fontWeight: 800,
            letterSpacing: "-0.07em",
            lineHeight: 0.92,
          }}
        >
          EVERY REQUEST.
          <br />
          <span style={{ color: theme.colors.blueBright }}>ONE MACHINE.</span>
        </div>
      </div>
      <SingleServerDiagram
        orientation="horizontal"
        overload
        instant
        tone="black"
      />
    </Canvas>
  );
};

export const SingleServerMaster: React.FC = () => {
  return (
    <>
      <Sequence durationInFrames={seconds(19)}>
        <BaselineScene />
      </Sequence>
      <Sequence from={seconds(19)}>
        <BottleneckScene />
      </Sequence>
    </>
  );
};
