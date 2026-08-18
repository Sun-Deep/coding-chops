import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "../brand/theme";

type CanvasProps = {
  children: ReactNode;
  padding?: number;
};

export const Canvas: React.FC<CanvasProps> = ({ children, padding = 72 }) => {
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        padding,
        fontFamily: theme.font,
        color: theme.colors.text,
        background:
          "radial-gradient(circle at 50% 38%, #14223A 0%, #090D14 34%, #05070A 72%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.24,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
