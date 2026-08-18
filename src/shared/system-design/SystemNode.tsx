import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../brand/theme";

type NodeKind = "client" | "server" | "database";

type SystemNodeProps = {
  kind: NodeKind;
  label: string;
  detail: string;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  delay?: number;
  danger?: boolean;
  instant?: boolean;
  tone?: "paper" | "black";
};

const step: Record<NodeKind, string> = {
  client: "01",
  server: "02",
  database: "03",
};

export const SystemNode: React.FC<SystemNodeProps> = ({
  kind,
  label,
  detail,
  x,
  y,
  width,
  height,
  active,
  delay = 0,
  danger = false,
  instant = false,
  tone = "paper",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dark = tone === "black";
  const enter = instant
    ? 1
    : spring({
        fps,
        frame: Math.max(0, frame - delay),
        config: { damping: 18, stiffness: 130, mass: 0.8 },
      });
  const activePulse = active ? 1 + Math.sin(frame / 5) * 0.012 : 1;
  const borderColor = active
    ? theme.colors.blue
    : dark
      ? "rgba(255,255,255,0.2)"
      : "rgba(17,18,20,0.18)";

  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - height / 2,
        width,
        height,
        transform: `scale(${enter * activePulse})`,
        opacity: enter,
        borderRadius: 26,
        border: `${active ? 3 : 2}px solid ${borderColor}`,
        background: dark ? theme.colors.blackSoft : theme.colors.paperBright,
        boxShadow: active
          ? "0 0 0 7px rgba(23,105,224,0.08), 0 22px 54px rgba(17,18,20,0.10)"
          : dark
            ? "0 20px 55px rgba(0,0,0,0.26)"
            : "0 18px 44px rgba(17,18,20,0.08)",
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "26px 30px",
      }}
    >
      <div
        style={{
          color: theme.colors.blue,
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: "-0.06em",
          lineHeight: 1,
        }}
      >
        {step[kind]}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: dark ? theme.colors.white : theme.colors.ink,
            fontSize: 31,
            fontWeight: 800,
            letterSpacing: "-0.055em",
          }}
        >
          {label}
        </div>
        <div
          style={{
            marginTop: 7,
            color: danger
              ? theme.colors.blueBright
              : dark
                ? theme.colors.grayLight
                : theme.colors.gray,
            fontSize: 19,
            fontWeight: 600,
            lineHeight: 1.22,
          }}
        >
          {detail}
        </div>
      </div>
    </div>
  );
};
