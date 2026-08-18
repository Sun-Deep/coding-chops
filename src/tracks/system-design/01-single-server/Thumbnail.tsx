import { theme } from "../../../shared/brand/theme";
import { Canvas } from "../../../shared/primitives/Canvas";
import { SingleServerDiagram } from "./SingleServerDiagram";

export const SingleServerThumbnail: React.FC = () => {
  return (
    <Canvas padding={48}>
      <div
        style={{
          position: "absolute",
          zIndex: 2,
          top: 64,
          left: 70,
          width: 720,
        }}
      >
        <div
          style={{ color: theme.colors.blue, fontSize: 24, fontWeight: 800 }}
        >
          SYSTEM DESIGN 01
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 70,
            lineHeight: 1,
            letterSpacing: -3.5,
            fontWeight: 820,
          }}
        >
          One server.
          <br />
          Every request.
        </div>
      </div>
      <SingleServerDiagram
        orientation="horizontal"
        overload
        focus="server"
        instant
      />
    </Canvas>
  );
};
