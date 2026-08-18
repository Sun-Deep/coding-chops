import { Composition, Folder, Still } from "remotion";
import { FPS } from "../../shared/video/timing";
import { episode01 } from "./01-single-server/episode";
import { SingleServerMaster } from "./01-single-server/Master";
import {
  SingleServerHookShort,
  SingleServerIoShort,
  SingleServerMetricShort,
} from "./01-single-server/Shorts";
import { SingleServerThumbnail } from "./01-single-server/Thumbnail";

export const SystemDesignCompositions: React.FC = () => {
  return (
    <>
      <Folder name="Horizontal">
        <Composition
          id="SD01-Master"
          component={SingleServerMaster}
          durationInFrames={episode01.durations.master}
          fps={FPS}
          width={1920}
          height={1080}
        />
      </Folder>

      <Folder name="Shorts">
        <Composition
          id="SD01-Short-Hook"
          component={SingleServerHookShort}
          durationInFrames={episode01.durations.short}
          fps={FPS}
          width={1080}
          height={1920}
        />
        <Composition
          id="SD01-Short-Metric"
          component={SingleServerMetricShort}
          durationInFrames={episode01.durations.short}
          fps={FPS}
          width={1080}
          height={1920}
        />
        <Composition
          id="SD01-Short-IO"
          component={SingleServerIoShort}
          durationInFrames={episode01.durations.short}
          fps={FPS}
          width={1080}
          height={1920}
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
