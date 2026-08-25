import { interpolate, useCurrentFrame } from "remotion";
import type { Caption } from "@remotion/captions";
import { SceneShell } from "../../../shared/primitives/SceneShell";
import { Sfx } from "../../../shared/primitives/Sfx";
import { clamp } from "../../../shared/video/timing";
import { wordFrame } from "../../../shared/video/captions";
import { EASE_IN_OUT } from "../../../shared/video/motion";
import { Camera, dof, pointAt } from "../../../shared/scene/stage";
import { Callout } from "../../../shared/scene/callout";
import { SCENE_03_OPENING } from "./Scene03";
import { Machine } from "../../../shared/scene/machine";

/** Objects live on the machine layer, so callouts project against its depth. */
const MACHINE_DEPTH = -70;
import captionData from "../../../../curriculum/system-design/01-single-server/audio/captions/scene-02.json";

const captions = captionData as Caption[];

/**
 * Beats anchored to the frame each word is spoken. A re-record moves the
 * picture with the voice instead of quietly desynchronising it.
 */
/** The scene now ends on "separate machines", so the close is measured from
 *  there rather than from a line that no longer exists. */
const at = {
  machine: wordFrame(captions, "machine"),
  program: wordFrame(captions, "program"),
  two: wordFrame(captions, "two"),
  application: wordFrame(captions, "application"),
  code: wordFrame(captions, "code"),
  process: wordFrame(captions, "process", 3),
  database: wordFrame(captions, "database"),
  databaseAgain: wordFrame(captions, "database", 3),
  accounts: wordFrame(captions, "accounts"),
  why: wordFrame(captions, "why"),
  restart: wordFrame(captions, "restart"),
  memory: wordFrame(captions, "memory"),
  survive: wordFrame(captions, "survive"),
  persistent: wordFrame(captions, "persistent"),
  both: wordFrame(captions, "both"),
  separate: wordFrame(captions, "separate"),
};

/** The machine holds scene 01's position, so the cut between them lands on it. */
const MACHINE = { x: 1400, y: 560, width: 452, height: 316 };
const PROCESS_X = MACHINE.x - 76;
const DATABASE_X = MACHINE.x + 128;
/**
 * Framings in world pixels. The first one matches scene 01's closing shot
 * exactly, so the machine does not jump across the cut.
 *
 * Every framing after that aims above the machine, which pushes it into the
 * lower two thirds and leaves the top band clear for callouts. Labels crowded
 * against an object's top edge have nowhere to draw an arrow from.
 */
const shots = {
  handover: [960, 570, 0.92],
  onMachine: [MACHINE.x, MACHINE.y - 96, 1.5],
  intoUnits: [MACHINE.x, MACHINE.y - 92, 1.78],
  onProcess: [MACHINE.x - 76, MACHINE.y - 60, 1.6],
  onDatabase: [MACHINE.x + 128, MACHINE.y - 60, 1.6],
  wholeMachine: [MACHINE.x, MACHINE.y - 92, 1.32],
  // The seam into scene 03. Holding the machine still across the cut is what
  // makes it read as one continuous shot instead of two unrelated frames.
  pullBack: SCENE_03_OPENING,
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

export const SingleServerScene02: React.FC = () => {
  const frame = useCurrentFrame();

  let cam: [number, number, number];
  if (frame < at.machine)
    cam = between(frame, 0, at.machine, shots.handover, shots.onMachine);
  else if (frame < at.two)
    cam = between(
      frame,
      at.machine,
      at.program + 40,
      shots.onMachine,
      shots.intoUnits,
    );
  else if (frame < at.database)
    cam = between(
      frame,
      at.application - 20,
      at.application + 34,
      shots.intoUnits,
      shots.onProcess,
    );
  else if (frame < at.both)
    cam = between(
      frame,
      at.database - 20,
      at.database + 40,
      shots.onProcess,
      shots.onDatabase,
    );
  else if (frame < at.separate)
    cam = between(
      frame,
      at.both,
      at.both + 60,
      shots.onDatabase,
      shots.wholeMachine,
    );
  else
    // 96 frames of travel, with 55 left in the scene. The pull-back was still
    // moving when the scene cut, which is what made the seam into scene 03 read
    // as a glitch rather than an edit. A scene has to end on a held frame.
    cam = between(
      frame,
      at.separate,
      at.separate + 36,
      shots.wholeMachine,
      shots.pullBack,
    );

  const [camX, camY, zoom] = cam;
  const at2 = (world: { x: number; y: number }) =>
    pointAt(world, { x: camX, y: camY, zoom }, MACHINE_DEPTH);
  const sheen = interpolate(camX, [900, 1500], [0.15, 0.85], clamp);
  const focus = -70;

  // The process is named, then explained, then stopped and restarted so the
  // viewer sees for themselves what is lost and what survives.
  // The last two keyframes settle the lamps to the level scene 03 opens on.
  // Without them both parts sat lit until the cut and then dropped to scene 03's
  // resting level on the next frame, which flashed the code panel from near
  // black to grey on the one element the match cut is holding still.
  const processLit = interpolate(
    frame,
    [
      at.application - 20,
      at.application + 20,
      at.database - 30,
      at.database,
      at.restart - 20,
      at.restart + 20,
      at.separate - 34,
      at.separate,
    ],
    [0.25, 1, 1, 0.35, 0.35, 1, 1, 0.3],
    clamp,
  );
  const databaseLit = interpolate(
    frame,
    [
      at.database - 20,
      at.database + 20,
      at.restart - 30,
      at.restart,
      at.survive - 20,
      at.survive + 20,
      at.separate - 34,
      at.separate,
    ],
    [0.2, 1, 1, 0.5, 0.5, 1, 1, 0.3],
    clamp,
  );

  // The restart itself. Down hard, back a beat later, contents gone.
  const alive = interpolate(
    frame,
    [at.restart + 26, at.restart + 34, at.memory + 44, at.memory + 60],
    [1, 0, 0, 1],
    clamp,
  );
  const processFill = interpolate(
    frame,
    [
      at.code - 10,
      at.code + 40,
      at.restart + 18,
      at.memory + 22,
      at.memory + 60,
      at.memory + 96,
    ],
    [0, 1, 1, 0, 0, 1],
    clamp,
  );
  const databaseFill = interpolate(
    frame,
    [at.accounts - 16, at.accounts + 70],
    [0, 1],
    EASE_IN_OUT,
  );

  // A second machine, ghosted in only long enough to say it is an option.
  //
  // It used to leave at frame 120 of a window the scene ends 55 frames into, so
  // it never left at all: the last thing on screen was two machines, one of them
  // a blur, handing over to a scene that opens on one. It now arrives and goes
  // inside the time the sentence actually takes.
  const otherMachine = interpolate(
    frame,
    [at.separate - 8, at.separate + 16, at.separate + 32, at.separate + 46],
    [0, 1, 1, 0],
    clamp,
  );
  // "a machine" needs no label: the chassis is the only thing on screen and the
  // narration names it. Only the second reading, the program inside it, points
  // at something the viewer could otherwise miss.
  //
  // Tight explicit window rather than crossFade, whose widened tails left this
  // hanging on screen next to the following callout with a half-drawn arrow.
  const programShot = interpolate(
    frame,
    [at.program - 6, at.program + 14, at.two - 26, at.two - 12],
    [0, 1, 1, 0],
    { ...clamp, easing: EASE_IN_OUT.easing },
  );
  const processLabel = interpolate(
    frame,
    [
      at.application - 8,
      at.application + 18,
      at.database - 26,
      at.database - 8,
    ],
    [0, 1, 1, 0],
    clamp,
  );
  const databaseLabel = interpolate(
    frame,
    [at.database - 8, at.database + 18, at.restart - 24, at.restart - 8],
    [0, 1, 1, 0],
    clamp,
  );
  const memoryClearLabel = interpolate(
    frame,
    [
      at.restart - 8,
      at.restart + 18,
      at.databaseAgain - 24,
      at.databaseAgain - 8,
    ],
    [0, 1, 1, 0],
    clamp,
  );
  const storageLabel = interpolate(
    frame,
    [at.databaseAgain - 8, at.databaseAgain + 18, at.both - 18, at.both],
    [0, 1, 1, 0],
    clamp,
  );
  const sameMachineLabel = interpolate(
    frame,
    [at.both - 8, at.both + 18, at.separate - 20, at.separate - 4],
    [0, 1, 1, 0],
    clamp,
  );
  return (
    <SceneShell captions={captions} narration="scene-02">
      <Camera x={camX} y={camY} zoom={zoom}>
        <Machine
          x={MACHINE.x}
          y={MACHINE.y}
          width={MACHINE.width}
          height={MACHINE.height}
          // Scene 01 ends holding this machine on this camera, so it is
          // already here. Fading it in would blink the one continuous object.
          opacity={1}
          frame={frame}
          light={sheen}
          defocus={dof(-70, focus)}
          process={{ lit: processLit, alive, fill: processFill }}
          database={{ lit: databaseLit, alive: 1, fill: databaseFill }}
        />

        <div style={{ opacity: otherMachine }}>
          <Machine
            x={MACHINE.x - 660}
            y={MACHINE.y}
            width={MACHINE.width * 0.82}
            height={MACHINE.height * 0.62}
            opacity={0.42}
            frame={frame + 40}
            light={1 - sheen}
            defocus={dof(-220, focus)}
            depth={-220}
            process={{ lit: 0.4, alive: 1, fill: 1 }}
            database={{ lit: 0.4, alive: 1, fill: 1 }}
          />
        </div>
      </Camera>

      {/* Callouts name a part and point at it. They never restate the
          sentence the narrator is speaking, because the caption is already
          doing that and the picture is supposed to carry the rest. */}
      <Callout
        target={at2({ x: PROCESS_X, y: MACHINE.y - MACHINE.height / 2 })}
        label={{ x: 560, y: 210 }}
        progress={programShot}
        size={42}
        accent
        bow={-1}
      >
        a program running on it
      </Callout>

      <Callout
        target={at2({ x: PROCESS_X, y: MACHINE.y - MACHINE.height / 2 })}
        label={{ x: 620, y: 170 }}
        progress={processLabel}
        size={40}
        bow={-1}
      >
        application process
      </Callout>
      <Callout
        target={at2({ x: DATABASE_X, y: MACHINE.y - MACHINE.height / 2 })}
        label={{ x: 1430, y: 170 }}
        progress={databaseLabel}
        size={40}
      >
        the database
      </Callout>

      {/* The restart is shown, not narrated twice. Two words each, naming what
          the viewer is already watching happen. */}
      <Callout
        target={at2({ x: PROCESS_X, y: MACHINE.y - MACHINE.height / 2 })}
        label={{ x: 600, y: 210 }}
        progress={memoryClearLabel}
        size={40}
        accent
        bow={-1}
      >
        memory gone
      </Callout>
      <Callout
        target={at2({ x: DATABASE_X, y: MACHINE.y - MACHINE.height / 2 })}
        label={{ x: 1470, y: 210 }}
        progress={storageLabel}
        size={40}
      >
        still here
      </Callout>

      <Callout
        target={at2({ x: MACHINE.x, y: MACHINE.y - MACHINE.height / 2 })}
        label={{ x: 960, y: 172 }}
        progress={sameMachineLabel}
        size={44}
      >
        one machine, two programs
      </Callout>

      <Sfx name="settle" at={at.machine} gain={0.6} />
      <Sfx name="tick" at={at.application} gain={0.55} />
      <Sfx name="tick" at={at.database} gain={0.55} />
      <Sfx name="process" at={at.code} gain={0.7} />
      <Sfx name="dissolve" at={at.restart + 26} gain={0.85} />
      <Sfx name="appear" at={at.memory + 60} gain={0.6} />
      <Sfx name="name" at={at.persistent} gain={0.6} />
      <Sfx name="settle" at={at.separate} gain={0.4} />
    </SceneShell>
  );
};
