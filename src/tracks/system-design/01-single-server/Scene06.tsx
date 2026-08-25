import { interpolate, useCurrentFrame } from "remotion";
import type { Caption } from "@remotion/captions";
import { SceneShell } from "../../../shared/primitives/SceneShell";
import {
  EditorialCopy,
  EditorialShot,
} from "../../../shared/primitives/EditorialShot";
import { Sfx } from "../../../shared/primitives/Sfx";
import { theme } from "../../../shared/brand/theme";
import { clamp } from "../../../shared/video/timing";
import { wordFrame } from "../../../shared/video/captions";
import {
  stageBehind,
  EASE_IN_OUT,
  arrive,
  crossFade,
  deck,
  settle,
  window as beat,
} from "../../../shared/video/motion";
import {
  Camera,
  Label,
  Packet,
  dof,
  pointAt,
} from "../../../shared/scene/stage";

/** Objects live on the machine layer, so callouts project against its depth. */
import { MACHINE_EDGE, Machine } from "../../../shared/scene/machine";

const MACHINE_DEPTH = -70;
import { Meter } from "../../../shared/scene/meters";
import captionData from "../../../../curriculum/system-design/01-single-server/audio/captions/scene-06.json";

const captions = captionData as Caption[];

const at = {
  monitoring: wordFrame(captions, "monitoring"),
  monitoringAgain: wordFrame(captions, "monitoring", 2),
  resources: wordFrame(captions, "resources"),
  larger: wordFrame(captions, "larger"),
  cpu: wordFrame(captions, "cpu"),
  memory: wordFrame(captions, "memory"),
  storage: wordFrame(captions, "storage"),
  network: wordFrame(captions, "network"),
  vertical: wordFrame(captions, "vertical"),
  path: wordFrame(captions, "path"),
  ceiling: wordFrame(captions, "ceiling"),
  expensive: wordFrame(captions, "expensive"),
  maintenance: wordFrame(captions, "maintenance"),
  failure: wordFrame(captions, "failure"),
  backups: wordFrame(captions, "backups"),
  restore: wordFrame(captions, "restore"),
  down: wordFrame(captions, "down"),
  offline: wordFrame(captions, "offline"),
  move: wordFrame(captions, "move", 2),
  competing: wordFrame(captions, "competing"),
  own: wordFrame(captions, "own"),
  separately: wordFrame(captions, "separately"),
  networkCall: wordFrame(captions, "network", 2),
  two: wordFrame(captions, "two"),
  configure: wordFrame(captions, "configure"),
  monitor: wordFrame(captions, "monitor"),
  protect: wordFrame(captions, "protect"),
  either: wordFrame(captions, "either"),
  fail: wordFrame(captions, "fail"),
  contention: wordFrame(captions, "contention"),
  independently: wordFrame(captions, "independently"),
  online: wordFrame(captions, "online"),
  eitherAgain: wordFrame(captions, "either", 2),
  different: wordFrame(captions, "different"),
};

const BASE = { x: 960, y: 540, width: 452, height: 316 };
/** Where the two machines sit once the database moves out. */
const APP_X = 640;
const DB_X = 1360;

const shots = {
  /**
   * Where scene 05b leaves the machine.
   *
   * This scene re-centres the machine on the world origin, so it cannot simply
   * copy 05b's camera the way the other seams do. These numbers are solved
   * instead: they put a machine at world 960 exactly where 05b's camera puts
   * one at world 1400, at the same size. Same picture, different world.
   */
  handover: [720, 471, 1.04],
  onMachine: [BASE.x, BASE.y - 90, 1.24],
  grown: [BASE.x, BASE.y - 80, 0.96],
  split: [960, BASE.y - 70, 0.86],
} as const;

const between = (
  frame: number,
  from: number,
  to: number,
  a: readonly number[],
  b: readonly number[],
): [number, number, number] => [
  interpolate(frame, [from, to], [a[0], b[0]], EASE_IN_OUT),
  interpolate(frame, [from, to], [a[1], b[1]], EASE_IN_OUT),
  interpolate(frame, [from, to], [a[2], b[2]], EASE_IN_OUT),
];

export const SingleServerScene06: React.FC = () => {
  const frame = useCurrentFrame();

  let cam: [number, number, number];
  // Enter on the framing scene 05b ended on, then move to this scene's own.
  if (frame < at.larger)
    cam = between(frame, 0, 56, shots.handover, shots.onMachine);
  else if (frame < at.move)
    cam = between(
      frame,
      at.larger,
      at.vertical + 40,
      shots.onMachine,
      shots.grown,
    );
  else cam = between(frame, at.move, at.move + 90, shots.grown, shots.split);

  const [camX, camY, zoom] = cam;
  const sheen = interpolate(camX, [700, 1200], [0.25, 0.75], clamp);

  // Scaling up is the machine itself getting bigger. The request path does not
  // change, which is exactly why the narration calls it the right first move.
  const growth = arrive(frame, at.larger, 70, 1, 1.42);
  const width = BASE.width * growth;
  const height = BASE.height * growth;

  // Then the database leaves for a machine of its own.
  const split = interpolate(
    frame,
    [at.move, at.move + 80],
    [0, 1],
    EASE_IN_OUT,
  );
  const appX = interpolate(split, [0, 1], [BASE.x, APP_X]);
  const dbX = interpolate(split, [0, 1], [BASE.x, DB_X]);
  const independentApp = interpolate(
    frame,
    [at.separately, at.separately + 42],
    [1, 1.13],
    EASE_IN_OUT,
  );
  const independentDb = interpolate(
    frame,
    [at.independently - 28, at.independently + 24],
    [1, 1.1],
    EASE_IN_OUT,
  );
  const appWidth = interpolate(split, [0, 1], [width, 400]) * independentApp;
  const dbWidth = interpolate(split, [0, 1], [width, 400]) * independentDb;
  const appFailure = interpolate(
    frame,
    [at.online, at.eitherAgain],
    [0, 0.72],
    clamp,
  );
  const dbFailure = interpolate(
    frame,
    [at.eitherAgain, at.different],
    [0, 0.72],
    clamp,
  );

  const monitoringPanel = crossFade(frame, [
    at.monitoring - 10,
    at.monitoring + 16,
    at.larger - 18,
    at.larger,
  ]);
  const upgradesPanel = crossFade(frame, [
    at.cpu - 12,
    at.cpu + 12,
    at.vertical - 18,
    at.vertical,
  ]);
  const samePath = crossFade(frame, [
    at.path - 42,
    at.path - 12,
    at.ceiling - 24,
    at.ceiling,
  ]);
  const scaleGrowth = interpolate(
    frame,
    [at.vertical - 10, at.vertical + 56],
    [0.88, 1.18],
    EASE_IN_OUT,
  );
  // The scene's shots and overlays, in order, each holding until the next.
  const slides = [
    { from: at.vertical, to: at.ceiling },
    { from: at.ceiling, to: at.backups },
    { from: at.backups, to: at.monitoringAgain },
    { from: at.monitoringAgain, to: at.move },
    { from: at.two, to: at.either },
    { from: at.online, to: Number.MAX_SAFE_INTEGER },
  ];
  const [
    scaleStory,
    riskPanel,
    backupStory,
    contentionSlide,
    operationsSlide,
    finalPanel,
  ] = deck(frame, slides);
  const [scalePush, riskPush, backupPush, , , finalPush] = settle(
    frame,
    slides,
  );

  // The four full-frame shots replace the stage; the other two are overlays
  // that sit on top of it and must leave it visible.
  const stageCover = Math.max(scaleStory, riskPanel, backupStory, finalPanel);
  // Overlays belong to the machines they annotate, so they come and go with
  // the stage rather than surfacing on a full-frame shot's blank paper.
  const stageVisible = stageBehind(stageCover);
  const contentionPanel = contentionSlide * stageVisible;
  const operationsPanel = operationsSlide * stageVisible;

  const splitLabels =
    stageVisible *
    crossFade(frame, [at.own - 8, at.own + 22, at.either - 24, at.either - 8]);
  const failLabel =
    stageVisible *
    crossFade(frame, [
      at.either - 8,
      at.either + 18,
      at.contention - 24,
      at.contention - 8,
    ]);
  const benefitPanel =
    stageVisible *
    crossFade(frame, [
      at.contention - 8,
      at.contention + 18,
      at.online - 24,
      at.online - 8,
    ]);

  const at2 = (world: { x: number; y: number }) =>
    pointAt(world, { x: camX, y: camY, zoom }, MACHINE_DEPTH);

  // "Either can fail" is about the pair, so it brackets both machines. A single
  // arrow at the midpoint landed in the gap between them, pointing at nothing.
  const pairLeft = at2({ x: appX - appWidth / 2, y: BASE.y - height / 2 });
  // The side face stands out past the front, so the arm has to reach it.
  const pairRight = at2({
    x: dbX + dbWidth / 2 + MACHINE_EDGE,
    y: BASE.y - height / 2,
  });
  const BRACKET_ARMS = 34;

  const connectorLeft = appX + appWidth / 2;
  const connectorRight = dbX - dbWidth / 2;
  const dbCall = interpolate(
    frame,
    [at.networkCall - 8, at.networkCall + 52],
    [connectorLeft, connectorRight],
    EASE_IN_OUT,
  );

  return (
    <SceneShell captions={captions} narration="scene-06">
      <Camera x={camX} y={camY} zoom={zoom} opacity={stageVisible}>
        <div
          style={{
            position: "absolute",
            left: connectorLeft,
            top: BASE.y - 1,
            width: Math.max(0, connectorRight - connectorLeft),
            height: 2,
            opacity: split * 0.65,
            background: theme.colors.grayLight,
          }}
        />

        <Machine
          x={appX}
          y={BASE.y}
          width={appWidth}
          height={height}
          opacity={1 - appFailure}
          frame={frame}
          light={sheen}
          defocus={dof(-70, -70)}
          process={{ lit: 0.85, alive: 1 - appFailure, fill: 1 }}
          database={{
            lit: 0.7 * (1 - split),
            alive: 1,
            fill: 1 - split,
            present: 1 - split,
          }}
        />

        {/* The database's new machine only exists after it moves out. */}
        <div style={{ opacity: split }}>
          <Machine
            x={dbX}
            y={BASE.y}
            width={dbWidth}
            height={height}
            opacity={split * (1 - dbFailure)}
            frame={frame + 17}
            light={1 - sheen}
            defocus={dof(-70, -70)}
            process={{ lit: 0.12, alive: 1, fill: 0, present: 0 }}
            database={{ lit: 0.85, alive: 1, fill: 1 }}
          />
        </div>

        <Packet
          x={dbCall}
          y={BASE.y}
          scale={0.52}
          opacity={
            crossFade(frame, [
              at.networkCall - 12,
              at.networkCall + 6,
              at.networkCall + 42,
              at.networkCall + 60,
            ]) * split
          }
          kind="request"
          defocus={dof(26, -70)}
        />
      </Camera>

      {/* Vertical scaling is a separate teaching shot. The path stays in the
          left text column, so no annotation or connector crosses the machine. */}
      <EditorialShot opacity={scaleStory} push={scalePush} zIndex={6}>
        <div
          style={{
            position: "absolute",
            left: 180,
            top: 154,
            width: 650,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: theme.colors.gray,
              letterSpacing: "0.01em",
            }}
          >
            vertical scaling
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: 76,
              lineHeight: 0.94,
              fontWeight: 800,
              letterSpacing: "-0.06em",
              color: theme.colors.ink,
            }}
          >
            same machine
          </div>
          <div
            style={{
              fontSize: 76,
              lineHeight: 0.94,
              fontWeight: 800,
              letterSpacing: "-0.06em",
              color: theme.colors.blue,
            }}
          >
            more capacity
          </div>
        </div>

        <Machine
          x={1360}
          y={520}
          width={430 * scaleGrowth}
          height={300 * scaleGrowth}
          opacity={1}
          frame={frame}
          light={0.72}
          defocus={0}
          process={{ lit: 0.86, alive: 1, fill: 1 }}
          database={{ lit: 0.68, alive: 1, fill: 1 }}
        />

        <div
          style={{
            position: "absolute",
            left: 180,
            top: 600,
            width: 650,
            opacity: samePath,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: theme.colors.gray,
              marginBottom: 18,
            }}
          >
            same path
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              fontSize: 30,
              fontWeight: 800,
              color: theme.colors.ink,
              whiteSpace: "nowrap",
            }}
          >
            <span>request</span>
            <span style={{ color: theme.colors.grayLight }}>→</span>
            <span style={{ color: theme.colors.blue }}>machine</span>
            <span style={{ color: theme.colors.grayLight }}>→</span>
            <span>response</span>
          </div>
        </div>
      </EditorialShot>

      <div style={{ opacity: monitoringPanel }}>
        {[
          { label: "CPU", x: 390, level: 0.94 },
          { label: "memory", x: 770, level: 0.88 },
          { label: "storage", x: 1150, level: 0.91 },
          { label: "network", x: 1530, level: 0.86 },
        ].map((meter) => (
          <Meter
            key={meter.label}
            label={meter.label}
            x={meter.x}
            y={196}
            width={300}
            level={meter.level}
            active={1}
            reveal={monitoringPanel}
            limit={0.9}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 220,
          right: 220,
          top: 126,
          opacity: upgradesPanel,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: theme.fontFamily,
        }}
      >
        {[
          { label: "more CPU", mark: at.cpu, next: at.memory },
          { label: "more memory", mark: at.memory, next: at.storage },
          { label: "faster storage", mark: at.storage, next: at.network },
          { label: "more network", mark: at.network, next: at.vertical },
        ].map((item) => {
          const active = 0.3 + beat(frame, item.mark, item.next, 18) * 0.7;
          return (
            <div key={item.label} style={{ width: 310, opacity: active }}>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: active > 0.6 ? theme.colors.blue : theme.colors.gray,
                  marginBottom: 12,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  height: 12,
                  borderRadius: 6,
                  background: "rgba(17,18,20,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${interpolate(active, [0.3, 1], [42, 100], clamp)}%`,
                    height: "100%",
                    borderRadius: 6,
                    background: theme.colors.blue,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <EditorialShot opacity={riskPanel} push={riskPush} zIndex={6}>
        <div style={{ position: "absolute", left: 180, top: 170, width: 650 }}>
          <div
            style={{ fontSize: 68, fontWeight: 800, letterSpacing: "-0.06em" }}
          >
            a ceiling
          </div>
          <div style={{ marginTop: 34, display: "flex", gap: 14 }}>
            {[
              { text: "higher cost", mark: at.expensive },
              { text: "maintenance", mark: at.maintenance },
              { text: "failure", mark: at.failure },
            ].map((item) => (
              <div
                key={item.text}
                style={{
                  padding: "14px 18px",
                  borderRadius: 12,
                  fontSize: 25,
                  fontWeight: 700,
                  background:
                    frame >= item.mark
                      ? "rgba(23,105,224,0.09)"
                      : "rgba(17,18,20,0.05)",
                  color:
                    frame >= item.mark ? theme.colors.blue : theme.colors.gray,
                  whiteSpace: "nowrap",
                }}
              >
                {item.text}
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 64,
              opacity: interpolate(
                frame,
                [at.offline - 10, at.offline + 18],
                [0, 1],
                clamp,
              ),
              fontSize: 38,
              lineHeight: 1.08,
              fontWeight: 800,
              color: theme.colors.gray,
            }}
          >
            one machine
            <div
              style={{ color: theme.colors.blue, fontSize: 52, marginTop: 6 }}
            >
              one point of failure
            </div>
          </div>
        </div>
        <Machine
          x={1390}
          y={520}
          width={430}
          height={300}
          opacity={1}
          frame={frame}
          light={0.68}
          defocus={0}
          process={{ lit: 0.78, alive: 1, fill: 1 }}
          database={{ lit: 0.62, alive: 1, fill: 1 }}
        />
      </EditorialShot>

      <EditorialShot opacity={backupStory} push={backupPush} zIndex={7}>
        <Label x={560} y={164} size={42} weight={800} opacity={1}>
          server down
        </Label>
        <Machine
          x={560}
          y={510}
          width={430}
          height={300}
          opacity={0.28}
          frame={frame}
          light={0.42}
          defocus={0}
          process={{ lit: 0, alive: 0, fill: 1 }}
          database={{ lit: 0, alive: 0, fill: 1 }}
        />
        <div
          style={{
            position: "absolute",
            left: 1150,
            top: 356,
            width: 370,
            height: 300,
            borderRadius: 26,
            background: theme.colors.paperBright,
            boxShadow:
              "0 30px 70px rgba(17,18,20,0.13), inset 0 0 0 1px rgba(17,18,20,0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 230,
                height: 34,
                borderRadius: 17,
                background: i === 0 ? theme.colors.blue : "rgba(17,18,20,0.13)",
                opacity: i === 0 ? 0.82 : 1,
              }}
            />
          ))}
        </div>
        <Label x={1335} y={164} size={42} weight={800} accent opacity={1}>
          backup data
        </Label>
        <Label
          x={1335}
          y={706}
          size={30}
          weight={700}
          opacity={beat(frame, at.restore, at.monitoringAgain, 22)}
        >
          restores data later
        </Label>
        <div
          style={{
            position: "absolute",
            left: 340,
            top: 752,
            width: 1240,
            opacity: beat(frame, at.down, at.monitoringAgain, 14),
            textAlign: "center",
            fontSize: 38,
            fontWeight: 800,
            color: theme.colors.blue,
          }}
        >
          not serving requests
        </div>
      </EditorialShot>

      <div
        style={{
          position: "absolute",
          left: 110,
          top: 150,
          width: 480,
          opacity: contentionPanel,
          fontFamily: theme.fontFamily,
          color: theme.colors.ink,
        }}
      >
        <div
          style={{ fontSize: 46, fontWeight: 800, letterSpacing: "-0.05em" }}
        >
          one pool, two workloads
        </div>
        {["CPU", "memory", "storage"].map((resource, i) => (
          <div key={resource} style={{ marginTop: 24 }}>
            <div
              style={{
                fontSize: 23,
                fontWeight: 700,
                color: theme.colors.gray,
                marginBottom: 8,
              }}
            >
              {resource}
            </div>
            <div
              style={{
                height: 18,
                borderRadius: 9,
                overflow: "hidden",
                background: "rgba(17,18,20,0.08)",
                display: "flex",
              }}
            >
              <div
                style={{
                  width: `${52 + i * 8}%`,
                  background: theme.colors.blue,
                }}
              />
              <div style={{ flex: 1, background: "rgba(17,18,20,0.34)" }} />
            </div>
          </div>
        ))}
        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 26,
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          <span style={{ color: theme.colors.blue }}>application</span>
          <span style={{ color: theme.colors.gray }}>database</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 300,
          right: 300,
          top: 822,
          opacity: operationsPanel,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: theme.fontFamily,
          fontSize: 30,
          fontWeight: 800,
        }}
      >
        {[
          { text: "configure ×2", mark: at.configure },
          { text: "monitor ×2", mark: at.monitor },
          { text: "protect ×2", mark: at.protect },
        ].map((item) => (
          <span
            key={item.text}
            style={{
              color: frame >= item.mark ? theme.colors.blue : theme.colors.gray,
              padding: "13px 22px",
              borderRadius: 14,
              background:
                frame >= item.mark
                  ? "rgba(23,105,224,0.08)"
                  : "rgba(17,18,20,0.045)",
              whiteSpace: "nowrap",
            }}
          >
            {item.text}
          </span>
        ))}
      </div>

      <EditorialShot opacity={finalPanel} push={finalPush} zIndex={10}>
        <EditorialCopy top={318}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              letterSpacing: "-0.06em",
              color: theme.colors.ink,
            }}
          >
            Separate scaling{" "}
            <span style={{ color: theme.colors.blue }}>
              does not mean uptime.
            </span>
          </div>
          <div
            style={{
              marginTop: 34,
              display: "flex",
              alignItems: "center",
              gap: 24,
              fontSize: 36,
              fontWeight: 700,
              color: theme.colors.gray,
            }}
          >
            <span style={{ opacity: 1 - appFailure }}>application</span>
            <span>or</span>
            <span style={{ opacity: 1 - dbFailure }}>database</span>
            <span>can stop the request</span>
          </div>
          <div
            style={{
              marginTop: 42,
              fontSize: 42,
              fontWeight: 800,
              color: theme.colors.blue,
              opacity: interpolate(
                frame,
                [at.different - 10, at.different + 18],
                [0, 1],
                clamp,
              ),
            }}
          >
            a different design
          </div>
        </EditorialCopy>
      </EditorialShot>

      <Label x={686} y={158} size={34} weight={800} opacity={splitLabels}>
        application
      </Label>
      <div
        style={{
          position: "absolute",
          left: 430,
          right: 430,
          top: 132,
          opacity: benefitPanel,
          textAlign: "center",
          fontFamily: theme.fontFamily,
        }}
      >
        <div
          style={{
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: theme.colors.ink,
          }}
        >
          separate resource pools
        </div>
        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "center",
            gap: 58,
            fontSize: 30,
            fontWeight: 800,
          }}
        >
          <span style={{ color: theme.colors.blue }}>less contention</span>
          <span
            style={{
              color:
                frame >= at.independently
                  ? theme.colors.blue
                  : theme.colors.gray,
            }}
          >
            scale independently
          </span>
        </div>
      </div>

      {/* The conclusion of the segment, named on the pair rather than
          spelled out as a sentence the narrator is already speaking. */}
      <div
        style={{
          position: "absolute",
          left: pairLeft.x,
          top: pairLeft.y - BRACKET_ARMS - 78,
          width: pairRight.x - pairLeft.x,
          opacity: failLabel,
          fontFamily: theme.fontFamily,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 40,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: theme.colors.blue,
          }}
        >
          either can fail
        </div>
        <div
          style={{
            marginTop: 14,
            height: BRACKET_ARMS,
            borderTop: `2px solid ${theme.colors.blue}`,
            borderLeft: `2px solid ${theme.colors.blue}`,
            borderRight: `2px solid ${theme.colors.blue}`,
          }}
        />
      </div>

      <Sfx name="settle" at={at.larger} gain={0.7} />
      <Sfx name="name" at={at.vertical} gain={0.6} />
      <Sfx name="dissolve" at={at.ceiling} gain={0.5} />
      <Sfx name="send" at={at.move} gain={0.7} />
      <Sfx name="land" at={at.move + 80} gain={0.6} />
      <Sfx name="tick" at={at.separately} gain={0.5} />
    </SceneShell>
  );
};
