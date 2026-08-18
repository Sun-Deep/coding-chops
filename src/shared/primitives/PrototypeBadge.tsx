import { theme } from "../brand/theme";

export const PrototypeBadge: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 34,
        right: 38,
        padding: "11px 18px",
        borderRadius: theme.radius.pill,
        border: `1px solid ${theme.colors.border}`,
        color: theme.colors.muted,
        background: "rgba(5, 7, 10, 0.7)",
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: 1.4,
        textTransform: "uppercase",
      }}
    >
      Visual prototype
    </div>
  );
};
