/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;
export const FPS = 30;

/** The first game, played close up: the host opens a goat door. */
export const HOST_OPENS = 24;
/** Your door and the other one open together: where was the car? */
export const REVEAL = 94;
/** Cut to the studio: two contestants, two empty glass cases. */
export const PULL = 118;
/** The cars start dropping as the run starts. */
export const WAVE = 150;
/** The running tallies count through all 10,000 games over these frames. */
export const TALLY_FROM = 150;
export const TALLY_TO = 300;
/** The code panel hands over to the full-size score as the run starts. */
export const BOARD_FROM = TALLY_FROM - 10;
/** The reason is given while the cases fill. */
export const SORT = 236;
/** One toy car in a case for every this many wins. */
export const CAR_WINS = 200;
/** The contestants react once the count is in. */
export const REACT = TALLY_TO + 6;
export const VERDICT_FROM = 322;
