import { Img, OffthreadVideo, staticFile } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import * as B from "./beats";
import { gameAt } from "./game";
import { GAME } from "./gameplay";
import { RUN } from "./measurements";

export const SCENE_TOP = 320;
export const SCENE_H = 900;
const adieu = RUN.selected.find((row) => row.word === "adieu")!;
const winner = RUN.selected.find((row) => row.word === RUN.winner)!;

export const Stage: React.FC<{
  frame: number;
  still?: string;
  cover?: boolean;
}> = ({ frame, still, cover = false }) => {
  const game = gameAt(frame);
  const compare = frame >= B.COMPARE;
  const candidates =
    game.second && frame >= B.FLIP_B + 34 && frame < B.TYPE_SOLVE;
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: SCENE_TOP,
          left: 0,
          width: 1080,
          height: SCENE_H,
          overflow: "hidden",
        }}
      >
        {still ? (
          <Img
            src={staticFile(still)}
            style={{ width: 1080, height: SCENE_H }}
          />
        ) : (
          <OffthreadVideo
            src={staticFile("vr54/board.mp4")}
            muted
            style={{ width: 1080, height: SCENE_H }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(#050505 0%, transparent 5%, transparent 98%, #050505 100%)",
          }}
        />
      </div>
      {cover ? null : (
        <div
          style={{
            position: "absolute",
            top: 1220,
            left: 150,
            width: 780,
            textAlign: "center",
            color: theme.colors.chalk,
          }}
        >
          {compare ? (
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "center",
                gap: 48,
                fontSize: 39,
                lineHeight: 1.13,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <span>ADIEU {adieu.meanRemaining.toFixed(1)}</span>
              <span style={{ color: ACCENT }}>
                ROATE {winner.meanRemaining.toFixed(1)}
              </span>
            </div>
          ) : (
            <div
              style={{
                fontSize: 40,
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {game.count.toLocaleString("en-US")}{" "}
              {game.count === 1 ? "answer" : "answers"} left
            </div>
          )}
          <div
            style={{
              marginTop: 7,
              fontFamily: theme.monoFamily,
              fontSize: candidates ? 32 : 21,
              lineHeight: candidates ? 1 : 1.2,
              color: theme.colors.grayLight,
            }}
          >
            {compare
              ? "Average answers left · 2022 list · equally likely answers"
              : candidates
                ? GAME.roate.map((word) => word.toUpperCase()).join(" · ")
                : "This puzzle · replay from the historical list"}
          </div>
        </div>
      )}
    </>
  );
};
