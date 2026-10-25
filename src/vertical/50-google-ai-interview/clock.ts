import type { Caption } from "@remotion/captions";
import take from "../../../curriculum/vertical/50-google-ai-interview/audio/captions/stem-01.json";
import stems from "../../../curriculum/vertical/50-google-ai-interview/audio/stems.json";
import { buildTimeline } from "./timeline";

/** The reel's timeline, from the creator's recorded take. */
export const T = buildTimeline(take as Caption[], stems["stem-01"]);
export const B = T.beats;
export const DURATION = T.duration;
