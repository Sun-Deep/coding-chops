import { theme } from "../../../shared/brand/theme";
import { Canvas } from "../../../shared/primitives/Canvas";
import { SingleServerDiagram } from "./SingleServerDiagram";

export const SingleServerThumbnail: React.FC = () => {
  return (
    <Canvas tone="paper" padding={48}>
      <div
        style={{
          position: "absolute",
          zIndex: 2,
          top: 54,
          left: 70,
          width: 900,
        }}
      >
        <div
          style={{
            color: theme.colors.blue,
            fontSize: 21,
            fontWeight: 700,
            letterSpacing: "0.14em",
          }}
        >
          SYSTEM DESIGN 01
        </div>
        <div
          style={{
            marginTop: 14,
            color: theme.colors.ink,
            fontSize: 76,
            fontWeight: 800,
            letterSpacing: "-0.075em",
            lineHeight: 0.88,
          }}
        >
          ONE SERVER.
          <br />
          <span style={{ color: theme.colors.blue }}>EVERY REQUEST.</span>
        </div>
      </div>
      <SingleServerDiagram
        orientation="horizontal"
        overload
        focus="server"
        instant
        tone="paper"
      />
    </Canvas>
  );
};
