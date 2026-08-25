import { Sequence } from "remotion";
import { seconds } from "../../../shared/video/timing";
import { narration } from "./narration";
import { SingleServerScene01 } from "./Scene01";
import { SingleServerScene02 } from "./Scene02";
import { SingleServerScene03 } from "./Scene03";
import { SingleServerScene04 } from "./Scene04";
import { SingleServerScene05 } from "./Scene05";
import { SingleServerScene05b } from "./Scene05b";
import { SingleServerScene06 } from "./Scene06";
import { SingleServerScene07 } from "./Scene07";

const duration = (id: (typeof narration)[number]["id"]) =>
  seconds(narration.find((scene) => scene.id === id)!.seconds);

const starts = {
  scene01: 0,
  scene02: duration("scene-01"),
  scene03: duration("scene-01") + duration("scene-02"),
  scene04: duration("scene-01") + duration("scene-02") + duration("scene-03"),
  scene05:
    duration("scene-01") +
    duration("scene-02") +
    duration("scene-03") +
    duration("scene-04"),
  scene05b:
    duration("scene-01") +
    duration("scene-02") +
    duration("scene-03") +
    duration("scene-04") +
    duration("scene-05"),
  scene06:
    duration("scene-01") +
    duration("scene-02") +
    duration("scene-03") +
    duration("scene-04") +
    duration("scene-05") +
    duration("scene-05b"),
  scene07:
    duration("scene-01") +
    duration("scene-02") +
    duration("scene-03") +
    duration("scene-04") +
    duration("scene-05") +
    duration("scene-05b") +
    duration("scene-06"),
} as const;

export const SingleServerMaster: React.FC = () => (
  <>
    <Sequence from={starts.scene01} durationInFrames={duration("scene-01")}>
      <SingleServerScene01 />
    </Sequence>
    <Sequence from={starts.scene02} durationInFrames={duration("scene-02")}>
      <SingleServerScene02 />
    </Sequence>
    <Sequence from={starts.scene03} durationInFrames={duration("scene-03")}>
      <SingleServerScene03 />
    </Sequence>
    <Sequence from={starts.scene04} durationInFrames={duration("scene-04")}>
      <SingleServerScene04 />
    </Sequence>
    <Sequence from={starts.scene05} durationInFrames={duration("scene-05")}>
      <SingleServerScene05 />
    </Sequence>
    <Sequence from={starts.scene05b} durationInFrames={duration("scene-05b")}>
      <SingleServerScene05b />
    </Sequence>
    <Sequence from={starts.scene06} durationInFrames={duration("scene-06")}>
      <SingleServerScene06 />
    </Sequence>
    <Sequence from={starts.scene07} durationInFrames={duration("scene-07")}>
      <SingleServerScene07 />
    </Sequence>
  </>
);
