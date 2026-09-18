import { AbsoluteFill } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline, Provenance } from "../../shared/vertical/type";
import { PROVENANCE_TOP } from "./layout";
import { ARCHIVE, RAW_TOTAL } from "./measurements";
import { Sheet } from "./Sheet";
import { Substitution } from "./Substitution";
import { ZipTarget } from "./ZipTarget";

const n = (v: number) => v.toLocaleString("en-US");

/**
 * The shot, which is two cycles on one object.
 *
 * A file is read, collapsed onto what the encoder kept, and drained into the
 * archive; then the next file comes up with nothing behind it. The playbook
 * warns that three shots sharing a layout never works, and allows a shared one
 * where the comparison is the point. Here the second pass is the comparison:
 * the whole claim of the cut is that a zip does this per file.
 *
 * Under the card are the folder and the archive, drawn to the same scale. That
 * is what makes this a folder being compressed on somebody's computer rather
 * than an algorithm being demonstrated, and it was missing from the first cut.
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
    <Substitution />
    <ZipTarget />

    <Provenance top={PROVENANCE_TOP}>
      zip -9 &middot; {n(RAW_TOTAL)} bytes in, {ARCHIVE} out
    </Provenance>
  </AbsoluteFill>
);
