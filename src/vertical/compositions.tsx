import { Composition, Folder, Still } from "remotion";
import { FPS } from "../shared/video/timing";
import { HEIGHT, WIDTH } from "../shared/vertical/geometry";
import { SafeArea } from "../shared/vertical/SafeArea";
import { DURATION as VR01 } from "./01-database-index/beats";
import { DatabaseIndexCover } from "./01-database-index/Cover";
import { DatabaseIndexReel } from "./01-database-index/Reel";
import { DURATION as HANOI_DURATION } from "./02-tower-of-hanoi/beats";
import { TowerOfHanoiCover } from "./02-tower-of-hanoi/Cover";
import { TowerOfHanoiReel } from "./02-tower-of-hanoi/Reel";
import { DURATION as VR03 } from "./03-rate-limiting/beats";
import { RateLimitingCover } from "./03-rate-limiting/Cover";
import { RateLimitingReel } from "./03-rate-limiting/Reel";
import { DURATION as VR04 } from "./04-quicksort/beats";
import { QuicksortCover } from "./04-quicksort/Cover";
import { QuicksortReel, QuicksortShotOne } from "./04-quicksort/Reel";
import { DURATION as VR05 } from "./05-index-only-scan/beats";
import { IndexOnlyScanCover } from "./05-index-only-scan/Cover";
import { IndexOnlyScanReel } from "./05-index-only-scan/Reel";
import { DURATION as VR06 } from "./06-one-token-at-a-time/beats";
import { OneTokenAtATimeCover } from "./06-one-token-at-a-time/Cover";
import { OneTokenAtATimeReel } from "./06-one-token-at-a-time/Reel";
import { DURATION as VR07 } from "./07-regex-backtracking/beats";
import { RegexBacktrackingCover } from "./07-regex-backtracking/Cover";
import { RegexBacktrackingReel } from "./07-regex-backtracking/Reel";
import { DURATION as VR08 } from "./08-big-o-cheat-sheet/beats";
import { BigOCheatSheetCover } from "./08-big-o-cheat-sheet/Cover";
import { BigOCheatSheetReel } from "./08-big-o-cheat-sheet/Reel";
import { DURATION as VR09 } from "./09-sorting-race/beats";
import { SortingRaceCover } from "./09-sorting-race/Cover";
import { SortingRaceReel } from "./09-sorting-race/Reel";
import { DURATION as VR10 } from "./10-search-race/beats";
import { SearchRaceCover } from "./10-search-race/Cover";
import { SearchRaceReel } from "./10-search-race/Reel";
import { DURATION as VR11 } from "./11-text-search/beats";
import { TextSearchCover } from "./11-text-search/Cover";
import { TextSearchReel } from "./11-text-search/Reel";
import { DURATION as VR12 } from "./12-file-modes/beats";
import { FileModesCover } from "./12-file-modes/Cover";
import { FileModesReel } from "./12-file-modes/Reel";
import { DURATION as VR13 } from "./13-zip/beats";
import { ZipCover } from "./13-zip/Cover";
import { ZipReel } from "./13-zip/Reel";
import { DURATION as VR14 } from "./14-qr/beats";
import { QrCover } from "./14-qr/Cover";
import { QrReel } from "./14-qr/Reel";
import { DURATION as VR15 } from "./15-cron/beats";
import { CronCover } from "./15-cron/Cover";
import { CronReel } from "./15-cron/Reel";
import { DURATION as VR16 } from "./16-password-hash/beats";
import { PasswordHashCover } from "./16-password-hash/Cover";
import { PasswordHashReel } from "./16-password-hash/Reel";
import { DURATION as VR17 } from "./17-maze-generators/beats";
import { MazeGeneratorsCover } from "./17-maze-generators/Cover";
import { MazeGeneratorsReel } from "./17-maze-generators/Reel";
import { DURATION as VR18 } from "./18-ls-long/beats";
import { LsLongCover } from "./18-ls-long/Cover";
import { LsLongReel } from "./18-ls-long/Reel";
import { DURATION as VR19 } from "./19-git-storage/beats";
import { GitStorageCover } from "./19-git-storage/Cover";
import { GitStorageReel } from "./19-git-storage/Reel";
import { DURATION as VR20 } from "./20-docker-layers/beats";
import { DockerLayersCover } from "./20-docker-layers/Cover";
import { DockerLayersReel } from "./20-docker-layers/Reel";
import { DURATION as VR21 } from "./21-elevator/beats";
import { ElevatorCover } from "./21-elevator/Cover";
import { ElevatorReel } from "./21-elevator/Reel";
import { DURATION as VR22 } from "./22-checkout/beats";
import { CheckoutCover } from "./22-checkout/Cover";
import { CheckoutReel } from "./22-checkout/Reel";
import { DURATION as VR23 } from "./23-phantom-jam/beats";
import { PhantomJamCover } from "./23-phantom-jam/Cover";
import { PhantomJamReel } from "./23-phantom-jam/Reel";
import { DURATION as VR24 } from "./24-plane-boarding/beats";
import { PlaneBoardingCover } from "./24-plane-boarding/Cover";
import { PlaneBoardingReel } from "./24-plane-boarding/Reel";
import { DURATION as VR25 } from "./25-parking/beats";
import { ParkingCover } from "./25-parking/Cover";
import { ParkingReel } from "./25-parking/Reel";
import { DURATION as VR26 } from "./26-escalator/beats";
import { EscalatorCover } from "./26-escalator/Cover";
import { EscalatorReel } from "./26-escalator/Reel";
import { DURATION as VR27 } from "./27-gridlock/beats";
import { GridlockCover } from "./27-gridlock/Cover";
import { GridlockReel } from "./27-gridlock/Reel";
import { DURATION as VR28 } from "./28-microwave/beats";
import { MicrowaveCover } from "./28-microwave/Cover";
import { MicrowaveReel } from "./28-microwave/Reel";
import { DURATION as VR29 } from "./29-lights/beats";
import { LightsCover } from "./29-lights/Cover";
import { LightsReel } from "./29-lights/Reel";
import { DURATION as VR30 } from "./30-hallway/beats";
import { HallwayCover } from "./30-hallway/Cover";
import { HallwayReel } from "./30-hallway/Reel";
import { DURATION as VR31 } from "./31-zipper/beats";
import { ZipperCover } from "./31-zipper/Cover";
import { ZipperReel } from "./31-zipper/Reel";
import { DURATION as VR32 } from "./32-kiosk/beats";
import { KioskCover } from "./32-kiosk/Cover";
import { KioskReel } from "./32-kiosk/Reel";
import { DURATION as VR33 } from "./33-cinema/beats";
import { CinemaCover } from "./33-cinema/Cover";
import { CinemaReel } from "./33-cinema/Reel";
import { DURATION as VR34 } from "./34-buffet/beats";
import { BuffetCover } from "./34-buffet/Cover";
import { BuffetReel } from "./34-buffet/Reel";
import { DURATION as VR35 } from "./35-gym/beats";
import { GymCover } from "./35-gym/Cover";
import { GymReel } from "./35-gym/Reel";
import { DURATION as VR36 } from "./36-deplane/beats";
import { DeplaneCover } from "./36-deplane/Cover";
import { DeplaneReel } from "./36-deplane/Reel";
import { DURATION as VR37 } from "./37-bus-bunching/beats";
import { BusBunchingCover } from "./37-bus-bunching/Cover";
import { BusBunchingReel } from "./37-bus-bunching/Reel";
import { DURATION as VR38 } from "./38-elevator-door/beats";
import { ElevatorDoorCover } from "./38-elevator-door/Cover";
import { ElevatorDoorReel } from "./38-elevator-door/Reel";
import { DURATION as VR39 } from "./39-roadster-roll/beats";
import { RoadsterRollCover } from "./39-roadster-roll/Cover";
import { RoadsterRollReel } from "./39-roadster-roll/Reel";
import { DURATION as VR40 } from "./40-rain-run/beats";
import { RainRunCover } from "./40-rain-run/Cover";
import { RainRunReel } from "./40-rain-run/Reel";
import { DURATION as VR42 } from "./42-roundabout/beats";
import { RoundaboutCover } from "./42-roundabout/Cover";
import { RoundaboutReel } from "./42-roundabout/Reel";
import { DURATION as VR43 } from "./43-git-bisect/beats";
import { GitBisectCover } from "./43-git-bisect/Cover";
import { GitBisectReel } from "./43-git-bisect/Reel";
import { DURATION as VR44 } from "./44-sql-order/beats";
import { SqlOrderCover } from "./44-sql-order/Cover";
import { SqlOrderReel } from "./44-sql-order/Reel";
import { DURATION as VR45 } from "./45-monty-hall/beats";
import { MontyHallCover } from "./45-monty-hall/Cover";
import { MontyHallReel } from "./45-monty-hall/Reel";
import { DURATION as VR46 } from "./46-php2shell/beats";
import { Php2ShellCover } from "./46-php2shell/Cover";
import { Php2ShellReel } from "./46-php2shell/Reel";
import { DURATION as VR47 } from "./47-last-ticket/beats";
import { LastTicketCover } from "./47-last-ticket/Cover";
import { LastTicketReel } from "./47-last-ticket/Reel";
import { DURATION as VR48 } from "./48-stock-lesson/clock";
import { StockLessonCover } from "./48-stock-lesson/Cover";
import { StockLessonReel } from "./48-stock-lesson/Reel";
import { CoinPuzzleLook, CoinPuzzlePreview } from "./41-coin-puzzle/Preview";
import { PREVIEW_DURATION as COIN_PREVIEW } from "./41-coin-puzzle/beats";
import { DURATION as VR41 } from "./41-coin-puzzle/beats";
import { CoinPuzzleReel } from "./41-coin-puzzle/Reel";
import { CoinPuzzleCover } from "./41-coin-puzzle/Cover";

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
        id="VR41-Coin-Puzzle"
        component={CoinPuzzleReel}
        durationInFrames={VR41}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR01-Database-Index"
        component={DatabaseIndexReel}
        durationInFrames={VR01}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR02-Tower-Of-Hanoi"
        component={TowerOfHanoiReel}
        durationInFrames={HANOI_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR03-Rate-Limiting"
        component={RateLimitingReel}
        durationInFrames={VR03}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR04-Quicksort"
        component={QuicksortReel}
        durationInFrames={VR04}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR05-Index-Only-Scan"
        component={IndexOnlyScanReel}
        durationInFrames={VR05}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR06-One-Token-At-A-Time"
        component={OneTokenAtATimeReel}
        durationInFrames={VR06}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR07-Regex-Backtracking"
        component={RegexBacktrackingReel}
        durationInFrames={VR07}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR08-Big-O-Cheat-Sheet"
        component={BigOCheatSheetReel}
        durationInFrames={VR08}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR09-Sorting-Race"
        component={SortingRaceReel}
        durationInFrames={VR09}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR10-Search-Race"
        component={SearchRaceReel}
        durationInFrames={VR10}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR11-Text-Search"
        component={TextSearchReel}
        durationInFrames={VR11}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR12-File-Modes"
        component={FileModesReel}
        durationInFrames={VR12}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR13-Zip"
        component={ZipReel}
        durationInFrames={VR13}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR14-QR"
        component={QrReel}
        durationInFrames={VR14}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR15-Cron"
        component={CronReel}
        durationInFrames={VR15}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR16-Password-Hash"
        component={PasswordHashReel}
        durationInFrames={VR16}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR17-Maze-Generators"
        component={MazeGeneratorsReel}
        durationInFrames={VR17}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR18-Ls-Long"
        component={LsLongReel}
        durationInFrames={VR18}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR19-Git-Storage"
        component={GitStorageReel}
        durationInFrames={VR19}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR20-Docker-Layers"
        component={DockerLayersReel}
        durationInFrames={VR20}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR21-Elevator"
        component={ElevatorReel}
        durationInFrames={VR21}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR22-Checkout"
        component={CheckoutReel}
        durationInFrames={VR22}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR23-Phantom-Jam"
        component={PhantomJamReel}
        durationInFrames={VR23}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR24-Plane-Boarding"
        component={PlaneBoardingReel}
        durationInFrames={VR24}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR25-Parking"
        component={ParkingReel}
        durationInFrames={VR25}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR26-Escalator"
        component={EscalatorReel}
        durationInFrames={VR26}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR27-Gridlock"
        component={GridlockReel}
        durationInFrames={VR27}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR28-Microwave"
        component={MicrowaveReel}
        durationInFrames={VR28}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR29-Lights"
        component={LightsReel}
        durationInFrames={VR29}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR30-Hallway"
        component={HallwayReel}
        durationInFrames={VR30}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR31-Zipper"
        component={ZipperReel}
        durationInFrames={VR31}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR32-Kiosk"
        component={KioskReel}
        durationInFrames={VR32}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR33-Cinema"
        component={CinemaReel}
        durationInFrames={VR33}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR34-Buffet"
        component={BuffetReel}
        durationInFrames={VR34}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR35-Gym"
        component={GymReel}
        durationInFrames={VR35}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR36-Deplane"
        component={DeplaneReel}
        durationInFrames={VR36}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR37-Bus-Bunching"
        component={BusBunchingReel}
        durationInFrames={VR37}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR38-Elevator-Door"
        component={ElevatorDoorReel}
        durationInFrames={VR38}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR39-Roadster-Roll"
        component={RoadsterRollReel}
        durationInFrames={VR39}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR40-Rain-Run"
        component={RainRunReel}
        durationInFrames={VR40}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR42-Roundabout"
        component={RoundaboutReel}
        durationInFrames={VR42}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR43-Git-Bisect"
        component={GitBisectReel}
        durationInFrames={VR43}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR44-SQL-Order"
        component={SqlOrderReel}
        durationInFrames={VR44}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR45-Monty-Hall"
        component={MontyHallReel}
        durationInFrames={VR45}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR46-PHP2Shell"
        component={Php2ShellReel}
        durationInFrames={VR46}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR47-Last-Ticket"
        component={LastTicketReel}
        durationInFrames={VR47}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR48-Stock-Lesson"
        component={StockLessonReel}
        durationInFrames={VR48}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </Folder>

    <Folder name="Covers">
      <Still
        id="VR41-Cover"
        component={CoinPuzzleCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR01-Cover"
        component={DatabaseIndexCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR02-Cover"
        component={TowerOfHanoiCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR03-Cover"
        component={RateLimitingCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR04-Cover"
        component={QuicksortCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR05-Cover"
        component={IndexOnlyScanCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR06-Cover"
        component={OneTokenAtATimeCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR07-Cover"
        component={RegexBacktrackingCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR08-Cover"
        component={BigOCheatSheetCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR09-Cover"
        component={SortingRaceCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR10-Cover"
        component={SearchRaceCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR11-Cover"
        component={TextSearchCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR12-Cover"
        component={FileModesCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR13-Cover"
        component={ZipCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR14-Cover"
        component={QrCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR15-Cover"
        component={CronCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR16-Cover"
        component={PasswordHashCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR17-Cover"
        component={MazeGeneratorsCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR18-Cover"
        component={LsLongCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR19-Cover"
        component={GitStorageCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR20-Cover"
        component={DockerLayersCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR21-Cover"
        component={ElevatorCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR22-Cover"
        component={CheckoutCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR23-Cover"
        component={PhantomJamCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR24-Cover"
        component={PlaneBoardingCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR25-Cover"
        component={ParkingCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR26-Cover"
        component={EscalatorCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR27-Cover"
        component={GridlockCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR28-Cover"
        component={MicrowaveCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR29-Cover"
        component={LightsCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR30-Cover"
        component={HallwayCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR31-Cover"
        component={ZipperCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR32-Cover"
        component={KioskCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR33-Cover"
        component={CinemaCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR34-Cover"
        component={BuffetCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR35-Cover"
        component={GymCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR36-Cover"
        component={DeplaneCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR37-Cover"
        component={BusBunchingCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR38-Cover"
        component={ElevatorDoorCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR39-Cover"
        component={RoadsterRollCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR40-Cover"
        component={RainRunCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR42-Cover"
        component={RoundaboutCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR43-Cover"
        component={GitBisectCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR44-Cover"
        component={SqlOrderCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR45-Cover"
        component={MontyHallCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR46-Cover"
        component={Php2ShellCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR47-Cover"
        component={LastTicketCover}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR48-Cover"
        component={StockLessonCover}
        width={WIDTH}
        height={HEIGHT}
      />
    </Folder>

    <Folder name="Review">
      <Composition
        id="VR41-Coin-Puzzle-Preview"
        component={CoinPuzzlePreview}
        durationInFrames={COIN_PREVIEW}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="VR41-Coin-Puzzle-Look"
        component={CoinPuzzleLook}
        width={WIDTH}
        height={HEIGHT}
      />
      <Still
        id="Vertical-Safe-Area"
        component={SafeArea}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="VR04-Shot-01"
        component={QuicksortShotOne}
        durationInFrames={90}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </Folder>
  </>
);
