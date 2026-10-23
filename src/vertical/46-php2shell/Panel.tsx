import { interpolate } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT, ON_ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import { STEPS as STEPS_AT } from "./beats";
import { FACTS, STEPS, TIMELINE } from "./facts";

/**
 * The panel under the headline. Until the pull-back it is the timeline,
 * the "when": three dates, large. Then it turns into the three things to
 * do, one at a time. Everything in it is from `facts.ts`.
 */

export const PANEL_TOP = 420;
export const PANEL_H = 282;
const LEFT = 96;
const WIDTH = 888;
const C = theme.colors;

const Timeline: React.FC<{ frame: number; opacity: number }> = ({
  frame,
  opacity,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      opacity,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "0 34px",
    }}
  >
    <div
      style={{
        fontFamily: theme.monoFamily,
        fontSize: 19,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: C.grayDark,
        marginBottom: 26,
      }}
    >
      {FACTS.name} · {FACTS.cves.length} flaws in PHP · {FACTS.severity} of 10
    </div>
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 13,
          left: 13,
          right: 13,
          height: 2,
          background: "rgba(233,228,216,0.25)",
        }}
      />
      {TIMELINE.map((t, i) => {
        const a = interpolate(frame, [4 + i * 10, 12 + i * 10], [0, 1], clamp);
        const last = i === TIMELINE.length - 1;
        return (
          <div
            key={t.day}
            style={{
              position: "relative",
              opacity: a,
              display: "flex",
              flexDirection: "column",
              alignItems: i === 0 ? "flex-start" : last ? "flex-end" : "center",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                background: last ? C.chalk : "#0A0B0D",
                border: `3px solid ${C.chalk}`,
              }}
            />
            <div
              style={{
                marginTop: 16,
                fontFamily: theme.fontFamily,
                fontSize: 44,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: C.chalk,
              }}
            >
              {t.day}
            </div>
            <div style={{ fontSize: 24, fontWeight: 600, color: C.grayLight }}>
              {t.what}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const Steps: React.FC<{ frame: number; opacity: number }> = ({
  frame,
  opacity,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      opacity,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: 18,
      padding: "0 30px",
    }}
  >
    {STEPS.map((s, i) => {
      const a = interpolate(
        frame,
        [STEPS_AT + 4 + i * 14, STEPS_AT + 12 + i * 14],
        [0, 1],
        clamp,
      );
      return (
        <div
          key={s.title}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            opacity: a,
            transform: `translateX(${(1 - a) * 16}px)`,
          }}
        >
          <div
            style={{
              flex: "0 0 auto",
              width: 50,
              height: 50,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: i === 1 ? ACCENT : C.chalk,
              color: ON_ACCENT,
              fontFamily: theme.fontFamily,
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            {i + 1}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: theme.fontFamily,
                fontSize: 34,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: C.chalk,
                lineHeight: 1.1,
              }}
            >
              {s.title}
            </div>
            <div
              style={{
                fontFamily: i === 1 ? theme.monoFamily : theme.fontFamily,
                fontSize: 23,
                fontWeight: 600,
                color: C.grayLight,
                whiteSpace: "nowrap",
              }}
            >
              {s.detail}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

export const Panel: React.FC<{ frame: number }> = ({ frame }) => {
  const swap = interpolate(frame, [STEPS_AT - 6, STEPS_AT + 2], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: PANEL_TOP,
        left: LEFT,
        width: WIDTH,
        height: PANEL_H,
        borderRadius: 16,
        background: "#0A0B0D",
        border: "1px solid rgba(233,228,216,0.12)",
        overflow: "hidden",
      }}
    >
      {swap < 1 ? <Timeline frame={frame} opacity={1 - swap} /> : null}
      {swap > 0 ? <Steps frame={frame} opacity={swap} /> : null}
    </div>
  );
};
