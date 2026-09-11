import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";

/**
 * The chat window, and it is ours rather than anyone else's.
 *
 * The figures in this cut come from a model that can be measured, which means a
 * local open one. No commercial model publishes its vocabulary size, block
 * count or logits. Drawing Claude's or ChatGPT's interface around measured Qwen
 * internals would be claiming those numbers belong to them.
 *
 * It is on screen for the whole cut, in one place, at a fixed height. The
 * viewer sends a message and watches it come apart, go through the network and
 * come back as an answer without ever losing the thing they typed.
 *
 * Fixed height matters. The first version let the card grow as the answer
 * filled and it ran sixty-two pixels into the object below it, then a later one
 * moved the card between shots so the interface jumped. The answer's space is
 * reserved from the first frame, which is also what a real chat window does
 * while it waits.
 */

export const FRAME_WIDTH = 820;
export const FRAME_LEFT = (1080 - FRAME_WIDTH) / 2;
/** Reserved from frame zero so nothing below it ever moves. */
export const FRAME_HEIGHT = 216;
export const FRAME_BOTTOM_GAP = 26;

const Bubble: React.FC<{
  text: string;
  align: "left" | "right";
  opacity?: number;
  caret?: boolean;
}> = ({ text, align, opacity = 1, caret = false }) => (
  <div
    style={{
      display: "flex",
      justifyContent: align === "right" ? "flex-end" : "flex-start",
      opacity,
    }}
  >
    <div
      style={{
        maxWidth: "86%",
        padding: "13px 20px 14px",
        borderRadius: 18,
        background: ACCENT,
        color: theme.colors.paperBright,
        fontSize: 29,
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: "-0.012em",
      }}
    >
      {text}
      {caret ? (
        <span
          style={{
            display: "inline-block",
            width: 3,
            height: 27,
            marginLeft: 5,
            transform: "translateY(4px)",
            background: theme.colors.paperBright,
          }}
        />
      ) : null}
    </div>
  </div>
);

export const ChatFrame: React.FC<{
  top: number;
  question: string;
  /** The assistant text so far. Empty until shot 3 starts filling it. */
  answer?: string;
  /** Shows the writing edge while the answer is being produced. */
  writing?: boolean;
  opacity?: number;
  /** 0 to 1, how lit the send control is. */
  send?: number;
}> = ({ top, question, answer = "", writing = false, opacity = 1, send = 0 }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: FRAME_LEFT,
      width: FRAME_WIDTH,
      height: FRAME_HEIGHT,
      opacity,
      padding: "22px 24px",
      boxSizing: "border-box",
      borderRadius: 22,
      border: `1px solid rgba(233,228,216,0.13)`,
      background: "rgba(233,228,216,0.028)",
      display: "flex",
      flexDirection: "column",
      gap: 16,
    }}
  >
    {/* Never dimmed. Dimming it to a quarter turned the bubble muddy brown with
        grey text, which reads as a broken render rather than as a deliberate
        step back, and the whole reason the window stays is that the viewer can
        see what they typed for the entire cut. */}
    <Bubble text={question} align="right" />
    {answer || writing ? (
      <Bubble text={answer} align="left" caret={writing} />
    ) : null}

    {send > 0 ? (
      <div
        style={{
          position: "absolute",
          right: 24,
          bottom: 20,
          width: 26,
          height: 26,
          borderRadius: 13,
          background: `rgba(240,110,42,${send * 0.9})`,
        }}
      />
    ) : null}
  </div>
);
