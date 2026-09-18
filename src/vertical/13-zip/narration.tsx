import type { NarrationLine } from "../../shared/vertical/Narration";
import { BYTES, DEFLATE, PARSE } from "./measurements";

const n = (v: number) => v.toLocaleString("en-US");

/**
 * Twenty-five words, cut to the sweep.
 *
 * One unit the whole way down. Line one sets the file in bytes, line four
 * counts copies in bytes, line five reports the output in bytes, so nothing on
 * screen asks the viewer to convert between two things. That is the mistake
 * VR10 shipped with steps against cost and VR11 nearly shipped with reads
 * against distinct positions, and it is the easiest one to make.
 */
export const narration: readonly NarrationLine[] = [
  { from: 6, to: 70, text: `A log file. ${n(BYTES)} bytes.` },
  { from: 82, to: 150, text: "Zip reads it once." },
  { from: 162, to: 240, text: "Every repeat becomes a pointer back." },
  { from: 252, to: 322, text: `${n(PARSE.covered)} of them are copies.` },
  {
    from: 334,
    to: 412,
    emphasis: true,
    text: `${n(BYTES)} bytes out as ${DEFLATE.out}.`,
  },
];
