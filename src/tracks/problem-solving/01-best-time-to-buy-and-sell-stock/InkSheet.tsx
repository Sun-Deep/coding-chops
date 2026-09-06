import { interpolate, useCurrentFrame } from "remotion";
import { Canvas } from "../../../shared/primitives/Canvas";
import { Ink } from "../../../shared/ink/Ink";
import type { InkMark } from "../../../shared/ink/types";
import { problemSolvingMotion } from "../../../shared/page/motion";
import { theme } from "../../../shared/brand/theme";
import { clamp } from "../../../shared/video/timing";
import arrow01 from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/arrow-01.json";
import arrow02 from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/arrow-02.json";
import arrow03 from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/arrow-03.json";
import arrow04 from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/arrow-04.json";
import circle01 from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/circle-01.json";
import circle02 from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/circle-02.json";
import circle03 from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/circle-03.json";
import circle04 from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/circle-04.json";
import circle05 from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/circle-05.json";
import circle06 from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/circle-06.json";
import strikeX01 from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/strike-x-01.json";
import strikeX02 from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/strike-x-02.json";
import strikeX03 from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/strike-x-03.json";
import strikeX04 from "../../../../curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/ink/strike-x-04.json";

const M = problemSolvingMotion;

/** How long each role takes to draw, from section 2. */
const DURATION = {
  circle: M.circle.duration,
  strike: M.strike.duration,
  arrow: 10,
};

const load = (data: unknown) => data as unknown as InkMark;

const MARKS = [
  { name: "circle-01", role: "circle", mark: load(circle01) },
  { name: "circle-02", role: "circle", mark: load(circle02) },
  { name: "circle-03", role: "circle", mark: load(circle03) },
  { name: "circle-04", role: "circle", mark: load(circle04) },
  { name: "circle-05", role: "circle", mark: load(circle05) },
  { name: "circle-06", role: "circle", mark: load(circle06) },
  { name: "strike-x-01", role: "strike", mark: load(strikeX01) },
  { name: "strike-x-02", role: "strike", mark: load(strikeX02) },
  { name: "strike-x-03", role: "strike", mark: load(strikeX03) },
  { name: "strike-x-04", role: "strike", mark: load(strikeX04) },
  { name: "arrow-01", role: "arrow", mark: load(arrow01) },
  { name: "arrow-02", role: "arrow", mark: load(arrow02) },
  { name: "arrow-03", role: "arrow", mark: load(arrow03) },
  { name: "arrow-04", role: "arrow", mark: load(arrow04) },
] as const;

const COLUMNS = 5;
const STAGGER = 8;
const SIZE = 130;

const cellX = (i: number) => 224 + (i % COLUMNS) * 368;
const cellY = (i: number) => 300 + Math.floor(i / COLUMNS) * 250;

/**
 * Every captured mark on one sheet, drawing at its own role's duration.
 *
 * This is the review surface for ink. Marks repeat across nine scenes, so what
 * matters here is not whether one circle looks right but whether six of them
 * look like six circles rather than one circle pasted six times.
 */
export const InkSheet: React.FC<{ still?: boolean }> = ({ still = false }) => {
  const frame = useCurrentFrame();

  return (
    <Canvas tone="paper" padding={0}>
      <div
        style={{
          position: "absolute",
          left: 224,
          top: 132,
          fontFamily: theme.fontFamily,
          fontSize: 44,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: theme.colors.ink,
        }}
      >
        PS01 ink marks
      </div>
      <div
        style={{
          position: "absolute",
          left: 224,
          top: 188,
          fontFamily: theme.monoFamily,
          fontSize: 18,
          color: theme.colors.gray,
        }}
      >
        {MARKS.length} marks. circle {DURATION.circle}f, strike{" "}
        {DURATION.strike}f, arrow {DURATION.arrow}f.
      </div>

      {MARKS.map((entry, i) => {
        const start = i * STAGGER;
        const duration = DURATION[entry.role];
        const progress = still
          ? 1
          : interpolate(frame, [start, start + duration], [0, 1], clamp);

        return (
          <div key={entry.name}>
            <Ink
              mark={entry.mark}
              progress={progress}
              at={{ x: cellX(i), y: cellY(i) }}
              size={SIZE}
            />
            <div
              style={{
                position: "absolute",
                left: cellX(i) - 120,
                top: cellY(i) + 92,
                width: 240,
                textAlign: "center",
                fontFamily: theme.monoFamily,
                fontSize: 16,
                color: theme.colors.gray,
                opacity: progress > 0 ? 1 : 0,
              }}
            >
              {entry.name}
            </div>
          </div>
        );
      })}
    </Canvas>
  );
};
