import type { ReactNode } from "react";
import type { Caption } from "@remotion/captions";
import { Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Canvas } from "./Canvas";
import { Captions } from "./Captions";
import { Grade } from "./Grade";
import { MusicBed, type Hold } from "./MusicBed";
import { EASE_OUT } from "../video/motion";

type SceneShellProps = {
  children: ReactNode;
  captions: readonly Caption[];
  /** File name in public/narration, without the extension. */
  narration: string;
  /**
   * Frames to bring the scene up over. 0 cuts straight in.
   *
   * Only for scenes the previous one hands to on a full-frame card rather than
   * on a shared object. Where the seam is a match cut, fading is wrong: the
   * object is meant to stay put across the cut, and fading it up makes it blink.
   */
  fadeIn?: number;
  /**
   * Prediction holds and any other authored silence, so the bed stays down
   * where the scene deliberately stops talking.
   */
  holds?: readonly Hold[];
  /**
   * Canvas tone. Paper is the channel default. Problem Solving is evaluating
   * dark under section 14 of the production standard.
   */
  tone?: "paper" | "black";
};

/**
 * Everything every scene carries: its narration, the ducked bed, subtitles and
 * the grade.
 *
 * Keeping it in one place means a change to the mix or the grade lands on all
 * eight scenes at once, rather than being re-typed seven times and drifting.
 */
export const SceneShell: React.FC<SceneShellProps> = ({
  children,
  captions,
  narration,
  fadeIn = 0,
  holds = [],
  tone = "paper",
}) => {
  const frame = useCurrentFrame();
  const entry =
    fadeIn > 0 ? interpolate(frame, [0, fadeIn], [0, 1], EASE_OUT) : 1;

  return (
    <Canvas tone={tone} padding={0}>
      <Audio src={staticFile(`narration/${narration}.wav`)} />
      <MusicBed
        src="music/bed.mp3"
        captions={captions}
        gain={1}
        duck={0.4}
        holds={holds}
      />
      <div style={{ position: "absolute", inset: 0, opacity: entry }}>
        {children}
      </div>
      <Captions captions={captions} tone={tone} />
      <Grade tone={tone} />
    </Canvas>
  );
};
