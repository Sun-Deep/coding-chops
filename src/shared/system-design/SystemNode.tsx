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
};

const icons: Record<NodeKind, string> = {
  client: "◉",
  server: "▦",
  database: "▤",
};

const accent: Record<NodeKind, string> = {
  client: theme.colors.blue,
  server: theme.colors.cyan,
  database: theme.colors.green,
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
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = instant
    ? 1
    : spring({
        fps,
        frame: Math.max(0, frame - delay),
        config: { damping: 18, stiffness: 130, mass: 0.8 },
      });
  const activePulse = active ? 1 + Math.sin(frame / 5) * 0.018 : 1;
  const color = danger ? theme.colors.red : accent[kind];

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
        borderRadius: theme.radius.card,
        border: `2px solid ${active ? color : theme.colors.border}`,
        background: theme.colors.surface,
        boxShadow: active
          ? `0 0 0 8px ${color}18, 0 26px 80px rgba(0,0,0,0.45)`
          : theme.shadow,
        display: "flex",
        alignItems: "center",
        gap: 22,
        padding: "26px 30px",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 22,
          display: "grid",
          placeItems: "center",
          background: `${color}1E`,
          color,
          fontSize: 40,
          fontWeight: 800,
        }}
      >
        {icons[kind]}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 30, fontWeight: 760, letterSpacing: -0.7 }}>
          {label}
        </div>
        <div
          style={{
            marginTop: 8,
            color: theme.colors.muted,
            fontSize: 19,
            lineHeight: 1.25,
          }}
        >
          {detail}
        </div>
      </div>
    </div>
  );
};
