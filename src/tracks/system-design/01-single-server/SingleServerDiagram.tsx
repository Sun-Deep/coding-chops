import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../../shared/brand/theme";
import { RequestFlow } from "../../../shared/system-design/RequestFlow";
import { SystemNode } from "../../../shared/system-design/SystemNode";
import { clamp } from "../../../shared/video/timing";

type SingleServerDiagramProps = {
  orientation: "horizontal" | "vertical";
  overload?: boolean;
  focus?: "flow" | "server" | "database";
  instant?: boolean;
};

export const SingleServerDiagram: React.FC<SingleServerDiagramProps> = ({
  orientation,
  overload = false,
  focus = "flow",
  instant = false,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const vertical = orientation === "vertical";
  const nodeWidth = vertical ? 500 : 330;
  const nodeHeight = vertical ? 178 : 170;

  const client = vertical
    ? { x: width / 2, y: height * 0.34 }
    : { x: width * 0.2, y: height * 0.62 };
  const server = vertical
    ? { x: width / 2, y: height * 0.57 }
    : { x: width * 0.5, y: height * 0.62 };
  const database = vertical
    ? { x: width / 2, y: height * 0.8 }
    : { x: width * 0.8, y: height * 0.62 };

  const phase = (frame % (fps * 4)) / (fps * 4);
  const activeClient = phase < 0.3 || phase >= 0.75;
  const activeServer = phase >= 0.2 && phase < 0.8;
  const activeDatabase = phase >= 0.48 && phase < 0.7;
  const dangerOpacity = overload
    ? interpolate(Math.sin(frame / 5), [-1, 1], [0.28, 0.8], clamp)
    : 0;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <RequestFlow
        client={client}
        server={server}
        database={database}
        overload={overload}
        instant={instant}
      />

      {overload ? (
        <div
          style={{
            position: "absolute",
            left: server.x - nodeWidth / 2 - 18,
            top: server.y - nodeHeight / 2 - 18,
            width: nodeWidth + 36,
            height: nodeHeight + 36,
            borderRadius: 48,
            border: `3px solid ${theme.colors.red}`,
            opacity: dangerOpacity,
          }}
        />
      ) : null}

      <SystemNode
        kind="client"
        label="Client"
        detail="Browser or mobile app"
        x={client.x}
        y={client.y}
        width={nodeWidth}
        height={nodeHeight}
        active={focus === "flow" && activeClient}
        delay={0}
        instant={instant}
      />
      <SystemNode
        kind="server"
        label="Application"
        detail={
          overload ? "Every request arrives here" : "Runs the application logic"
        }
        x={server.x}
        y={server.y}
        width={nodeWidth}
        height={nodeHeight}
        active={focus === "server" || (focus === "flow" && activeServer)}
        danger={overload}
        delay={5}
        instant={instant}
      />
      <SystemNode
        kind="database"
        label="Database"
        detail="Stores persistent data"
        x={database.x}
        y={database.y}
        width={nodeWidth}
        height={nodeHeight}
        active={focus === "database" || (focus === "flow" && activeDatabase)}
        delay={10}
        instant={instant}
      />
    </div>
  );
};
