export const DISKS = 4;
export const MOVE_COUNT = 15;
export const CALL_COUNT = 31;
export const MAX_DEPTH = 5;

export const MOVES = [
  { disk: 1, from: "A", to: "B" },
  { disk: 2, from: "A", to: "C" },
  { disk: 1, from: "B", to: "C" },
  { disk: 3, from: "A", to: "B" },
  { disk: 1, from: "C", to: "A" },
  { disk: 2, from: "C", to: "B" },
  { disk: 1, from: "A", to: "B" },
  { disk: 4, from: "A", to: "C" },
  { disk: 1, from: "B", to: "C" },
  { disk: 2, from: "B", to: "A" },
  { disk: 1, from: "C", to: "A" },
  { disk: 3, from: "B", to: "C" },
  { disk: 1, from: "A", to: "B" },
  { disk: 2, from: "A", to: "C" },
  { disk: 1, from: "B", to: "C" },
] as const;

export type Peg = (typeof MOVES)[number]["from"];
