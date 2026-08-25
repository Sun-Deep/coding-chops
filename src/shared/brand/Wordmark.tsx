import { theme } from "./theme";

/**
 * The channel wordmark.
 *
 * The name is set in type rather than drawn, because the visual language
 * rejects logos wherever typography can carry the name. The channel mark that
 * belongs beside it lives in `Logo`, and the two are locked up together only in
 * the outro. Cobalt falls on the second word, so the wordmark uses the same
 * single accent as everything else in the frame.
 */
export const Wordmark: React.FC<{
  size?: number;
  opacity?: number;
}> = ({ size = 64, opacity = 1 }) => (
  <div
    style={{
      display: "flex",
      alignItems: "baseline",
      gap: size * 0.18,
      opacity,
      fontFamily: theme.fontFamily,
      fontSize: size,
      fontWeight: 800,
      letterSpacing: "-0.055em",
      lineHeight: 1,
    }}
  >
    <span style={{ color: theme.colors.ink }}>Coding</span>
    <span style={{ color: theme.colors.blue }}>Chops</span>
  </div>
);
