import { Composition, Folder, Still } from "remotion";
import { FPS, seconds } from "../../shared/video/timing";
import { SingleServerMaster } from "./01-single-server/Master";
import { narration } from "./01-single-server/narration";
import { SingleServerScene01 } from "./01-single-server/Scene01";
import { SingleServerScene02 } from "./01-single-server/Scene02";
import { SingleServerScene03 } from "./01-single-server/Scene03";
import { SingleServerScene04 } from "./01-single-server/Scene04";
import { SingleServerScene05 } from "./01-single-server/Scene05";
import { SingleServerScene05b } from "./01-single-server/Scene05b";
import { SingleServerScene06 } from "./01-single-server/Scene06";
import { SingleServerScene07 } from "./01-single-server/Scene07";
import { SingleServerThumbnail } from "./01-single-server/Thumbnail";

const masterDuration = narration.reduce(
  (total, scene) => total + seconds(scene.seconds),
  0,
);

export const SystemDesignCompositions: React.FC = () => {
  return (
    <>
      <Folder name="Scenes">
        <Composition
          id="SD01-Scene-01"
          component={SingleServerScene01}
          durationInFrames={seconds(
            narration.find((scene) => scene.id === "scene-01")!.seconds,
          )}
          fps={FPS}
          width={1920}
          height={1080}
        />
        <Composition
          id="SD01-Scene-02"
          component={SingleServerScene02}
          durationInFrames={seconds(
            narration.find((scene) => scene.id === "scene-02")!.seconds,
          )}
          fps={FPS}
          width={1920}
          height={1080}
        />
        <Composition
          id="SD01-Scene-03"
          component={SingleServerScene03}
          durationInFrames={seconds(
            narration.find((scene) => scene.id === "scene-03")!.seconds,
          )}
          fps={FPS}
          width={1920}
          height={1080}
        />
        <Composition
          id="SD01-Scene-04"
          component={SingleServerScene04}
          durationInFrames={seconds(
            narration.find((scene) => scene.id === "scene-04")!.seconds,
          )}
          fps={FPS}
          width={1920}
          height={1080}
        />
        <Composition
          id="SD01-Scene-05"
          component={SingleServerScene05}
          durationInFrames={seconds(
            narration.find((scene) => scene.id === "scene-05")!.seconds,
          )}
          fps={FPS}
          width={1920}
          height={1080}
        />
        <Composition
          id="SD01-Scene-05b"
          component={SingleServerScene05b}
          durationInFrames={seconds(
            narration.find((scene) => scene.id === "scene-05b")!.seconds,
          )}
          fps={FPS}
          width={1920}
          height={1080}
        />
        <Composition
          id="SD01-Scene-06"
          component={SingleServerScene06}
          durationInFrames={seconds(
            narration.find((scene) => scene.id === "scene-06")!.seconds,
          )}
          fps={FPS}
          width={1920}
          height={1080}
        />
        <Composition
          id="SD01-Scene-07"
          component={SingleServerScene07}
          durationInFrames={seconds(
            narration.find((scene) => scene.id === "scene-07")!.seconds,
          )}
          fps={FPS}
          width={1920}
          height={1080}
        />
      </Folder>

      <Folder name="Horizontal">
        <Composition
          id="SD01-Master"
          component={SingleServerMaster}
          durationInFrames={masterDuration}
          fps={FPS}
          width={1920}
          height={1080}
        />
      </Folder>

      <Folder name="Thumbnails">
        <Still
          id="SD01-Thumbnail"
          component={SingleServerThumbnail}
          width={1280}
          height={720}
        />
      </Folder>
    </>
  );
};
