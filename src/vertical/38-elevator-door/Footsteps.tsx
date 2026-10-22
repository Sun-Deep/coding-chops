import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { Sfx } from "../../shared/primitives/Sfx";
import { gainFor } from "./cues";
import type { Rule } from "./simulation";

/**
 * Every footfall in one lobby, as the render walked and ran it: written by
 * `scripts/blender/elevator/animate.py` beside your track, one entry each
 * time a foot lands. Runners land harder. At most one step every third
 * frame per lobby, each a little different in pitch.
 */
type Step = [number, "walk" | "run", number];

const RATE: Record<Rule, number> = { hold: 1.02, close: 0.97 };

export const Footsteps: React.FC<{ rule: Rule }> = ({ rule }) => {
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [handle] = useState(() => delayRender(`steps ${rule}`));
  useEffect(() => {
    fetch(staticFile(`vr38/steps-${rule}.json`))
      .then((r) => r.json())
      .then((s: Step[]) => {
        setSteps(s);
        continueRender(handle);
      });
  }, [handle, rule]);
  if (!steps) return null;
  let last = -Infinity;
  const kept = steps.filter(([f]) => {
    if (f - last < 3) return false;
    last = f;
    return true;
  });
  return (
    <>
      {kept.map(([f, gait, pid]) => (
        <Sfx
          key={`${rule}-${f}-${pid}`}
          name="lobby-step"
          at={f}
          gain={gainFor("lobby-step", gait === "run" ? -22 : -27)}
          playbackRate={RATE[rule] * (0.9 + ((pid * 37) % 23) / 100)}
        />
      ))}
    </>
  );
};
