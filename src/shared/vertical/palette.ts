import { theme } from "../brand/theme";

/**
 * The one accent a vertical cut is allowed inside a teaching frame.
 *
 * Horizontal work uses cobalt here and keeps the brand orange for the mark, the
 * end card and the thumbnails. Vertical cuts use the orange for both. The
 * argument is in the accent section of `docs/vertical-format-standard.md`; the
 * short version is that a reel is a brand surface in a way a ten minute episode
 * is not, it already carries the mark in every frame, and a cut whose only
 * colour is the channel's own is recognisable at a scroll speed where a title
 * is not.
 *
 * Bright rather than the burnt tone, because the vertical canvas is near black
 * and `#E4571B` goes muddy on it. This is the same value the lockup uses on a
 * dark ground, so the accent inside the frame and the accent on the mark are
 * the same colour rather than two oranges a viewer has to reconcile.
 *
 * It is still one accent and it still means something. Everything neutral on
 * screen is neutral; the orange is the row being looked for, or the path to it.
 * Swapping which hue carries the signal does not license a second one.
 */
export const ACCENT = theme.colors.orangeBright;

/** Text sitting on a solid block of the accent. */
export const ON_ACCENT = theme.colors.black;
