import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../brand/theme";
import { clamp } from "../video/timing";

type Point = { x: number; y: number };

type RequestFlowProps = {
  client: Point;
  server: Point;
  database: Point;
  overload?: boolean;
  instant?: boolean;
  tone?: "paper" | "black";
};

const between = (from: Point, to: Point, progress: number): Point => ({
  x: from.x + (to.x - from.x) * progress,
  y: from.y + (to.y - from.y) * progress,
});

const pointOnJourney = (
  client: Point,
  server: Point,
  database: Point,
  progress: number,
): Point => {
  if (progress < 0.3) return between(client, server, progress / 0.3);
  if (progress < 0.55)
    return between(server, database, (progress - 0.3) / 0.25);
  if (progress < 0.75)
    return between(database, server, (progress - 0.55) / 0.2);
  return between(server, client, (progress - 0.75) / 0.25);
};

export const RequestFlow: React.FC<RequestFlowProps> = ({
  client,
  server,
  database,
  overload = false,
  instant = false,
  tone = "paper",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const journeyFrames = fps * 4;
  const packetCount = overload ? 11 : 1;
  const lineOpacity = instant ? 1 : interpolate(frame, [0, 12], [0, 1], clamp);
  const dark = tone === "black";

  return (
    <>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", inset: 0, opacity: lineOpacity }}
      >
        <path
          d={`M ${client.x} ${client.y} L ${server.x} ${server.y} L ${database.x} ${database.y}`}
          fill="none"
          stroke={dark ? "rgba(255,255,255,0.2)" : "rgba(17,18,20,0.2)"}
          strokeWidth={4}
          strokeDasharray="12 13"
          strokeDashoffset={-(frame * 1.5)}
        />
      </svg>

      {Array.from({ length: packetCount }, (_, index) => {
        const offset = overload ? index * 0.075 : 0.06;
        const progress = (((frame / journeyFrames + offset) % 1) + 1) % 1;
        const point = pointOnJourney(client, server, database, progress);
        const packetOpacity = overload
          ? interpolate(index, [0, packetCount - 1], [1, 0.36], clamp)
          : 1;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: point.x,
              top: point.y,
              width: overload ? 18 : 24,
              height: overload ? 18 : 24,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              opacity: packetOpacity,
              background: overload
                ? theme.colors.blueBright
                : theme.colors.blue,
              boxShadow: "0 0 26px rgba(77,155,255,0.48)",
            }}
          />
        );
      })}
    </>
  );
};
