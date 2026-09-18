import { AbsoluteFill } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline, Provenance } from "../../shared/vertical/type";
import { PROVENANCE_TOP } from "./layout";
import { BYTES, DEFLATE } from "./measurements";
import { Sheet } from "./Sheet";
import { ZipTarget } from "./ZipTarget";

const n = (v: number) => v.toLocaleString("en-US");

/**
 * The shot, which is one shot.
 *
 * Three beats on one object rather than three layouts: the head reading, the
 * repeats firing back, and the file collapsing onto what the encoder actually
 * kept. The playbook asks for three shots and warns that three sharing a layout
 * never works, and the exception it allows is exactly this -- the comparison is
 * between the file before and the file after, so cutting away from it would
 * throw away the only thing being compared.
 *
 * Under the card are the two files drawn to the same scale. That is what makes
 * this a zip being made rather than a log being marked up, and it was missing
 * from the first cut: the mechanism was all there and nothing on screen said
 * what it was for.
 *
 * The headline is up from frame zero and stays. At feed size it is the only
 * thing read before the decision to keep watching is made, and the sheet under
 * it is too fine to carry that on its own.
 */
export const Zip: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: theme.fontFamily }}>
    <Eyebrow top={242}>File compression</Eyebrow>
    <Headline top={268} size={58}>
      Zip finds what you
    </Headline>
    <Headline top={326} size={58} color={ACCENT}>
      already said.
    </Headline>

    <Sheet />
    <ZipTarget />

    <Provenance top={PROVENANCE_TOP}>
      zlib deflate, level 9 &middot; {n(BYTES)} bytes in, {DEFLATE.out} out
    </Provenance>
  </AbsoluteFill>
);
