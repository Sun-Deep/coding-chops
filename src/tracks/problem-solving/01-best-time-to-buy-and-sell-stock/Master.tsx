import { Sequence } from "remotion";
import { seconds } from "../../../shared/video/timing";
import { narration } from "./narration";
import { BuyAndSellScene01 } from "./Scene01";
import { BuyAndSellScene02 } from "./Scene02";
import { BuyAndSellScene03 } from "./Scene03";
import { BuyAndSellScene04 } from "./Scene04";
import { BuyAndSellScene05 } from "./Scene05";
import { BuyAndSellScene06 } from "./Scene06";
import { BuyAndSellScene07 } from "./Scene07";
import { BuyAndSellScene08 } from "./Scene08";
import { BuyAndSellScene09, SCENE_09_TAIL } from "./Scene09";

/**
 * The episode, end to end.
 *
 * Every scene is exactly as long as its narration stem, and they butt straight
 * up against each other with no gaps and no transitions. Each act was built to
 * open on the previous one's last frame, so a dissolve between them would be a
 * dissolve between two identical pictures.
 *
 * Scene 9 is the exception, because its end card is silent. Its extra frames
 * come from the scene rather than from a padded stem, so `narration.ts` stays a
 * measurement of what was recorded.
 */
const SCENES = [
  { id: "scene-01", component: BuyAndSellScene01, tail: 0 },
  { id: "scene-02", component: BuyAndSellScene02, tail: 0 },
  { id: "scene-03", component: BuyAndSellScene03, tail: 0 },
  { id: "scene-04", component: BuyAndSellScene04, tail: 0 },
  { id: "scene-05", component: BuyAndSellScene05, tail: 0 },
  { id: "scene-06", component: BuyAndSellScene06, tail: 0 },
  { id: "scene-07", component: BuyAndSellScene07, tail: 0 },
  { id: "scene-08", component: BuyAndSellScene08, tail: 0 },
  { id: "scene-09", component: BuyAndSellScene09, tail: SCENE_09_TAIL },
] as const;

const lengthOf = (scene: (typeof SCENES)[number]) =>
  seconds(narration.find((n) => n.id === scene.id)!.seconds) + scene.tail;

/**
 * Where each scene starts, accumulated once.
 *
 * SD01 spells every start out as its own sum of the scenes before it, which is
 * eight nested additions by the last one and a place for a scene to go missing
 * from exactly one of them.
 */
export const cuts = SCENES.reduce<{ from: number; length: number }[]>(
  (acc, scene) => {
    const previous = acc[acc.length - 1];
    const from = previous ? previous.from + previous.length : 0;
    return [...acc, { from, length: lengthOf(scene) }];
  },
  [],
);

export const buyAndSellDuration =
  cuts[cuts.length - 1].from + cuts[cuts.length - 1].length;

export const BuyAndSellMaster: React.FC = () => (
  <>
    {SCENES.map((scene, i) => {
      const Scene = scene.component;
      return (
        <Sequence
          key={scene.id}
          from={cuts[i].from}
          durationInFrames={cuts[i].length}
        >
          <Scene />
        </Sequence>
      );
    })}
  </>
);
