import { BilibiliCover } from "../../shared/vertical/BilibiliCover";
import { COVER_FRAME } from "./Cover";
import { PERCENT, RUN } from "./measurements";
import { Stage } from "./Stage";

/** Bilibili's 16:9 card: the ring and both NOV 12 tags on the right. */
export const BirthdaysBilibiliCover: React.FC = () => (
  <BilibiliCover
    frame={
      <Stage
        cover
        frame={COVER_FRAME}
        still={`vr60/classes-${String(COVER_FRAME).padStart(4, "0")}.png`}
      />
    }
    crop={{ x: 0.02, y: 0.29, w: 0.96, h: 0.44 }}
    zh={<>{RUN.classSize}个人里</>}
    big={<>{PERCENT}%</>}
    zhSub="有两人同一天生日"
    en={
      <>
        {RUN.classSize} people make {RUN.pairs} pairs.
      </>
    }
  />
);
