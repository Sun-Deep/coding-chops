import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import {
  Eyebrow,
  Headline,
  Provenance,
  Readout,
} from "../../shared/vertical/type";
import { READOUT_TOP } from "./layout";
import { BYTES, DEFLATE, RATIO } from "./measurements";
import { RATIO_FROM, TALLY_FROM, coveredBy, headAt } from "./beats";
import { Sheet } from "./Sheet";

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const n = (v: number) => v.toLocaleString("en-US");

/**
 * The shot, which is one shot.
 *
 * Three beats on one object rather than three layouts: the head reading, the
 * repeats firing back, and the file collapsing onto its own size. The playbook
 * asks for three shots and warns that three sharing a layout never works, and
 * the exception it allows is exactly this -- the comparison is between the file
 * before and the file after, so cutting away from it would throw away the only
 * thing being compared.
 *
 * The headline is up from frame zero and stays. At feed size it is the only
 * thing read before the decision to keep watching is made, and the sheet under
 * it is too fine to carry that on its own.
 */
export const Zip: React.FC = () => {
  const frame = useCurrentFrame();
  const covered = Math.round(coveredBy(headAt(frame)));

  const tally =
    clamp((frame - TALLY_FROM) / 12) * (1 - clamp((frame - RATIO_FROM) / 10));
  const ratio = clamp((frame - RATIO_FROM - 6) / 12);

  return (
    <AbsoluteFill style={{ fontFamily: theme.fontFamily }}>
      <Eyebrow top={242}>File compression</Eyebrow>
      <Headline top={276} size={62}>
        Zip finds what you
      </Headline>
      <Headline top={340} size={62} color={ACCENT}>
        already said.
      </Headline>

      <Sheet />

      <Readout top={READOUT_TOP} size={34} opacity={tally}>
        {n(covered)} of {n(BYTES)} bytes already said
      </Readout>
      <Readout
        top={READOUT_TOP}
        size={44}
        opacity={ratio}
        color={ACCENT}
        weight={600}
      >
        {RATIO}x smaller
      </Readout>

      <Provenance top={READOUT_TOP + 62}>
        zlib deflate, level 9 &middot; {n(BYTES)} bytes in, {DEFLATE.out} out
      </Provenance>
    </AbsoluteFill>
  );
};
