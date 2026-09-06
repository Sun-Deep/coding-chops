import { Composition, Folder, Still } from "remotion";
import { FPS, seconds } from "../../shared/video/timing";
import { BuyAndSellScene01 } from "./01-best-time-to-buy-and-sell-stock/Scene01";
import { BuyAndSellScene02 } from "./01-best-time-to-buy-and-sell-stock/Scene02";
import { BuyAndSellScene03 } from "./01-best-time-to-buy-and-sell-stock/Scene03";
import { BuyAndSellScene04 } from "./01-best-time-to-buy-and-sell-stock/Scene04";
import { BuyAndSellScene05 } from "./01-best-time-to-buy-and-sell-stock/Scene05";
import { BuyAndSellScene06 } from "./01-best-time-to-buy-and-sell-stock/Scene06";
import { BuyAndSellScene07 } from "./01-best-time-to-buy-and-sell-stock/Scene07";
import { BuyAndSellScene08 } from "./01-best-time-to-buy-and-sell-stock/Scene08";
import {
  BuyAndSellScene09,
  SCENE_09_TAIL,
} from "./01-best-time-to-buy-and-sell-stock/Scene09";
import {
  BuyAndSellMaster,
  buyAndSellDuration,
} from "./01-best-time-to-buy-and-sell-stock/Master";
import { narration } from "./01-best-time-to-buy-and-sell-stock/narration";
import { CaptionSafeArea } from "./CaptionSafeArea";
import { InkSheet } from "./01-best-time-to-buy-and-sell-stock/InkSheet";
import { BuyAndSellThumbnail } from "./01-best-time-to-buy-and-sell-stock/Thumbnail";
import {
  BuyAndSellSocialCover,
  BuyAndSellSocialCoverPart01,
  BuyAndSellSocialCoverPart02,
  BuyAndSellSocialCoverPart03,
  BuyAndSellSocialCoverPart04,
} from "./01-best-time-to-buy-and-sell-stock/SocialCover";

/**
 * The Problem Solving track.
 *
 * Scenes arrive once narration is recorded, because scene duration comes from
 * the measured stems rather than from a number chosen here.
 */
export const ProblemSolvingCompositions: React.FC = () => {
  return (
    <>
      <Folder name="Scenes">
        <Composition
          id="PS01-Scene-01"
          component={BuyAndSellScene01}
          durationInFrames={seconds(
            narration.find((scene) => scene.id === "scene-01")!.seconds,
          )}
          fps={FPS}
          width={1920}
          height={1080}
        />
        <Composition
          id="PS01-Scene-02"
          component={BuyAndSellScene02}
          durationInFrames={seconds(
            narration.find((scene) => scene.id === "scene-02")!.seconds,
          )}
          fps={FPS}
          width={1920}
          height={1080}
        />
        <Composition
          id="PS01-Scene-03"
          component={BuyAndSellScene03}
          durationInFrames={seconds(
            narration.find((scene) => scene.id === "scene-03")!.seconds,
          )}
          fps={FPS}
          width={1920}
          height={1080}
        />
        <Composition
          id="PS01-Scene-04"
          component={BuyAndSellScene04}
          durationInFrames={seconds(
            narration.find((scene) => scene.id === "scene-04")!.seconds,
          )}
          fps={FPS}
          width={1920}
          height={1080}
        />
        <Composition
          id="PS01-Scene-05"
          component={BuyAndSellScene05}
          durationInFrames={seconds(
            narration.find((scene) => scene.id === "scene-05")!.seconds,
          )}
          fps={FPS}
          width={1920}
          height={1080}
        />
        <Composition
          id="PS01-Scene-06"
          component={BuyAndSellScene06}
          durationInFrames={seconds(
            narration.find((scene) => scene.id === "scene-06")!.seconds,
          )}
          fps={FPS}
          width={1920}
          height={1080}
        />
        <Composition
          id="PS01-Scene-07"
          component={BuyAndSellScene07}
          durationInFrames={seconds(
            narration.find((scene) => scene.id === "scene-07")!.seconds,
          )}
          fps={FPS}
          width={1920}
          height={1080}
        />
        <Composition
          id="PS01-Scene-08"
          component={BuyAndSellScene08}
          durationInFrames={seconds(
            narration.find((scene) => scene.id === "scene-08")!.seconds,
          )}
          fps={FPS}
          width={1920}
          height={1080}
        />
        <Composition
          id="PS01-Scene-09"
          component={BuyAndSellScene09}
          // The only scene longer than its stem. The end card is silent.
          durationInFrames={
            seconds(
              narration.find((scene) => scene.id === "scene-09")!.seconds,
            ) + SCENE_09_TAIL
          }
          fps={FPS}
          width={1920}
          height={1080}
        />
      </Folder>

      <Folder name="Episode">
        <Composition
          id="PS01-Master"
          component={BuyAndSellMaster}
          durationInFrames={buyAndSellDuration}
          fps={FPS}
          width={1920}
          height={1080}
        />
      </Folder>

      <Folder name="Packaging">
        <Still
          id="PS01-Thumbnail"
          component={BuyAndSellThumbnail}
          width={1280}
          height={720}
        />
        <Still
          id="PS01-Social-Cover"
          component={BuyAndSellSocialCover}
          width={1080}
          height={1920}
        />
        <Still
          id="PS01-Social-Cover-Part-01"
          component={BuyAndSellSocialCoverPart01}
          width={1080}
          height={1920}
        />
        <Still
          id="PS01-Social-Cover-Part-02"
          component={BuyAndSellSocialCoverPart02}
          width={1080}
          height={1920}
        />
        <Still
          id="PS01-Social-Cover-Part-03"
          component={BuyAndSellSocialCoverPart03}
          width={1080}
          height={1920}
        />
        <Still
          id="PS01-Social-Cover-Part-04"
          component={BuyAndSellSocialCoverPart04}
          width={1080}
          height={1920}
        />
      </Folder>

      <Folder name="Review">
        <Composition
          id="PS01-Ink-Sheet"
          component={InkSheet}
          durationInFrames={210}
          fps={FPS}
          width={1920}
          height={1080}
        />
        <Still
          id="PS01-Ink-Sheet-Still"
          component={InkSheet}
          defaultProps={{ still: true }}
          width={1920}
          height={1080}
        />
        <Still
          id="PS-Caption-Safe-Area"
          component={CaptionSafeArea}
          width={1920}
          height={1080}
        />
      </Folder>
    </>
  );
};
