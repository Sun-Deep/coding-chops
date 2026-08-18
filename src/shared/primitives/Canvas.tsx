import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "../brand/theme";

type CanvasProps = {
  children: ReactNode;
  padding?: number;
  tone?: "paper" | "black";
};

export const Canvas: React.FC<CanvasProps> = ({
  children,
  padding = 72,
  tone = "paper",
}) => {
  const dark = tone === "black";

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        padding,
        fontFamily: theme.fontFamily,
        color: dark ? theme.colors.white : theme.colors.ink,
        background: dark
          ? `radial-gradient(circle at 50% 48%, #151B27 0%, ${theme.colors.black} 64%)`
          : `linear-gradient(145deg, ${theme.colors.paperBright} 0%, ${theme.colors.paper} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          opacity: dark ? 0.08 : 0.16,
          backgroundImage: dark
            ? "none"
            : "radial-gradient(rgba(17,18,20,0.055) 0.7px, transparent 0.7px)",
          backgroundSize: "7px 7px",
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
