import { AbsoluteFill } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { theme } from "../../shared/brand/theme";
import { SQUARE_TOP, WIDTH } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline } from "../../shared/vertical/type";
import { SCREEN_SAFE, SETUP } from "./measurements";

const groups = ["aaaaa", "aaaa | a", "aaa | aa", "aaa | a | a"];

/** The cover names the input and the measured result. */
export const RegexBacktrackingCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 43%, #151B27 0%, ${theme.colors.black} 70%)`,
    }}
  >
    <Eyebrow top={SQUARE_TOP + 48}>REGEX BACKTRACKING</Eyebrow>

    <div
      style={{
        position: "absolute",
        top: SQUARE_TOP + 96,
        left: 0,
        width: WIDTH,
        textAlign: "center",
        fontFamily: theme.monoFamily,
        fontSize: 70,
        fontWeight: 700,
        letterSpacing: "-0.035em",
      }}
    >
      ^(a<span style={{ color: ACCENT }}>+</span>)
      <span style={{ color: ACCENT }}>+</span>$
    </div>

    <Headline top={SQUARE_TOP + 202} size={92}>
      {SETUP.headlineRun} a&apos;s + X.
      <br />
      <span style={{ color: ACCENT }}>
        {SCREEN_SAFE.pythonSeconds} seconds.
      </span>
    </Headline>

    <div
      style={{
        position: "absolute",
        top: SQUARE_TOP + 420,
        left: 0,
        width: WIDTH,
        textAlign: "center",
        fontFamily: theme.monoFamily,
        fontSize: 20,
        fontWeight: 500,
        letterSpacing: "0.14em",
        color: theme.colors.grayDark,
      }}
    >
      PYTHON {SETUP.python} · MEDIAN OF {SETUP.runsPerPoint} RUNS
    </div>

    <div
      style={{
        position: "absolute",
        top: SQUARE_TOP + 482,
        left: 190,
        width: 700,
        fontFamily: theme.monoFamily,
        fontSize: 28,
        fontWeight: 500,
        lineHeight: 1.9,
        letterSpacing: "0.08em",
      }}
    >
      {groups.map((group, index) => (
        <div
          key={group}
          style={{
            opacity: 1 - index * 0.2,
            transform: `translateX(${index * 34}px)`,
          }}
        >
          {group} <span style={{ color: ACCENT }}>×</span>
        </div>
      ))}
    </div>

    <div
      style={{
        position: "absolute",
        bottom: 232,
        left: 0,
        width: WIDTH,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Lockup size={40} tone="mono" />
    </div>
  </AbsoluteFill>
);
