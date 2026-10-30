import { Easing, interpolate } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import * as B from "./beats";
import { RUN } from "./measurements";

const ease = { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) };
const n = (value: number) => value.toLocaleString("en-US");
const adieu = RUN.selected.find((row) => row.word === "adieu")!;
const winner = RUN.selected.find((row) => row.word === RUN.winner)!;

export const WordTiles: React.FC<{
  frame: number;
  top?: number;
  scale?: number;
  settled?: boolean;
}> = ({ frame, top = 514, scale = 1, settled = false }) => (
  <div
    style={{
      position: "absolute",
      left: 192,
      top,
      width: 696,
      height: 128,
      display: "flex",
      gap: 14,
      transform: `scale(${scale})`,
      transformOrigin: "50% 50%",
      perspective: 900,
    }}
  >
    {[0, 1, 2, 3, 4].map((i) => {
      const p = settled
        ? 1
        : interpolate(
            frame,
            [B.SECOND_GUESS + i * 3, B.SECOND_GUESS + i * 3 + 12],
            [0, 1],
            clamp,
          );
      const won = p >= 0.5;
      const turn = p < 0.5 ? p * 180 : (p - 1) * 180;
      const lift = settled
        ? 0
        : interpolate(frame, [-12 + i * 2, 10 + i * 2], [16, 0], ease);
      return (
        <div
          key={i}
          style={{
            width: 128,
            height: 128,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 7,
            border: `2px solid ${won ? ACCENT : "#706E68"}`,
            background: won
              ? ACCENT
              : "linear-gradient(145deg, #3A3935, #242421 78%)",
            boxShadow:
              "inset 0 2px 0 #ffffff25, 0 7px 0 #141412, 0 16px 25px #00000080",
            color: won ? theme.colors.black : theme.colors.chalk,
            fontSize: 80,
            fontWeight: 800,
            lineHeight: 1,
            transform: `translateY(${lift}px) rotateX(${turn}deg)`,
          }}
        >
          {(won ? RUN.winner : "adieu")[i].toUpperCase()}
        </div>
      );
    })}
  </div>
);

export const Stage: React.FC<{ frame: number }> = ({ frame }) => {
  const second = frame >= B.SECOND_GUESS;
  const start = second ? B.SECOND_GUESS + 12 : -1;
  const finish = second ? B.WINNER_LANDS : 62;
  const progress = interpolate(frame, [start, finish], [0, 1], clamp);
  const trace = second ? RUN.traces.roate : RUN.traces.adieu;
  const index = Math.min(
    trace.length - 1,
    Math.max(0, Math.floor(progress * (trace.length - 1))),
  );
  const sample = trace[index];
  const ticket = trace[Math.floor(index / 24) * 24];
  const done = progress === 1;
  const value = done
    ? second
      ? winner.meanRemaining
      : adieu.meanRemaining
    : sample.mean;
  const color = second && frame >= B.WINNER_LANDS ? ACCENT : theme.colors.chalk;
  const verdict = interpolate(frame, [B.COMPARE, B.COMPARE + 16], [0, 1], ease);
  const ticketOpacity = interpolate(progress, [0, 0.87, 1], [1, 1, 0], clamp);
  const phase = (((frame - start) % 24) + 24) % 24;
  const ticketMove = interpolate(
    phase,
    [0, 3, 21, 24],
    [640, 0, 0, -640],
    ease,
  );

  return (
    <>
      <WordTiles frame={frame} />
      <div
        style={{
          position: "absolute",
          top: 684,
          left: 150,
          width: 780,
          textAlign: "center",
          fontFamily: theme.monoFamily,
          fontSize: 23,
          letterSpacing: "0.07em",
          color: theme.colors.grayDark,
        }}
      >
        {second && done
          ? `BEST OF ${n(RUN.guessCount)} OPENERS`
          : "ONE GUESS · EVERY POSSIBLE ANSWER"}
      </div>
      <div
        style={{
          position: "absolute",
          top: 752,
          left: 0,
          width: 1080,
          height: 142,
          overflow: "hidden",
          opacity: ticketOpacity,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 225,
            width: 630,
            height: 118,
            padding: "18px 28px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 4,
            background: "linear-gradient(135deg, #F4F2EC, #D5D1C7)",
            color: theme.colors.ink,
            boxShadow: "0 14px 24px #00000085",
            transform: `translateX(${ticketMove}px) rotate(${ticketMove / 180}deg)`,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 17,
                fontFamily: theme.monoFamily,
                color: "#55554F",
                marginBottom: 4,
              }}
            >
              IF THE ANSWER IS
            </div>
            <div
              style={{
                fontSize: 39,
                fontFamily: theme.monoFamily,
                fontWeight: 700,
                letterSpacing: "0.06em",
              }}
            >
              {ticket.answer.toUpperCase()}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span
              style={{
                fontSize: 50,
                fontWeight: 800,
                letterSpacing: "-0.04em",
              }}
            >
              {ticket.left}
            </span>
            <div style={{ fontSize: 19, fontWeight: 600 }}>
              answers still fit
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 786,
          left: 192,
          width: 696,
          opacity: verdict,
          transform: `translateY(${(1 - verdict) * 20}px)`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          borderBottom: "1px solid #55544F",
          paddingBottom: 19,
          color: theme.colors.grayLight,
        }}
      >
        <span
          style={{
            fontFamily: theme.monoFamily,
            fontSize: 36,
            letterSpacing: "0.08em",
          }}
        >
          ADIEU
        </span>
        <span
          style={{
            fontSize: 66,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.05em",
          }}
        >
          {adieu.meanRemaining.toFixed(1)}
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 899,
          left: 150,
          width: 780,
          textAlign: "center",
          color,
          fontSize: 190,
          fontWeight: 800,
          letterSpacing: "-0.075em",
          lineHeight: 1.05,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value.toFixed(1)}
      </div>
      <div
        style={{
          position: "absolute",
          top: 1110,
          left: 150,
          width: 780,
          textAlign: "center",
          fontSize: 35,
          fontWeight: 600,
          color: theme.colors.chalk,
        }}
      >
        answers left {done ? "on average" : "· mean so far"}
      </div>
      <div
        style={{
          position: "absolute",
          top: 1173,
          left: 150,
          width: 780,
          textAlign: "center",
          fontFamily: theme.monoFamily,
          fontSize: 22,
          color: theme.colors.grayDark,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {done
          ? `${n(RUN.answerCount)} answers tested`
          : `${n(sample.tested)} / ${n(RUN.answerCount)} answers tested`}
      </div>
      <div
        style={{
          position: "absolute",
          top: 1230,
          left: 150,
          width: 780,
          textAlign: "center",
          fontSize: 23,
          color: theme.colors.grayLight,
        }}
      >
        2022 answer list · each answer equally likely
      </div>
    </>
  );
};
