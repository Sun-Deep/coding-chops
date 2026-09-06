import { theme } from "./theme";
import { HEIGHT, MARK_PATH, VIEW_BOX, WIDTH } from "./geometry";

/**
 * The channel mark: CC, drawn as two angular C forms.
 *
 * Sized by height, because that is what the lockup matches to the wordmark's
 * cap height. Width follows from the mark's own proportion rather than being
 * passed in, so no caller can stretch it.
 */
export const Mark: React.FC<{
  height?: number;
  color?: string;
  opacity?: number;
}> = ({ height = 62, color = theme.colors.orange, opacity = 1 }) => (
  <svg
    viewBox={VIEW_BOX}
    width={(height * WIDTH) / HEIGHT}
    height={height}
    fill="none"
    style={{ opacity, flexShrink: 0, display: "block" }}
    role="img"
    aria-label="Coding Chops"
  >
    <path d={MARK_PATH} fill={color} fillRule="evenodd" />
  </svg>
);
