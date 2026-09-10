import { AbsoluteFill } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { theme } from "../../shared/brand/theme";
import { SQUARE_BOTTOM, SQUARE_TOP } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline, Label, Readout } from "../../shared/vertical/type";
import { Tokens, type Piece } from "./parts";
import { MODEL, PROMPT, TEMPLATED, commas } from "./measurements";

/**
 * The cover.
 *
 * Uploaded at 9:16 and cropped by everything that shows it: 1:1 on the TikTok
 * grid, 3:4 on Instagram. The square is the tightest, so everything sits
 * between `SQUARE_TOP` and `SQUARE_BOTTOM`.
 *
 * The chips are the cut's own picture and they carry the promise. VR05 taught
 * this the hard way: a cover of pure type turns into a page of numbers at grid
 * size, and the two cuts on this page that stop a scroll are the two with an
 * object on the cover.
 *
 * It states the finding rather than teasing it. Six became twenty-five is the
 * surprise the reel delivers in its first six seconds.
 */
const PIECES: readonly Piece[] = TEMPLATED.map((p) => ({
  text: p.text,
  id: p.id,
  fromTemplate: !p.own,
}));

export const OneTokenAtATimeCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 44%, #161D2A 0%, ${theme.colors.black} 66%)`,
    }}
  >
    <Eyebrow top={SQUARE_TOP + 52}>One forward pass · visualized</Eyebrow>

    <Headline top={SQUARE_TOP + 120} size={92}>
      You typed 6 tokens.
    </Headline>
    <Headline top={SQUARE_TOP + 226} size={92} color={ACCENT}>
      It received 25.
    </Headline>

    <Tokens
      top={SQUARE_TOP + 372}
      pieces={PIECES}
      ownReveal={1}
      templateReveal={1}
    />

    <Readout
      top={SQUARE_TOP + 726}
      size={30}
      color={theme.colors.grayLight}
    >
      then {commas(MODEL.vocab)} scored, one kept
    </Readout>

    <Label top={SQUARE_TOP + 800}>
      {PROMPT.text}
    </Label>

    <div
      style={{
        position: "absolute",
        top: SQUARE_BOTTOM - 62,
        left: 0,
        width: 1080,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Lockup size={30} tone="black" />
    </div>
  </AbsoluteFill>
);
