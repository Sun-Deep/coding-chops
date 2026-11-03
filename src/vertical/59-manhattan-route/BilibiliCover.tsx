import { BilibiliCover } from "../../shared/vertical/BilibiliCover";
import { COVER_FRAME } from "./Cover";
import { RUN } from "./measurements";
import { Stage } from "./Stage";

const n = (x: number) => x.toLocaleString("en-US");

/** Bilibili's 16:9 card: the blue flood with the orange thread inside. */
export const ManhattanRouteBilibiliCover: React.FC = () => (
  <BilibiliCover
    frame={
      <Stage
        cover
        frame={COVER_FRAME}
        still={`vr59/city-${String(COVER_FRAME).padStart(4, "0")}.png`}
      />
    }
    crop={{ x: 0.06, y: 0.27, w: 0.88, h: 0.44 }}
    zh="哈莱姆到华尔街"
    big="1/20"
    zhSub="A* 只查了二十分之一"
    en={
      <>
        Intersections: A* {n(RUN.astar)}, Dijkstra {n(RUN.dijkstra)}
      </>
    }
  />
);
