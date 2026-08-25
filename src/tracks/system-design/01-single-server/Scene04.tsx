import { interpolate, useCurrentFrame } from "remotion";
import type { Caption } from "@remotion/captions";
import { SceneShell } from "../../../shared/primitives/SceneShell";
import { Sfx } from "../../../shared/primitives/Sfx";
import { clamp } from "../../../shared/video/timing";
import { wordFrame } from "../../../shared/video/captions";
import {
  EASE_IN_OUT,
  EASE_OUT,
  travel,
  crossFade,
} from "../../../shared/video/motion";
import {
  pointAt,
  Camera,
  LINE_Y,
  Label,
  PHONE_RIGHT,
  Packet,
  SERVER_LEFT,
  Phone,
  Wire,
  dof,
} from "../../../shared/scene/stage";
import { Callout } from "../../../shared/scene/callout";
import { Machine } from "../../../shared/scene/machine";

/** Objects live on the machine layer, so callouts project against its depth. */
const MACHINE_DEPTH = -70;
import { CostCard, Dots, Meter } from "../../../shared/scene/meters";
import captionData from "../../../../curriculum/system-design/01-single-server/audio/captions/scene-04.json";

const captions = captionData as Caption[];

/**
 * Every line of this narration names something specific, and every one of them
 * gets its own state change. A meter that fills once and then sits still for
 * ninety seconds while the narrator keeps talking is the scene doing nothing.
 */
const at = {
  tap: wordFrame(captions, "tap"),
  resource: wordFrame(captions, "resource"),
  check: wordFrame(captions, "check"),
  logic: wordFrame(captions, "logic"),
  build: wordFrame(captions, "build"),
  instructions: wordFrame(captions, "instructions"),
  ram: wordFrame(captions, "ram"),
  memory: wordFrame(captions, "memory"),
  active: wordFrame(captions, "active"),
  read: wordFrame(captions, "read"),
  write: wordFrame(captions, "write"),
  io: wordFrame(captions, "io"),
  keeping: wordFrame(captions, "keeping"),
  recently: wordFrame(captions, "recently"),
  limit: wordFrame(captions, "limit"),
  moved: wordFrame(captions, "moved"),
  network: wordFrame(captions, "network"),
  cost: wordFrame(captions, "cost"),
  captions: wordFrame(captions, "captions"),
  resizing: wordFrame(captions, "resizing"),
  query: wordFrame(captions, "query"),
  tenThousand: wordFrame(captions, "10000", 2),
  accounts: wordFrame(captions, "accounts"),
  hundred: wordFrame(captions, "hundred"),
  capacity: wordFrame(captions, "capacity", 2),
  arrive: wordFrame(captions, "arrive"),
  once: wordFrame(captions, "once"),
  require: wordFrame(captions, "require"),
  comes: wordFrame(captions, "comes"),
  wait: wordFrame(captions, "wait"),
};

/**
 * Matches the shared SERVER position exactly.
 *
 * At x 1360, y 430 the machine sat 40px left of where the wire ends and 130px
 * above it, so the connector ran inside the chassis and met it near the bottom
 * edge. Sharing the position puts the wire on the machine's left edge at its
 * vertical middle, which is also what keeps it continuous with scenes 01 and 03.
 */
const MACHINE = { x: 1400, y: 560, width: 452, height: 316 };
/**
 * The meter row sits in the band between the phone's foot and the caption
 * strip. The phone bottoms out at world y 847, so anything above roughly 870
 * runs under the device and anything below 900 runs into the subtitles.
 */
const METER_Y = 878;
const METERS = [
  { key: "cpu", label: "CPU", x: 250 },
  { key: "memory", label: "memory", x: 720 },
  { key: "storage", label: "storage I/O", x: 1190 },
  { key: "network", label: "network", x: 1660 },
] as const;

const QUESTIONS = [
  "How many arrive each second?",
  "How many run at once?",
  "How much work does each one require?",
  "How much data comes back?",
  "How long will the user wait?",
];

/**
 * Where this scene opens, and where scene 03 ends.
 *
 * Exported so the two are one number rather than two that drift. Scene 03
 * holds the phone and the machine to the last frame, and so does this one, so
 * the seam only works if both are framed identically across the cut.
 */
export const SCENE_04_OPENING = [960, 610, 0.98] as const;

export const SingleServerScene04: React.FC = () => {
  const frame = useCurrentFrame();

  // Three acts. Resources being spent, then three requests compared, then the
  // question the whole scene has been building toward.
  const actA = interpolate(
    frame,
    [at.cost - 40, at.cost + 10],
    [1, 0],
    EASE_IN_OUT,
  );
  const actB = crossFade(frame, [
    at.cost - 10,
    at.cost + 40,
    at.tenThousand - 40,
    at.tenThousand,
  ]);
  const actC = interpolate(
    frame,
    [at.tenThousand - 20, at.tenThousand + 30],
    [0, 1],
    EASE_IN_OUT,
  );

  /**
   * The framing follows what is actually on screen.
   *
   * The opening beat still has the phone, so it stays wide enough to hold both
   * or the device gets cropped in half at the edge. It only centres on the
   * machine once the phone has faded for the resource section, and widens again
   * when the request crosses back over the wire.
   */
  const camX = interpolate(
    frame,
    [0, at.resource, at.resource + 40, at.moved - 60, at.moved + 40, at.cost],
    [SCENE_04_OPENING[0], 960, MACHINE.x, MACHINE.x, 980, 960],
    EASE_IN_OUT,
  );
  const camY = interpolate(
    frame,
    [0, at.cost],
    [SCENE_04_OPENING[1], 620],
    EASE_IN_OUT,
  );
  const zoom = interpolate(
    frame,
    [0, at.moved, at.cost],
    [SCENE_04_OPENING[2], 0.92, 0.88],
    EASE_IN_OUT,
  );
  const cam = { x: camX, y: camY, zoom };
  const at2 = (world: { x: number; y: number }) =>
    pointAt(world, cam, MACHINE_DEPTH);
  const sheen = interpolate(frame, [0, at.cost], [0.25, 0.7], clamp);

  // The request goes in, and comes back out on the line about network capacity.
  const packetX =
    frame >= at.moved
      ? travel(
          frame,
          at.moved,
          at.moved + 70,
          MACHINE.x - MACHINE.width / 2 - 46,
          PHONE_RIGHT + 46,
        )
      : travel(
          frame,
          at.tap,
          at.tap + 80,
          PHONE_RIGHT + 46,
          MACHINE.x - MACHINE.width / 2 - 46,
        );

  // CPU climbs once per named step, so "check, run, build" is three moves.
  const cpu = interpolate(
    frame,
    [
      at.check,
      at.check + 26,
      at.logic,
      at.logic + 26,
      at.build,
      at.build + 26,
      at.instructions,
      at.instructions + 60,
      at.moved,
      at.moved + 50,
    ],
    [0, 0.16, 0.16, 0.34, 0.34, 0.5, 0.5, 0.62, 0.62, 0.42],
    clamp,
  );
  const memory = interpolate(
    frame,
    [
      at.ram,
      at.ram + 40,
      at.recently,
      at.recently + 50,
      at.limit,
      at.limit + 60,
    ],
    [0, 0.36, 0.36, 0.62, 0.62, 0.83],
    clamp,
  );
  // A cached read is a read that never reaches storage, so the bar holds still.
  const storage = interpolate(
    frame,
    [
      at.read,
      at.write,
      at.write + 40,
      at.io,
      at.io + 26,
      at.recently + 12,
      at.limit,
    ],
    [0, 0.18, 0.3, 0.3, 0.46, 0.46, 0.46],
    clamp,
  );
  const network = interpolate(
    frame,
    [at.moved, at.moved + 50],
    [0.06, 0.44],
    clamp,
  );

  const levels = { cpu, memory, storage, network };
  const reveal = interpolate(
    frame,
    [at.resource, at.resource + 40],
    [0, 1],
    EASE_OUT,
  );
  const activeMeter = (from: number, to: number) =>
    crossFade(frame, [from - 14, from + 10, to - 20, to]);
  const meterActive = {
    cpu: activeMeter(at.check, at.ram),
    memory: activeMeter(at.ram, at.read),
    storage: activeMeter(at.read, at.moved),
    network: activeMeter(at.moved, at.cost),
  };

  const cards: {
    title: string;
    cost: [number, number, number, number];
    mark: number;
  }[] = [
    {
      title: "ten photo captions",
      cost: [0.14, 0.12, 0.1, 0.12],
      mark: at.captions,
    },
    {
      title: "resizing a large photo",
      cost: [0.92, 0.6, 0.34, 0.4],
      mark: at.resizing,
    },
    {
      title: "a database query",
      cost: [0.16, 0.3, 0.88, 0.14],
      mark: at.query,
    },
  ];

  const panelWindow = (from: number, to: number) =>
    crossFade(frame, [from - 12, from, to - 24, to - 12]);
  const cpuPanel = panelWindow(at.check, at.ram);
  const memoryPanel = panelWindow(at.ram, at.read);
  const storagePanel = panelWindow(at.read, at.keeping);
  const cachePanel = panelWindow(at.keeping, at.network);
  const networkPanel = panelWindow(at.network, at.cost);
  const resourceFocus = interpolate(
    frame,
    [at.resource - 10, at.resource + 24],
    [0, 1],
    clamp,
  );
  const phoneReturn = networkPanel * 0.75;
  const phoneOpacity = Math.max(1 - resourceFocus, phoneReturn);

  return (
    <SceneShell captions={captions} narration="scene-04">
      <div style={{ opacity: actA }}>
        <Camera x={cam.x} y={cam.y} zoom={cam.zoom}>
          <Wire opacity={phoneOpacity} defocus={dof(-34, -70)} />
          <Machine
            x={MACHINE.x}
            y={MACHINE.y}
            width={MACHINE.width}
            height={MACHINE.height}
            opacity={1}
            frame={frame}
            light={sheen}
            defocus={dof(-70, -70)}
            process={{ lit: 0.3 + cpu * 0.7, alive: 1, fill: 1 }}
            database={{
              lit: 0.3 + storage * 0.7,
              alive: 1,
              fill: 0.4 + memory * 0.6,
            }}
          />
          <Phone
            loaded={1}
            opacity={phoneOpacity}
            frame={frame}
            defocus={dof(0, -70)}
            light={sheen}
          />
          <Packet
            x={packetX}
            y={LINE_Y}
            scale={0.8}
            opacity={interpolate(
              frame,
              [
                at.tap - 20,
                at.tap,
                at.resource - 8,
                at.resource + 16,
                at.moved,
                at.moved + 70,
                at.moved + 90,
              ],
              [0, 1, 1, 0, 1, 1, 0],
              clamp,
            )}
            kind={frame >= at.moved ? "response" : "request"}
            defocus={dof(26, -70)}
          />
        </Camera>

        {METERS.map((meter) => (
          <Meter
            key={meter.key}
            label={meter.label}
            x={meter.x}
            y={METER_Y}
            width={300}
            level={levels[meter.key]}
            active={meterActive[meter.key]}
            reveal={reveal}
            limit={
              meter.key === "memory"
                ? interpolate(
                    frame,
                    [at.limit, at.limit + 30],
                    [0, 0.92],
                    clamp,
                  )
                : 0
            }
          />
        ))}
      </div>

      {/* Inside the act, so the callouts leave with the stage they belong
          to. Outside it they stayed fully opaque while everything they
          pointed at faded away. */}
      <div style={{ opacity: actA }}>
        {/* The meters, the code panel and the packet already show what each
            resource is doing. These name the part being spent, nothing more.
            A headline restating the sentence the narrator is speaking is
            duplication, not visualisation. */}
        <Callout
          target={at2({ x: MACHINE.x - 76, y: MACHINE.y - MACHINE.height / 2 })}
          label={{ x: 700, y: 150 }}
          progress={cpuPanel}
          size={40}
          bow={-1}
        >
          CPU time
        </Callout>
        <Callout
          target={at2({ x: MACHINE.x, y: MACHINE.y - MACHINE.height / 2 })}
          label={{ x: 780, y: 150 }}
          progress={memoryPanel}
          size={40}
          bow={-1}
        >
          working data in RAM
        </Callout>
        <Callout
          target={at2({
            x: MACHINE.x + 128,
            y: MACHINE.y - MACHINE.height / 2,
          })}
          label={{ x: 1520, y: 150 }}
          progress={storagePanel}
          size={40}
        >
          storage I/O
        </Callout>
        {/*
          Screen coordinates, because the meters sit outside the camera.

          With the machine centred it occupies roughly x 758 to 1162 and y 350 to
          631, so this label clears it to the left and below rather than landing
          on its bottom edge.
        */}
        <Callout
          target={{ x: 780, y: 880 }}
          label={{ x: 400, y: 706 }}
          progress={cachePanel}
          size={38}
          accent
        >
          served from RAM
        </Callout>
        {/*
          World coordinates, not screen.

          The camera widens during this beat, so a fixed screen target stays put
          while the objects slide out from under it: the arrow ran through the
          machine at the start of the move and pointed at empty paper by the end.
          Aimed at the middle of the wire, it tracks whatever the camera does.
        */}
        <Callout
          target={at2({ x: (PHONE_RIGHT + SERVER_LEFT) / 2, y: LINE_Y })}
          label={{ x: 960, y: 150 }}
          progress={networkPanel}
          size={40}
          accent
        >
          network capacity
        </Callout>
      </div>

      <div style={{ opacity: actB }}>
        {cards.map((card, i) => (
          <CostCard
            key={card.title}
            title={card.title}
            x={400 + i * 560}
            y={392}
            cost={card.cost}
            reveal={interpolate(
              frame,
              [card.mark - 30, card.mark + 20],
              [0, 1],
              EASE_OUT,
            )}
            highlight={interpolate(
              frame,
              [
                card.mark - 10,
                card.mark + 16,
                (cards[i + 1]?.mark ?? at.tenThousand) - 20,
                cards[i + 1]?.mark ?? at.tenThousand,
              ],
              [0, 1, 1, 0.25],
              clamp,
            )}
          />
        ))}
      </div>

      <div style={{ opacity: actC }}>
        <Label
          x={960}
          y={120}
          size={48}
          opacity={crossFade(frame, [
            at.tenThousand,
            at.tenThousand + 26,
            at.hundred - 20,
            at.hundred,
          ])}
        >
          10,000 accounts
        </Label>
        <div
          style={{
            opacity: crossFade(frame, [
              at.accounts - 20,
              at.accounts + 30,
              at.hundred - 30,
              at.hundred,
            ]),
          }}
        >
          <Dots
            x={960}
            y={352}
            columns={40}
            rows={12}
            activeFraction={interpolate(
              frame,
              [at.accounts, at.accounts + 50],
              [0.5, 0.04],
              clamp,
            )}
            reveal={1}
            size={12}
          />
          <Label x={960} y={706} size={34} opacity={1}>
            few are active
          </Label>
        </div>
        <div
          style={{
            opacity: crossFade(frame, [
              at.hundred - 10,
              at.hundred + 30,
              at.capacity - 10,
              at.capacity + 20,
            ]),
          }}
        >
          <Dots
            x={960}
            y={356}
            columns={20}
            rows={5}
            activeFraction={1}
            reveal={1}
            size={26}
          />
          {/* Same position, size and weight as the 10,000 label it replaces.
              The two are a before and after of one comparison, so styling them
              differently made them read as unrelated statements. */}
          <Label x={960} y={120} size={48} opacity={1}>
            100 accounts
          </Label>
        </div>
        <Label
          x={960}
          y={interpolate(
            frame,
            [at.capacity, at.capacity + 30],
            [264, 214],
            EASE_OUT,
          )}
          size={52}
          accent
          opacity={interpolate(
            frame,
            [at.capacity, at.capacity + 26],
            [0, 1],
            EASE_OUT,
          )}
        >
          capacity depends on the requests
        </Label>
        {QUESTIONS.map((question, i) => {
          const mark = [at.arrive, at.once, at.require, at.comes, at.wait][i];
          return (
            <Label
              key={question}
              x={960}
              y={368 + i * 92}
              size={38}
              opacity={interpolate(
                frame,
                [mark - 14, mark + 16],
                [0, 1],
                EASE_OUT,
              )}
              weight={600}
            >
              {question}
            </Label>
          );
        })}
      </div>

      <Sfx name="send" at={at.tap} gain={0.6} />
      <Sfx name="process" at={at.check} gain={0.6} />
      <Sfx name="process" at={at.logic} gain={0.6} />
      <Sfx name="process" at={at.build} gain={0.6} />
      <Sfx name="tick" at={at.ram} gain={0.5} />
      <Sfx name="tick" at={at.write} gain={0.5} />
      <Sfx name="tick" at={at.limit} gain={0.6} />
      <Sfx name="return" at={at.moved} gain={0.7} />
      <Sfx name="name" at={at.cost} gain={0.6} />
      {cards.map((card) => (
        <Sfx key={card.title} name="tick" at={card.mark} gain={0.5} />
      ))}
      <Sfx name="appear" at={at.tenThousand} gain={0.5} />
      <Sfx name="name" at={at.capacity} gain={0.6} />
      {[at.arrive, at.once, at.require, at.comes, at.wait].map((mark) => (
        <Sfx key={mark} name="fill" at={mark} gain={0.8} />
      ))}
    </SceneShell>
  );
};
