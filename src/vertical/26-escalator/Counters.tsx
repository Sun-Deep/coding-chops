import { useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { SIM_FROM, simAt } from "./beats";
import { upBy } from "./runs";

/**
 * What each escalator has delivered to the top since the reel began, over
 * the escalator it belongs to. The rule is the label; the count is the
 * result, climbing at a different rate on each side.
 */
const LABEL_TOP = 436;
const COUNT_TOP = 464;
const CENTRES = { walkLeft: 340, standBoth: 740 };
const LABELS = {
  walkLeft: "Stand right, walk left",
  standBoth: "Stand on both sides",
};

export const Counters: React.FC = () => {
  const frame = useCurrentFrame();
  const t = simAt(frame);
  return (
    <>
      {(["walkLeft", "standBoth"] as const).map((k) => (
        <div key={k}>
          <div
            style={{
              position: "absolute",
              top: LABEL_TOP,
              left: CENTRES[k] - 200,
              width: 400,
              textAlign: "center",
              fontFamily: theme.monoFamily,
              fontSize: 21,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: theme.colors.chalk,
            }}
          >
            {LABELS[k]}
          </div>
          <div
            style={{
              position: "absolute",
              top: COUNT_TOP,
              left: CENTRES[k] - 200,
              width: 400,
              textAlign: "center",
              fontFamily: theme.monoFamily,
              fontVariantNumeric: "tabular-nums",
              fontSize: 46,
              fontWeight: 600,
              color: theme.colors.chalk,
            }}
          >
            {upBy(k, SIM_FROM, t)}
            <span
              style={{ fontSize: 20, letterSpacing: "0.14em", marginLeft: 12 }}
            >
              UP
            </span>
          </div>
        </div>
      ))}
    </>
  );
};
