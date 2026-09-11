import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";

/**
 * The chat window, and it is ours rather than anyone else's.
 *
 * The figures in this cut come from a model that can be measured, which means a
 * local open one. No commercial model publishes its vocabulary size, block
 * count or logits. Drawing Claude's or ChatGPT's interface around measured Qwen
 * internals would be claiming those numbers belong to them, and the whole point
 * of this format is that a figure on screen came off a real machine and can be
 * checked. The mechanism is identical across transformers; only the badge would
 * have differed, and the badge is the part that would have been false.
 *
 * It is on screen in shot 1 and shot 3 so the interior of the cut sits inside
 * the interface rather than beside it. The viewer sends the message and then
 * watches the answer arrive in the same window.
 */

export const FRAME_WIDTH = 820;
export const FRAME_LEFT = (1080 - FRAME_WIDTH) / 2;

const Bubble: React.FC<{
  role: string;
  text: string;
  own?: boolean;
  opacity?: number;
  caret?: boolean;
}> = ({ role, text, own = false, opacity = 1, caret = false }) => (
  <div style={{ opacity, marginBottom: 26 }}>
    <div
      style={{
        fontFamily: theme.monoFamily,
        fontSize: 17,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: own ? ACCENT : theme.colors.grayDark,
        marginBottom: 10,
      }}
    >
      {role}
    </div>
    <div
      style={{
        fontSize: 30,
        fontWeight: 600,
        lineHeight: 1.34,
        letterSpacing: "-0.015em",
        color: theme.colors.chalk,
      }}
    >
      {text}
      {caret ? (
        <span
          style={{
            display: "inline-block",
            width: 3,
            height: 30,
            marginLeft: 6,
            transform: "translateY(4px)",
            background: ACCENT,
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
  /** Shows the blinking edge while the answer is being written. */
  writing?: boolean;
  opacity?: number;
  /** 0 to 1, how lit the send control is. */
  send?: number;
  /**
   * Reply only: no header, no question bubble.
   *
   * Shot 3 needs the answer arriving without spending three hundred pixels
   * restating what shot 1 established. The full frame there ran a two line
   * answer sixty-two pixels into the object below it.
   */
  reply?: boolean;
}> = ({
  top,
  question,
  answer = "",
  writing = false,
  opacity = 1,
  send = 0,
  reply = false,
}) => (
  <div
    style={{
      position: "absolute",
      top,
      left: FRAME_LEFT,
      width: FRAME_WIDTH,
      opacity,
      padding: "34px 36px 30px",
      boxSizing: "border-box",
      borderRadius: 22,
      border: `1px solid rgba(233,228,216,0.13)`,
      background: "rgba(233,228,216,0.028)",
    }}
  >
    {reply ? null : (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 26,
      }}
    >
      <div
        style={{
          fontFamily: theme.monoFamily,
          fontSize: 16,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: theme.colors.grayDark,
        }}
      >
        Coding Chops
      </div>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          border: `1px solid rgba(233,228,216,${0.12 + send * 0.5})`,
          background: send > 0 ? `rgba(240,110,42,${send * 0.9})` : "transparent",
        }}
      />
    </div>
    )}

    {reply ? null : <Bubble role="You" text={question} own />}
    {answer || writing ? (
      <Bubble role="Model" text={answer} caret={writing} />
    ) : null}
  </div>
);
