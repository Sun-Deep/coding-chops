import { interpolate, useCurrentFrame } from "remotion";
import type { Caption } from "@remotion/captions";
import { Fragment } from "react";
import { SceneShell } from "../../../shared/primitives/SceneShell";
import { Sfx } from "../../../shared/primitives/Sfx";
import { theme } from "../../../shared/brand/theme";
import { clamp } from "../../../shared/video/timing";
import { wordFrame } from "../../../shared/video/captions";
import { EASE_IN_OUT, EASE_OUT, travel } from "../../../shared/video/motion";
import {
  Camera,
  LINE_Y,
  PHONE_RIGHT,
  Packet,
  Phone,
  pointAt,
  Wire,
  dof,
  PHONE,
} from "../../../shared/scene/stage";
import { Callout } from "../../../shared/scene/callout";
import { SCENE_04_OPENING } from "./Scene04";
import { Machine } from "../../../shared/scene/machine";

/** Objects live on the machine layer, so callouts project against its depth. */
const MACHINE_DEPTH = -70;
import captionData from "../../../../curriculum/system-design/01-single-server/audio/captions/scene-03.json";

const captions = captionData as Caption[];

const at = {
  photoApp: wordFrame(captions, "photo"),
  client: wordFrame(captions, "client"),
  request: wordFrame(captions, "request"),
  reaches: wordFrame(captions, "reaches"),
  reads: wordFrame(captions, "reads"),
  give: wordFrame(captions, "give"),
  asks: wordFrame(captions, "asks"),
  database: wordFrame(captions, "database", 2),
  memory: wordFrame(captions, "memory"),
  storage: wordFrame(captions, "storage"),
  records: wordFrame(captions, "records"),
  builds: wordFrame(captions, "builds"),
  failed: wordFrame(captions, "failed"),
  structured: wordFrame(captions, "structured"),
  json: wordFrame(captions, "json"),
  displays: wordFrame(captions, "displays"),
  went: wordFrame(captions, "went"),
  clientFinal: wordFrame(captions, "client", 3),
  databaseFinal: wordFrame(captions, "database", 3),
  clientReturn: wordFrame(captions, "client", 4),
};

/** Same positions as scenes 01 and 02, so nothing jumps across a cut. */
const MACHINE = { x: 1400, y: 560, width: 452, height: 316 };
const PROCESS_X = MACHINE.x - 76;
const DATABASE_X = MACHINE.x + 128;
const PACKET_REST = PHONE_RIGHT + 46;
const PACKET_IN = MACHINE.x - MACHINE.width / 2 - 40;

/**
 * Where this scene opens, and where scene 02 ends.
 *
 * Exported rather than copied, because two hand-matched triples drift the first
 * time either scene is re-framed and the seam quietly breaks again.
 *
 * At [700, 452, 1.06] this left the machine's right edge 3px inside a 1920
 * frame, which is a cropped node by any reading of the standard. It only got
 * away with it because the shot was brief and the phone held the eye. Ending
 * scene 02 here as well put the machine alone against the frame edge for two
 * seconds, where there was nowhere else to look.
 *
 * This still favours the phone, which is what the narration is naming, while
 * leaving the machine 172px of air on the right.
 */
export const SCENE_03_OPENING = [820, 452, 1.0] as const;

const shots = {
  onPhone: SCENE_03_OPENING,
  wide: [960, 474, 0.88],
  onMachine: [MACHINE.x, MACHINE.y - 96, 1.38],
  onProcess: [PROCESS_X, MACHINE.y - 80, 1.5],
  onDatabase: [DATABASE_X, MACHINE.y - 80, 1.5],
  // The seam into scene 04, which opens holding the same phone and machine.
  full: SCENE_04_OPENING,
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

export const SingleServerScene03: React.FC = () => {
  const frame = useCurrentFrame();

  let cam: [number, number, number];
  if (frame < at.request) cam = [...shots.onPhone];
  else if (frame < at.reaches)
    cam = between(
      frame,
      at.request,
      at.request + 70,
      shots.onPhone,
      shots.wide,
    );
  else if (frame < at.asks)
    cam = between(
      frame,
      at.reaches,
      at.reads + 40,
      shots.wide,
      shots.onProcess,
    );
  else if (frame < at.records)
    cam = between(
      frame,
      at.asks,
      at.database + 40,
      shots.onProcess,
      shots.onDatabase,
    );
  else if (frame < at.json)
    cam = between(
      frame,
      at.records,
      at.builds + 30,
      shots.onDatabase,
      shots.onMachine,
    );
  else
    cam = between(
      frame,
      at.json,
      at.displays + 40,
      shots.onMachine,
      shots.full,
    );

  const [camX, camY, zoom] = cam;
  const at2 = (world: { x: number; y: number }) =>
    pointAt(world, { x: camX, y: camY, zoom }, MACHINE_DEPTH);
  // Scene 02 hands over on the same camera with the machine already in place,
  // so the machine is the one thing that must not move. Everything else on the
  // left arrives together as the narrator says "back to the photo app", rather
  // than being there before the words are.
  const phoneIn = interpolate(frame, [0, 22], [0, 1], EASE_OUT);
  const sheen = interpolate(camX, [600, 1500], [0.15, 0.85], clamp);
  const focus = interpolate(
    frame,
    [at.reaches, at.reaches + 40, at.json, at.json + 40],
    [0, -70, -70, 0],
    clamp,
  );

  // One packet, followed the whole way. It goes in as a request, drops to the
  // database, comes back carrying records, and leaves as a response.
  const toMachine = travel(
    frame,
    at.reaches - 30,
    at.reads,
    PACKET_REST,
    PACKET_IN,
  );
  const intoProcess = interpolate(
    frame,
    [at.reads, at.reads + 26],
    [PACKET_IN, PROCESS_X],
    EASE_IN_OUT,
  );
  const acrossToDb = interpolate(
    frame,
    [at.asks, at.asks + 40],
    [PROCESS_X, DATABASE_X],
    EASE_IN_OUT,
  );
  const backAcross = interpolate(
    frame,
    [at.records, at.records + 40],
    [DATABASE_X, PROCESS_X],
    EASE_IN_OUT,
  );
  const outbound = travel(
    frame,
    at.json + 30,
    at.displays,
    PROCESS_X,
    PACKET_REST,
  );

  const packetX =
    frame >= at.json + 30
      ? outbound
      : frame >= at.records
        ? backAcross
        : frame >= at.asks
          ? acrossToDb
          : frame >= at.reads
            ? intoProcess
            : toMachine;
  const packetY = LINE_Y;

  const carrying = frame >= at.records;
  const inside = frame >= at.reads && frame < at.json + 30;

  const processLit = interpolate(
    frame,
    [
      at.reads - 20,
      at.reads + 20,
      at.asks + 20,
      at.asks + 50,
      at.records + 30,
      at.builds,
    ],
    [0.3, 1, 1, 0.4, 0.4, 1],
    clamp,
  );
  const databaseLit = interpolate(
    frame,
    [at.asks, at.asks + 40, at.records, at.records + 40],
    [0.3, 1, 1, 0.4],
    clamp,
  );
  const dbFill = interpolate(
    frame,
    [at.memory - 20, at.storage + 50],
    [0.35, 1],
    EASE_IN_OUT,
  );
  const photos = interpolate(
    frame,
    [at.displays - 10, at.displays + 70],
    [0, 1],
    EASE_IN_OUT,
  );
  // The process is named as soon as the request reaches it, and stays named.
  const processNamed = interpolate(
    frame,
    [at.reads - 18, at.reads + 16],
    [0, 1],
    clamp,
  );
  const clientLabel = interpolate(
    frame,
    [at.client - 8, at.client + 18, at.request - 24, at.request - 8],
    [0, 1, 1, 0],
    clamp,
  );
  const queryLabel = interpolate(
    frame,
    [at.give - 8, at.give + 16, at.asks - 24, at.asks - 8],
    [0, 1, 1, 0],
    clamp,
  );
  const databaseLabel = interpolate(
    frame,
    [at.asks - 8, at.asks + 16, at.records - 24, at.records - 8],
    [0, 1, 1, 0],
    clamp,
  );
  const storageLabel = interpolate(
    frame,
    [at.memory - 8, at.memory + 14, at.records - 24, at.records - 8],
    [0, 1, 1, 0],
    clamp,
  );
  const responseLabel = interpolate(
    frame,
    [at.structured - 8, at.structured + 18, at.displays - 22, at.displays - 6],
    [0, 1, 1, 0],
    clamp,
  );
  const responseDefinition = interpolate(
    frame,
    [at.builds - 8, at.builds + 18, at.structured - 24, at.structured - 8],
    [0, 1, 1, 0],
    clamp,
  );
  const pathSummary = interpolate(
    frame,
    [at.went - 8, at.went + 18],
    [0, 1],
    clamp,
  );
  /**
   * The recap strip owns the top of the frame once it arrives, so every label
   * that lives up there clears out of its way.
   *
   * Four things sit in that band and three of them happened to have an
   * out-window that fell before the recap. "application process" did not, and
   * it sat on top of the strip for the last three seconds of the scene. Gating
   * the band means the next label added up there cannot repeat that.
   */
  const topBand = 1 - pathSummary;

  return (
    <SceneShell captions={captions} narration="scene-03">
      <Camera x={camX} y={camY} zoom={zoom}>
        <Wire opacity={phoneIn} defocus={dof(-34, focus)} />
        <Machine
          x={MACHINE.x}
          y={MACHINE.y}
          width={MACHINE.width}
          height={MACHINE.height}
          opacity={1}
          frame={frame}
          light={sheen}
          defocus={dof(-70, focus)}
          process={{ lit: processLit, alive: 1, fill: 1 }}
          database={{ lit: databaseLit, alive: 1, fill: dbFill }}
        />
        <Phone
          loaded={photos}
          opacity={phoneIn}
          frame={frame}
          defocus={dof(0, focus)}
          light={sheen}
        />
        <Packet
          x={packetX}
          y={packetY}
          scale={interpolate(
            frame,
            [at.reads, at.reads + 20],
            [1, 0.78],
            clamp,
          )}
          opacity={phoneIn}
          kind={carrying ? "response" : "request"}
          // Inside the machine the packet is the subject, so it sits on the
          // focal plane instead of being softened by its own depth.
          defocus={dof(inside ? focus : 26, focus)}
        />
      </Camera>

      {/* Named parts point at themselves and keep their labels. Floating text
          at the top of the frame leaves a beginner guessing which shape it
          belongs to, which is the whole reason callouts exist. */}
      <Callout
        target={at2({ x: PHONE.x, y: PHONE.y - PHONE.height / 2 })}
        label={{ x: 470, y: 158 }}
        progress={clientLabel * topBand}
        size={42}
        bow={-1}
      >
        the client
      </Callout>
      <Callout
        target={at2({ x: PROCESS_X, y: MACHINE.y - MACHINE.height / 2 })}
        label={{ x: 1080, y: 158 }}
        progress={processNamed * topBand}
        size={40}
        bow={-1}
      >
        application process
      </Callout>
      <div
        style={{
          position: "absolute",
          left: 510,
          top: 142,
          width: 900,
          opacity: queryLabel * topBand,
          textAlign: "center",
          fontFamily: theme.fontFamily,
        }}
      >
        <div
          style={{ fontSize: 24, fontWeight: 700, color: theme.colors.gray }}
        >
          request
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: "-0.045em",
            color: theme.colors.blue,
          }}
        >
          first 10 photos for this user
        </div>
      </div>
      <Callout
        target={at2({ x: DATABASE_X, y: MACHINE.y - MACHINE.height / 2 })}
        label={{ x: 1560, y: 158 }}
        progress={databaseLabel * topBand}
        size={40}
      >
        the database
      </Callout>
      <div
        style={{
          position: "absolute",
          left: 550,
          top: 222,
          width: 820,
          opacity: storageLabel,
          display: "flex",
          justifyContent: "center",
          gap: 20,
          fontFamily: theme.fontFamily,
          fontSize: 30,
          fontWeight: 800,
          color: theme.colors.gray,
        }}
      >
        <span
          style={{
            color: frame < at.storage ? theme.colors.blue : theme.colors.gray,
          }}
        >
          memory
        </span>
        <span>or</span>
        <span
          style={{
            color: frame >= at.storage ? theme.colors.blue : theme.colors.gray,
          }}
        >
          persistent storage
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 500,
          top: 130,
          width: 920,
          opacity: responseDefinition,
          textAlign: "center",
          fontFamily: theme.fontFamily,
        }}
      >
        <div
          style={{
            fontSize: 50,
            fontWeight: 800,
            letterSpacing: "-0.045em",
            color: theme.colors.ink,
          }}
        >
          two outcomes
        </div>
        <div
          style={{
            marginTop: 22,
            display: "flex",
            justifyContent: "center",
            gap: 72,
            fontSize: 34,
            fontWeight: 800,
          }}
        >
          <span
            style={{
              color: frame < at.failed ? theme.colors.blue : theme.colors.gray,
            }}
          >
            requested data
          </span>
          <span
            style={{
              color: frame >= at.failed ? theme.colors.blue : theme.colors.gray,
            }}
          >
            error explanation
          </span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 560,
          top: 148,
          width: 800,
          opacity: responseLabel,
          textAlign: "center",
          fontFamily: theme.fontFamily,
        }}
      >
        <div
          style={{ fontSize: 25, fontWeight: 700, color: theme.colors.gray }}
        >
          response as JSON
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 34,
            fontWeight: 700,
            color: theme.colors.blue,
          }}
        >
          {`{ "photos": [ ... ] }`}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 250,
          right: 250,
          top: 146,
          opacity: pathSummary,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: theme.fontFamily,
          fontSize: 28,
          fontWeight: 800,
          color: theme.colors.gray,
        }}
      >
        {[
          { text: "client", mark: at.clientFinal },
          { text: "application", mark: at.clientFinal + 22 },
          { text: "database", mark: at.databaseFinal },
          { text: "application", mark: at.databaseFinal + 28 },
          { text: "client", mark: at.clientReturn },
        ].map((item, i, items) => (
          <Fragment key={`${item.text}-${i}`}>
            <span
              style={{
                color:
                  frame >= item.mark ? theme.colors.blue : theme.colors.gray,
              }}
            >
              {item.text}
            </span>
            {i < items.length - 1 ? <span>→</span> : null}
          </Fragment>
        ))}
      </div>

      <Sfx name="send" at={at.reaches - 30} gain={0.85} />
      <Sfx name="land" at={at.reads} gain={0.7} />
      <Sfx name="process" at={at.asks} gain={0.7} />
      <Sfx name="land" at={at.asks + 40} gain={0.5} />
      <Sfx name="process" at={at.memory} gain={0.6} />
      <Sfx name="return" at={at.records} gain={0.7} />
      <Sfx name="tick" at={at.builds} gain={0.5} />
      <Sfx name="send" at={at.json + 30} gain={0.85} />
      <Sfx name="land" at={at.displays} gain={0.75} />
      {[10, 24, 38].map((o) => (
        <Sfx key={o} name="fill" at={at.displays + o} gain={0.9} />
      ))}
      <Sfx name="name" at={at.went} gain={0.55} />
    </SceneShell>
  );
};
