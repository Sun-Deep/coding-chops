import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../../shared/brand/theme";
import { Canvas } from "../../../shared/primitives/Canvas";
import { PrototypeBadge } from "../../../shared/primitives/PrototypeBadge";
import { clamp, seconds } from "../../../shared/video/timing";
import { SingleServerDiagram } from "./SingleServerDiagram";

type ShortFrameProps = {
  eyebrow: string;
  headline: string;
  accent: string;
  answer: string;
  overload?: boolean;
  focus?: "flow" | "server" | "database";
};

const ShortFrame: React.FC<ShortFrameProps> = ({
  eyebrow,
  headline,
  accent,
  answer,
  overload = false,
  focus = "flow",
}) => {
  const frame = useCurrentFrame();
  const headlineY = interpolate(frame, [0, 12], [18, 0], clamp);
  const answerOpacity = interpolate(
    frame,
    [seconds(4.4), seconds(5), seconds(19)],
    [0, 1, 1],
    clamp,
  );

  return (
    <Canvas tone="paper" padding={48}>
      <PrototypeBadge />
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 66,
          right: 66,
          transform: `translateY(${headlineY}px)`,
        }}
      >
        <div
          style={{
            color: theme.colors.blue,
            fontSize: 23,
            fontWeight: 700,
            letterSpacing: "0.14em",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            marginTop: 20,
            color: theme.colors.ink,
            fontSize: 78,
            fontWeight: 800,
            letterSpacing: "-0.07em",
            lineHeight: 0.96,
          }}
        >
          {headline}
          <br />
          <span style={{ color: theme.colors.blue }}>{accent}</span>
        </div>
      </div>

      <SingleServerDiagram
        orientation="vertical"
        overload={overload}
        focus={focus}
        instant
        tone="paper"
      />

      <div
        style={{
          position: "absolute",
          left: 66,
          right: 66,
          bottom: 105,
          paddingTop: 24,
          borderTop: `8px solid ${theme.colors.blue}`,
          color: theme.colors.ink,
          fontSize: 33,
          fontWeight: 700,
          letterSpacing: "-0.035em",
          lineHeight: 1.2,
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
    headline="YOU TAP"
    accent="WHAT HAPPENS NEXT?"
    answer="The client asks, the application computes, the database stores, and a response travels back."
  />
);

export const SingleServerMetricShort: React.FC = () => (
  <ShortFrame
    eyebrow="SCALING MYTH"
    headline="10,000 USERS"
    accent="IS NOT A LIMIT."
    answer="Request rate, concurrency, and work per request determine the pressure, not user count alone."
    overload
    focus="server"
  />
);

export const SingleServerIoShort: React.FC = () => (
  <ShortFrame
    eyebrow="HIDDEN WAIT"
    headline="LOW CPU"
    accent="CAN STILL FEEL SLOW."
    answer="A request can spend most of its time waiting on storage, a database, or the network."
    focus="database"
  />
);
