import { Lockup } from "../brand/Lockup";
import { LEFT, TOP } from "./geometry";

/**
 * The channel lockup, in every frame of a vertical cut.
 *
 * Section 5 of the production standard says the logo appears once, in the
 * outro, and does not sit over the lesson. That rule is written for a
 * ten-minute horizontal episode, where the viewer arrived through a thumbnail
 * that already carried the channel name and stays long enough to reach the end
 * card. A reel has neither. It arrives mid-scroll with no title attached, most
 * of the people who see it never reach the last second, and a vertical cut with
 * no mark on it is an unattributed clip.
 *
 * So the mark persists here and nowhere else. The reconciliation is recorded in
 * `docs/vertical-format-standard.md` under the production standard's rule
 * change procedure.
 *
 * In the brand colours, not a neutral. It ran in chalk first, on the argument
 * that orange is the teaching accent in this format and a permanent mark
 * carrying it would be the one orange thing on screen that means nothing. That
 * was too careful. The mark is 30 pixels tall, in the header band, above the
 * content area, in the same corner of every frame, while the accent inside the
 * frame is a full width bar or a number at 172. Nothing is competing. What the
 * chalk version actually achieved was a logo that reads as a failed render.
 */
export const Watermark: React.FC<{
  /** 1 while the corner mark is the only lockup, 0 once an end card takes over. */
  fade?: number;
}> = ({ fade = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: LEFT,
      top: TOP,
      // Held back from full so it stays furniture. Below about 0.7 the burnt
      // tone starts going muddy against the near black ground rather than
      // reading as the brand colour.
      opacity: 0.88 * fade,
    }}
  >
    <Lockup size={30} tone="black" />
  </div>
);
