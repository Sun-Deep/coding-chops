import * as B from "./beats";
import { GAME } from "./gameplay";
import type { Feedback } from "./wordle";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
export const GAME_COLORS = {
  empty: "#121213",
  border: "#3A3A3C",
  absent: "#3A3A3C",
  present: "#B59F3B",
  correct: "#538D4E",
  key: "#818384",
  text: "#F8F8F8",
} as const;
export type TileState = {
  letter: string;
  status: Feedback | -1;
  angle: number;
  lift: number;
};

const rowState = (
  word: string,
  statuses: readonly number[],
  typedAt: number,
  flippedAt: number,
  frame: number,
  win = false,
): TileState[] =>
  [...word].map((letter, i) => {
    const typed = frame >= typedAt + i * B.TYPE_STEP;
    const p = clamp((frame - flippedAt - i * B.FLIP_STEP) / B.FLIP_DURATION);
    const sinceWin = frame - B.WIN - i * 3;
    return {
      letter: typed ? letter.toUpperCase() : "",
      status: p >= 0.5 ? (statuses[i] as Feedback) : -1,
      angle: p < 0.5 ? p * Math.PI : (p - 1) * Math.PI,
      lift:
        win && sinceWin >= 0 && sinceWin < 18
          ? Math.sin((sinceWin / 18) * Math.PI) * 0.12
          : 0,
    };
  });

export const gameAt = (frame: number) => {
  const second = frame >= B.RESET;
  const empty = (): TileState => ({
    letter: "",
    status: -1,
    angle: 0,
    lift: 0,
  });
  const rows = Array.from({ length: 6 }, () =>
    Array.from({ length: 5 }, empty),
  );
  const word = second ? "roate" : "adieu";
  const from = second ? B.TYPE_B : B.TYPE_A;
  const flip = second ? B.FLIP_B : B.FLIP_A;
  rows[0] = rowState(word, GAME.feedback[word], from, flip, frame);
  if (second)
    rows[1] = rowState(
      GAME.answer,
      GAME.feedback.solved,
      B.TYPE_SOLVE,
      B.FLIP_SOLVE,
      frame,
      true,
    );
  const keyboard: Record<string, number> = {};
  let pressed = "";
  for (const [index, row] of rows.entries()) {
    for (const tile of row)
      if (tile.status >= 0 && tile.letter)
        keyboard[tile.letter] = Math.max(
          keyboard[tile.letter] ?? -1,
          tile.status,
        );
    const start = index === 0 ? from : B.TYPE_SOLVE;
    const at = Math.floor((frame - start) / B.TYPE_STEP);
    if (
      at >= 0 &&
      at < 5 &&
      frame - start - at * B.TYPE_STEP < 3 &&
      (index === 0 || second)
    )
      pressed = (index === 0 ? word : GAME.answer)[at].toUpperCase();
  }
  for (const at of [from + 32, ...(second ? [B.TYPE_SOLVE + 32] : [])]) {
    if (frame >= at && frame < at + 3) pressed = "ENTER";
  }
  const revealed = Math.max(
    0,
    Math.min(
      5,
      Math.floor((frame - flip - B.FLIP_DURATION / 2) / B.FLIP_STEP) + 1,
    ),
  );
  const count = frame >= B.WIN ? 1 : GAME.steps[word][revealed];
  const turn = clamp((frame - B.RESET) / (B.TYPE_B - B.RESET));
  return {
    rows,
    keyboard,
    pressed,
    count,
    second,
    reset: second && frame < B.TYPE_B,
    turn,
    won: frame >= B.WIN,
    word,
  };
};
