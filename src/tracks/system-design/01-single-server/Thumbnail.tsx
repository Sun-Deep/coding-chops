import { theme } from "../../../shared/brand/theme";
import { Canvas } from "../../../shared/primitives/Canvas";

export const SingleServerThumbnail: React.FC = () => (
  <Canvas tone="paper" padding={0}>
    <div
      style={{
        position: "absolute",
        left: 78,
        right: 78,
        top: 115,
        color: theme.colors.ink,
        fontSize: 88,
        fontWeight: 600,
        letterSpacing: "-0.065em",
        lineHeight: 1.02,
      }}
    >
      You tap Buy.
      <br />
      <span style={{ color: theme.colors.blue }}>Then what?</span>
    </div>
    <div
      style={{
        position: "absolute",
        left: 82,
        right: 82,
        bottom: 72,
        color: theme.colors.gray,
        fontSize: 27,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      How one server handles a web request
    </div>
  </Canvas>
);
