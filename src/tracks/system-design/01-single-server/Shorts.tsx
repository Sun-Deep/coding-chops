import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../../shared/brand/theme";
import { Canvas } from "../../../shared/primitives/Canvas";
import { PrototypeBadge } from "../../../shared/primitives/PrototypeBadge";
import { clamp, seconds } from "../../../shared/video/timing";
import { SingleServerDiagram } from "./SingleServerDiagram";

type ShortFrameProps = {
  eyebrow: string;
  headline: string;
  answer: string;
  overload?: boolean;
  focus?: "flow" | "server" | "database";
};

const ShortFrame: React.FC<ShortFrameProps> = ({
  eyebrow,
  headline,
  answer,
  overload = false,
  focus = "flow",
}) => {
  const frame = useCurrentFrame();
  const headlineY = interpolate(frame, [0, 12], [24, 0], clamp);
  const answerOpacity = interpolate(
    frame,
    [seconds(5), seconds(5.5), seconds(19)],
    [0, 1, 1],
    clamp,
  );

  return (
    <Canvas padding={48}>
      <PrototypeBadge />
      <div
        style={{
          position: "absolute",
          top: 126,
          left: 64,
          right: 64,
          transform: `translateY(${headlineY}px)`,
        }}
      >
        <div
          style={{
            color: overload ? theme.colors.red : theme.colors.blue,
            fontSize: 25,
            fontWeight: 780,
            letterSpacing: 1.5,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 72,
            lineHeight: 1.03,
            letterSpacing: -3.2,
            fontWeight: 800,
          }}
        >
          {headline}
        </div>
      </div>

      <SingleServerDiagram
        orientation="vertical"
        overload={overload}
        focus={focus}
        instant
      />

      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 92,
          padding: "30px 34px",
          borderRadius: 30,
          border: `1px solid ${theme.colors.border}`,
          background: "rgba(12, 16, 23, 0.9)",
          boxShadow: theme.shadow,
          fontSize: 31,
          lineHeight: 1.25,
          fontWeight: 650,
          opacity: answerOpacity,
        }}
      >
        {answer}
      </div>
    </Canvas>
  );
};

export const SingleServerHookShort: React.FC = () => (
  <ShortFrame
    eyebrow="ONE REQUEST"
    headline="What happens after you tap a button?"
    answer="The client asks, the application computes, the database stores, and a response travels back."
  />
);

export const SingleServerMetricShort: React.FC = () => (
  <ShortFrame
    eyebrow="SCALING MYTH"
    headline="Can one server handle 10,000 users?"
    answer="User count is not enough. Request rate, concurrency, and work per request determine the pressure."
    overload
    focus="server"
  />
);

export const SingleServerIoShort: React.FC = () => (
  <ShortFrame
    eyebrow="HIDDEN WAIT"
    headline="Low CPU does not always mean fast."
    answer="A request can spend most of its time waiting on storage, a database, or the network."
    focus="database"
  />
);
