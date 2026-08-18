import { Easing, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../../shared/brand/theme";
import { Canvas } from "../../../shared/primitives/Canvas";
import { clamp, seconds } from "../../../shared/video/timing";

const easeOut = {
  ...clamp,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
};

type EditorialShortProps = {
  opening: string;
  accent: string;
  middle: string;
  final: string;
  caption: string;
};

const EditorialShort: React.FC<EditorialShortProps> = ({
  opening,
  accent,
  middle,
  final,
  caption,
}) => {
  const frame = useCurrentFrame();
  const accentIn = interpolate(frame, [4, 18], [0, 1], easeOut);
  const middleIn = interpolate(
    frame,
    [seconds(5), seconds(5.7)],
    [0, 1],
    easeOut,
  );
  const finalIn = interpolate(
    frame,
    [seconds(10), seconds(10.8)],
    [0, 1],
    easeOut,
  );
  const answerIn = interpolate(
    frame,
    [seconds(14), seconds(14.8)],
    [0, 1],
    easeOut,
  );

  return (
    <Canvas tone="paper" padding={0}>
      <div
        style={{
          position: "absolute",
          left: 68,
          right: 68,
          top: 220,
          color: theme.colors.ink,
          fontSize: 84,
          fontWeight: 600,
          letterSpacing: "-0.06em",
          lineHeight: 1.05,
        }}
      >
        {opening}
        <br />
        <span
          style={{
            display: "inline-block",
            color: theme.colors.blue,
            opacity: accentIn,
            transform: `translateY(${interpolate(accentIn, [0, 1], [24, 0], easeOut)}px)`,
          }}
        >
          {accent}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 68,
          right: 68,
          top: 770,
          color: theme.colors.ink,
          fontSize: 70,
          fontWeight: 600,
          letterSpacing: "-0.055em",
          lineHeight: 1.1,
          opacity: middleIn,
          transform: `translateY(${interpolate(middleIn, [0, 1], [24, 0], easeOut)}px)`,
        }}
      >
        {middle}
      </div>

      <div
        style={{
          position: "absolute",
          left: 68,
          right: 68,
          top: 1120,
          color: theme.colors.blue,
          fontSize: 76,
          fontWeight: 700,
          letterSpacing: "-0.06em",
          lineHeight: 1.05,
          opacity: finalIn,
          transform: `translateY(${interpolate(finalIn, [0, 1], [24, 0], easeOut)}px)`,
        }}
      >
        {final}
      </div>

      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          bottom: 170,
          color: theme.colors.ink,
          fontSize: 34,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          lineHeight: 1.25,
          opacity: answerIn,
          textAlign: "center",
        }}
      >
        {caption}
      </div>
    </Canvas>
  );
};

export const SingleServerHookShort: React.FC = () => (
  <EditorialShort
    opening="You tap Buy."
    accent="Then what?"
    middle="Your browser sends a request."
    final="Server. Database. Back to you."
    caption="One request travels through the whole application."
  />
);

export const SingleServerMetricShort: React.FC = () => (
  <EditorialShort
    opening="10,000 users"
    accent="is not a limit."
    middle="The real pressure is requests per second."
    final="Measure the work, not the audience."
    caption="Traffic shape determines when one server struggles."
  />
);

export const SingleServerIoShort: React.FC = () => (
  <EditorialShort
    opening="Low CPU."
    accent="Still slow?"
    middle="The request may be waiting on data."
    final="Waiting is work too."
    caption="Storage, database, and network I/O can dominate latency."
  />
);
