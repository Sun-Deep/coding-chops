import { Composition, Folder, Still } from "remotion";
import { FPS } from "../shared/video/timing";
import { HEIGHT, WIDTH } from "../shared/vertical/geometry";
import { SafeArea } from "../shared/vertical/SafeArea";
import { DURATION } from "./01-database-index/beats";
import { DatabaseIndexCover } from "./01-database-index/Cover";
import { DatabaseIndexReel } from "./01-database-index/Reel";

/**
 * Vertical cuts.
 *
 * A format rather than a track, so it sits beside System Design and Problem
 * Solving instead of inside one. A reel can be an original like this one or a
 * cut out of an episode, and either way it obeys
 * `docs/vertical-format-standard.md` rather than the horizontal geometry.
 *
 * IDs are `VR<NN>`. They stay stable once a cut is published, the same rule the
 * episode compositions follow.
 */
export const VerticalCompositions: React.FC = () => (
  <>
    <Folder name="Reels">
      <Composition
        id="VR01-Database-Index"
        component={DatabaseIndexReel}
        durationInFrames={DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </Folder>

    <Folder name="Covers">
      <Still
        id="VR01-Cover"
        component={DatabaseIndexCover}
        width={WIDTH}
        height={HEIGHT}
      />
    </Folder>

    <Folder name="Review">
      <Still
        id="Vertical-Safe-Area"
        component={SafeArea}
        width={WIDTH}
        height={HEIGHT}
      />
    </Folder>
  </>
);
