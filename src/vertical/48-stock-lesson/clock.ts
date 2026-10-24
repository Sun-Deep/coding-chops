import type { Caption } from "@remotion/captions";
import s1 from "../../../curriculum/vertical/48-stock-lesson/audio/captions/stem-01-enhanced-v2.json";
import s2 from "../../../curriculum/vertical/48-stock-lesson/audio/captions/stem-02-enhanced-v2.json";
import s3 from "../../../curriculum/vertical/48-stock-lesson/audio/captions/stem-03-enhanced-v2.json";
import s4 from "../../../curriculum/vertical/48-stock-lesson/audio/captions/stem-04-enhanced-v2.json";
import s5 from "../../../curriculum/vertical/48-stock-lesson/audio/captions/stem-05-enhanced-v2.json";
import s6 from "../../../curriculum/vertical/48-stock-lesson/audio/captions/stem-06-enhanced-v2.json";
import bounds from "../../../curriculum/vertical/48-stock-lesson/audio/stems.json";
import { buildTimeline } from "./timeline";

/** The reel's timeline, from the creator's recorded stems. */
export const T = buildTimeline([s1, s2, s3, s4, s5, s6] as Caption[][], bounds);
export const B = T.beats;
export const DURATION = T.duration;
