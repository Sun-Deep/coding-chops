import { AbsoluteFill } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { Headline } from "../../shared/vertical/type";
import { RUN } from "./measurements";
import { WordTiles } from "./Stage";

const winner = RUN.selected.find((row) => row.word === RUN.winner)!;

export const WordleCover: React.FC = () => (
  <AbsoluteFill
    style={{
      background: theme.colors.black,
      color: theme.colors.chalk,
      fontFamily: theme.fontFamily,
    }}
  >
    <Headline top={458} size={92}>
      Wordle&apos;s best
      <br />
      first guess.
    </Headline>
    <WordTiles frame={240} top={724} settled />
    <div
      style={{
        position: "absolute",
        top: 916,
        left: 150,
        width: 780,
        textAlign: "center",
        fontSize: 180,
        fontWeight: 800,
        letterSpacing: "-0.075em",
        lineHeight: 1,
        color: ACCENT,
      }}
    >
      {winner.meanRemaining.toFixed(1)}
    </div>
    <div
      style={{
        position: "absolute",
        top: 1110,
        left: 150,
        width: 780,
        textAlign: "center",
        fontSize: 38,
        fontWeight: 600,
      }}
    >
      answers left on average
    </div>
    <div
      style={{
        position: "absolute",
        top: 1192,
        left: 150,
        width: 780,
        textAlign: "center",
        fontFamily: theme.monoFamily,
        fontSize: 24,
        color: theme.colors.grayLight,
      }}
    >
      {RUN.guessCount.toLocaleString("en-US")} openers · 2022 answer list
    </div>
    <div
      style={{
        position: "absolute",
        top: 1370,
        width: 1080,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Lockup size={36} tone="black" />
    </div>
  </AbsoluteFill>
);
