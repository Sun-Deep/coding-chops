/**
 * The vertical frame, and the parts of it a phone gives back.
 *
 * A 9:16 upload is not a canvas. Every surface that plays one lays its own
 * interface over the top, and the parts it covers differ per platform and move
 * between releases. The numbers here are the union of the worst case on
 * Facebook Reels, Instagram Reels, YouTube Shorts and TikTok, measured off
 * screenshots at 1080 wide in September 2026 and recorded in
 * `docs/vertical-format-standard.md` with what each one covers.
 *
 * Composing to the union rather than per platform means one master file
 * uploads everywhere. Cutting a second version per platform is how a channel
 * ends up with four files that have quietly drifted apart.
 */

export const WIDTH = 1080;
export const HEIGHT = 1920;

/**
 * The band above the frame that the header eats: the follow button, the sound
 * name, the back arrow, and on Shorts the search bar.
 */
export const TOP = 190;

/**
 * The band below the frame that the caption, the handle, the audio ticker and
 * the progress bar eat. The largest reserve in the layout by a long way, and
 * the one that most often gets a reel cropped, because a composition centred in
 * 1920 puts its closing line right in it.
 */
export const BOTTOM_RESERVE = 420;
export const BOTTOM = HEIGHT - BOTTOM_RESERVE;

/** Side margins. Nothing covers these; they are optical breathing room. */
export const LEFT = 96;
export const RIGHT = WIDTH - 96;

/**
 * The like, comment, share and profile column on the right.
 *
 * It only exists in the lower part of the frame, so the header band can run
 * wider than the body. Anything below `RAIL_FROM` stays left of `RAIL_EDGE`.
 */
export const RAIL_WIDTH = 150;
export const RAIL_EDGE = WIDTH - RAIL_WIDTH;
export const RAIL_FROM = 1000;

/**
 * The widest a block may be, given where it sits.
 *
 * Centred, so clearing the rail means losing the same width on the left. A
 * block shoved left to dodge the rail reads as a layout mistake, and the eye
 * finds an off-centre column faster than it finds the buttons.
 */
export const columnWidth = (top: number) =>
  top >= RAIL_FROM ? 2 * (RAIL_EDGE - WIDTH / 2) : RIGHT - LEFT;

/** Left edge of that centred column. */
export const columnLeft = (top: number) => (WIDTH - columnWidth(top)) / 2;

/**
 * The centred square, for a cover.
 *
 * A reel cover is shown at 9:16 in the feed and cropped for the profile grid:
 * 1:1 on TikTok, 3:4 on Instagram. The square is the tighter of the two, so a
 * cover whose subject sits inside it survives both. Everything outside is
 * background that may be cut without loss.
 */
export const SQUARE_TOP = (HEIGHT - WIDTH) / 2;
export const SQUARE_BOTTOM = SQUARE_TOP + WIDTH;

/** The 3:4 profile-grid crop, for reference in review overlays. */
export const PORTRAIT_HEIGHT = (WIDTH * 4) / 3;
export const PORTRAIT_TOP = (HEIGHT - PORTRAIT_HEIGHT) / 2;
export const PORTRAIT_BOTTOM = PORTRAIT_TOP + PORTRAIT_HEIGHT;
