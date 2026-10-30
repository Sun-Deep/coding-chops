import { AbsoluteFill, Img, staticFile } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { Headline } from "../../shared/vertical/type";
import { RUN } from "./measurements";
const winner = RUN.selected.find((row) => row.word === RUN.winner)!;

export const WordleCover: React.FC = () => (
  <AbsoluteFill
    style={{
      background: theme.colors.black,
      color: theme.colors.chalk,
      fontFamily: theme.fontFamily,
    }}
  >
    <Headline top={442} size={80}>
      Wordle&apos;s best opener.
    </Headline>
    <div
      style={{
        position: "absolute",
        top: 520,
        left: 90,
        width: 900,
        height: 750,
      }}
    >
      <Img
        src={staticFile("vr54/board-cover.png")}
        style={{ width: 900, height: 750 }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(#050505 0%, transparent 5%, transparent 98%, #050505 100%)",
        }}
      />
    </div>
    <div
      style={{
        position: "absolute",
        top: 1300,
        left: 150,
        width: 780,
        textAlign: "center",
        fontSize: 40,
        fontWeight: 800,
      }}
    >
      ROATE ·{" "}
      <span style={{ color: ACCENT }}>
        {winner.meanRemaining.toFixed(1)} left on average
      </span>
    </div>
    <div
      style={{
        position: "absolute",
        top: 1360,
        left: 150,
        width: 780,
        textAlign: "center",
        fontSize: 21,
        color: theme.colors.grayLight,
      }}
    >
      2022 answer list · all openers tested
    </div>
    <div
      style={{
        position: "absolute",
        top: 1430,
        width: 1080,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Lockup size={30} tone="black" />
    </div>
  </AbsoluteFill>
);
