import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { Sfx } from "../../shared/primitives/Sfx";
import { gainFor } from "./cues";
import type { Gait } from "./simulation";

/**
 * Every footfall in one street, as the render walked and ran it: written
 * by `scripts/blender/rain/street.py`, one entry each time a foot lands.
 * Running lands harder, and a little higher, on the wet pavement.
 */
type Step = [number, "walk" | "run"];

export const Footsteps: React.FC<{ gait: Gait }> = ({ gait }) => {
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [handle] = useState(() => delayRender(`steps ${gait}`));
  useEffect(() => {
    fetch(staticFile(`vr40/steps-${gait}.json`))
      .then((r) => r.json())
      .then((s: Step[]) => {
        setSteps(s);
        continueRender(handle);
      });
  }, [handle, gait]);
  if (!steps) return null;
  return (
    <>
      {steps.map(([f, g], k) => (
        <Sfx
          key={`${gait}-${f}`}
          name="wet-step"
          at={f}
          gain={gainFor("wet-step", g === "run" ? -10 : -14)}
          playbackRate={
            (g === "run" ? 1.08 : 0.94) * (0.94 + ((k * 37) % 13) / 100)
          }
        />
      ))}
    </>
  );
};
