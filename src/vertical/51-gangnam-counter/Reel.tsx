import { interpolate, useCurrentFrame } from "remotion";
import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline, Provenance } from "../../shared/vertical/type";
import { clamp } from "../../shared/video/timing";
import * as B from "./beats";
import { Bits } from "./Bits";
import { Code } from "./Code";
import { CUES } from "./cues";
import { RUN } from "./measurements";
import { narration } from "./narration";
import { Page } from "./Page";
import "./runs";

export const HEADLINE_TOP = 232;
const PROVENANCE_TOP = 1302;

const Body: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Page frame={frame} />
      <Bits frame={frame} />
      <Code frame={frame} />
      <Provenance
        top={PROVENANCE_TOP}
        opacity={interpolate(
          frame,
          [B.RACE_TO - 4, B.RACE_TO + 4],
          [0, 1],
          clamp,
        )}
      >
        {RUN.java} · YouTube&apos;s post, Dec 2014 · 6 billion: 17 Jul 2026
      </Provenance>
    </>
  );
};

/** Every cue and its level are in `cues.ts`. */
export const GangnamCounterReel: React.FC = () => (
  <VerticalShell>
    <Body />
    <Headline top={HEADLINE_TOP}>
      Gangnam Style vs
      <br />a 32-bit counter.
    </Headline>
    <Narration lines={narration} />
    {CUES.map((cue) => (
      <Sfx
        key={cue.id}
        name={cue.name}
        at={cue.frame}
        gain={cue.gain}
        playbackRate={cue.rate}
      />
    ))}
  </VerticalShell>
);
