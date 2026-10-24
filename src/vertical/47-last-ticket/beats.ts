/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;
export const FPS = 30;

/**
 * The same race played twice, at eye level in one cinema: first with a
 * plain SELECT, then with SELECT ... FOR UPDATE. The taps are the hero
 * race's: 19 ms apart, which on screen is the same frame.
 */
export const TAKE_1 = 0;
export const TAP_1 = 16;
/** Both read seats_left = 1. */
export const READ_1 = 24;
/** Both pay, both update, both get a ticket for F12. */
export const TICKET_1 = 60;
export const WALK_1 = 100;
/** A reaches the seat and sits; B arrives to a taken seat. */
export const SIT_1 = 148;
export const SLUMP_1 = 160;

/** Hard cut: the same two people, the same taps, with the lock. */
export const TAKE_2 = 204;
export const TAP_2 = 214;
/** A's SELECT ... FOR UPDATE locks the row; B's waits for it. */
export const LOCK_2 = 220;
export const TICKET_2 = 236;
/** A commits: the lock opens, and B's read goes through and sees 0. */
export const RELEASE_2 = 262;
export const SOLDOUT_2 = 266;
export const WALK_2 = 272;
export const SIT_2 = 318;

export const VERDICT_FROM = 350;
