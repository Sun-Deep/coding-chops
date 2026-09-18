import type { NarrationLine } from "../../shared/vertical/Narration";
import { ARCHIVE, COVERED_TOTAL, RAW_TOTAL } from "./measurements";

const n = (v: number) => v.toLocaleString("en-US");

/**
 * Twenty-six words, cut to the two cycles.
 *
 * One unit the whole way down. Line one sets the folder in bytes, line four
 * counts copies in bytes, line five reports the archive in bytes, so nothing on
 * screen asks the viewer to convert between two things. That is the mistake
 * VR10 shipped with steps against cost, and the one VR11 nearly shipped with
 * reads against distinct positions.
 *
 * Line two carries the whole reason there are two cycles. "Each file" is doing
 * real work: it is why the second sheet starts from nothing, and it is the one
 * thing about zip most people have never been told.
 */
export const narration: readonly NarrationLine[] = [
  { from: 6, to: 74, text: `A folder of logs. ${n(RAW_TOTAL)} bytes.` },
  { from: 86, to: 154, text: "Zip reads each file on its own." },
  { from: 168, to: 250, text: "Every repeat becomes a pointer back." },
  { from: 262, to: 330, text: `${n(COVERED_TOTAL)} of them are copies.` },
  {
    from: 342,
    to: 412,
    emphasis: true,
    text: `${n(RAW_TOTAL)} bytes out as ${ARCHIVE}.`,
  },
];
