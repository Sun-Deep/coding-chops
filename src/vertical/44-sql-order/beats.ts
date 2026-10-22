/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;
export const FPS = 30;

/**
 * When each step of the query starts, in the order Postgres runs them.
 * The narration says each one as it happens; the Blender scene and the
 * terminal both read these frames.
 */
export const STAGES = [
  { clause: "FROM", at: 0, line: 1 },
  { clause: "WHERE", at: 70, line: 2 },
  { clause: "GROUP BY", at: 112, line: 3 },
  { clause: "HAVING", at: 172, line: 4 },
  { clause: "SELECT", at: 206, line: 0 },
  { clause: "ORDER BY", at: 248, line: 5 },
  { clause: "LIMIT", at: 290, line: 6 },
] as const;

export type Clause = (typeof STAGES)[number]["clause"];

/** The frame a step's badge appears in the terminal. */
export const badgeAt = (i: number) => (i === 0 ? 14 : STAGES[i].at);

export const stageAt = (frame: number) => {
  let s = 0;
  for (let i = 0; i < STAGES.length; i++) if (frame >= badgeAt(i)) s = i;
  return s;
};

/** The two lines the order explains, side by side. */
export const PROOF_FROM = 318;
export const VERDICT_FROM = 322;
