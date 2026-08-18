import { theme } from "../brand/theme";

type PrototypeBadgeProps = {
  tone?: "paper" | "black";
};

export const PrototypeBadge: React.FC<PrototypeBadgeProps> = ({
  tone = "paper",
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 42,
        right: 48,
        color: tone === "black" ? theme.colors.grayLight : theme.colors.gray,
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      Visual prototype
    </div>
  );
};
