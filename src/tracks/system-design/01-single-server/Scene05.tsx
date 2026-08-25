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
  EASE_IN_OUT,
  window as beat,
  crossFade,
  settle,
  stageBehind,
} from "../../../shared/video/motion";
import {
  Camera,
  Label,
  LINE_Y,
  PHONE_RIGHT,
  Packet,
  Phone,
  Wire,
  dof,
  pointAt,
} from "../../../shared/scene/stage";
import { Machine } from "../../../shared/scene/machine";

/** Objects live on the machine layer, so screen anchors project against it. */
const MACHINE_DEPTH = -70;
import { Meter } from "../../../shared/scene/meters";
import captionData from "../../../../curriculum/system-design/01-single-server/audio/captions/scene-05.json";

const captions = captionData as Caption[];

const at = {
  more: wordFrame(captions, "more"),
  line: wordFrame(captions, "line"),
  grows: wordFrame(captions, "grows"),
  timeout: wordFrame(captions, "timeout"),
  error: wordFrame(captions, "error"),
  cpu: wordFrame(captions, "cpu"),
  database: wordFrame(captions, "database"),
  memory: wordFrame(captions, "memory"),
  kill: wordFrame(captions, "kill"),
  restarts: wordFrame(captions, "restarts"),
  disappears: wordFrame(captions, "disappears"),
  remains: wordFrame(captions, "remains"),
  workload: wordFrame(captions, "workload"),
  code: wordFrame(captions, "code"),
  carrying: wordFrame(captions, "carrying"),
  bugs: wordFrame(captions, "bugs"),
  hardware: wordFrame(captions, "hardware"),
  power: wordFrame(captions, "power"),
  dependencies: wordFrame(captions, "dependencies"),
  resource: wordFrame(captions, "resource"),
  outage: wordFrame(captions, "outage"),
  crash: wordFrame(captions, "crash"),
};

/**
 * Matches the shared SERVER position exactly.
 *
 * At x 1320, y 520 the wire ended eighty pixels inside the chassis and crossed
 * it above centre, because the wire is drawn from the shared constants. Sharing
 * the position puts it on the left edge at the machine's vertical middle.
 */
const MACHINE = { x: 1400, y: 560, width: 452, height: 316 };
const QUEUE_X = MACHINE.x - MACHINE.width / 2 - 40;

const shots = {
  arriving: [960, 520, 0.92],
  queueGrowing: [960, 520, 0.92],
  /** The phone has gone by the causes beat, so the machine takes the centre
   *  rather than sitting far right with an empty half frame beside it. */
  onCauses: [MACHINE.x, MACHINE.y - 30, 0.95],
  onMachine: [MACHINE.x, MACHINE.y - 90, 1.28],
  wide: [1000, 442, 0.86],
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

export const SingleServerScene05: React.FC = () => {
  const frame = useCurrentFrame();

  let cam: [number, number, number];
  if (frame < at.line) cam = [...shots.arriving];
  else if (frame < at.workload)
    cam = between(
      frame,
      at.line,
      at.grows + 60,
      shots.arriving,
      shots.queueGrowing,
    );
  else if (frame < at.memory)
    cam = between(
      frame,
      at.workload,
      at.workload + 60,
      shots.queueGrowing,
      shots.onCauses,
    );
  else if (frame < at.bugs)
    cam = between(
      frame,
      at.memory,
      at.memory + 70,
      shots.queueGrowing,
      shots.onMachine,
    );
  else cam = between(frame, at.bugs, at.bugs + 80, shots.onMachine, shots.wide);

  const [camX, camY, zoom] = cam;
  const sheen = interpolate(camX, [800, 1400], [0.2, 0.8], clamp);

  // The line only exists once work arrives faster than it leaves.
  const depth = interpolate(
    frame,
    [at.line - 40, at.line, at.grows, at.grows + 120, at.kill, at.kill + 40],
    [0, 1.5, 3, 5, 5, 0],
    clamp,
  );
  // Requests that waited past their limit. They are abandoned, not deleted.
  const expired = interpolate(
    frame,
    [at.timeout, at.timeout + 90],
    [0, 4],
    clamp,
  );

  // The process is killed to recover memory. Its contents go with it. The
  // database and its storage are untouched, which is the whole distinction.
  const alive = interpolate(
    frame,
    [at.kill + 20, at.kill + 28, at.restarts - 10, at.restarts + 24],
    [1, 0, 0, 1],
    clamp,
  );
  const processFill = interpolate(
    frame,
    [at.kill + 20, at.kill + 28, at.restarts - 10, at.restarts + 34],
    [1, 0, 0, 1],
    clamp,
  );
  const load = interpolate(frame, [at.line, at.grows + 120], [0.4, 1], clamp);

  /**
   * Which resource ran out. The narration names three candidates and the
   * viewer needs to see that they are different failures, not one blur.
   */
  const causes = crossFade(frame, [
    at.workload,
    at.workload + 24,
    at.memory - 30,
    at.memory,
  ]);
  const cause = (mark: number, until: number) => beat(frame, mark, until);
  const healthyFlow = crossFade(frame, [
    at.more - 10,
    at.more + 16,
    at.line - 20,
    at.line,
  ]);
  const queueShot = crossFade(frame, [
    at.line - 8,
    at.line + 18,
    at.timeout - 20,
    at.timeout - 6,
  ]);
  const timeoutCard =
    frame < at.workload - 16
      ? interpolate(frame, [at.timeout - 12, at.timeout - 4], [0, 1], clamp)
      : 0;
  const timeoutVisible = frame >= at.timeout - 12 && frame < at.workload - 16;
  const failureStrip = crossFade(frame, [
    at.bugs - 20,
    at.bugs + 14,
    at.resource - 24,
    at.resource,
  ]);
  const conclusion = interpolate(
    frame,
    [at.resource - 12, at.resource + 18],
    [0, 1],
    EASE_IN_OUT,
  );

  const requestStart = PHONE_RIGHT + 46;
  const requestEnd = QUEUE_X - 26;
  /**
   * The queue is drawn in screen space, so it has to be told where the machine
   * ended up. Hard-coding its position meant moving the machine left the line
   * of waiting requests stopping short of the thing they are waiting for.
   */
  const machineEdge = pointAt(
    { x: MACHINE.x - MACHINE.width / 2, y: LINE_Y },
    { x: camX, y: camY, zoom },
    MACHINE_DEPTH,
  );

  const phonePresence = crossFade(frame, [
    at.more - 10,
    at.more + 10,
    at.workload - 20,
    at.workload,
  ]);

  return (
    <SceneShell captions={captions} narration="scene-05" fadeIn={22}>
      <Camera x={camX} y={camY} zoom={zoom} opacity={stageBehind(conclusion)}>
        {/* The wire belongs to the phone. Left on its own after the phone
            leaves, it was a line running out of empty paper into the machine. */}
        <Wire opacity={phonePresence} defocus={dof(-34, -70)} />
        <Phone
          loaded={interpolate(frame, [at.more, at.line - 10], [0.08, 1], clamp)}
          opacity={phonePresence}
          frame={frame}
          defocus={dof(0, -70)}
          light={sheen}
        />
        <Machine
          x={MACHINE.x}
          y={MACHINE.y}
          width={MACHINE.width}
          height={MACHINE.height}
          opacity={1}
          frame={frame}
          light={sheen}
          defocus={dof(-70, -70)}
          process={{ lit: load * alive, alive, fill: processFill }}
          database={{ lit: 0.55, alive: 1, fill: 1 }}
        />
        {Array.from({ length: 4 }, (_, i) => {
          const span = Math.max(1, at.line - at.more);
          const phase = (((frame - at.more + i * 72) % span) + span) % span;
          const progress = phase / span;
          return (
            <Packet
              key={i}
              x={interpolate(progress, [0, 1], [requestStart, requestEnd])}
              y={LINE_Y}
              scale={0.58}
              opacity={
                healthyFlow *
                interpolate(progress, [0, 0.12, 0.88, 1], [0, 1, 1, 0], clamp)
              }
              kind="request"
              defocus={0}
            />
          );
        })}
      </Camera>

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: timeoutVisible ? 1 : 0,
          background: theme.colors.paper,
          zIndex: 7,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: queueShot,
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: 5 }, (_, i) => {
          const present = interpolate(depth - i, [0, 1], [0, 1], clamp);
          const gone = interpolate(expired - (4 - i), [0, 1], [0, 1], clamp);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: machineEdge.x - 58 - i * 70,
                // Centred on the shared wire, which is the line they are queued on.
                top: machineEdge.y - 21,
                width: 58,
                height: 42,
                opacity: present * (1 - gone * 0.82),
                borderRadius: 10,
                background:
                  gone > 0.5 ? "rgba(17,18,20,0.14)" : theme.colors.blue,
                boxShadow:
                  gone > 0.5 ? "none" : "0 7px 18px rgba(23,105,224,0.22)",
                padding: "9px 10px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                transform: `translateY(${interpolate(present, [0, 1], [8, 0], clamp)}px)`,
              }}
            >
              {[1, 0.66, 0.4].map((width) => (
                <div
                  key={width}
                  style={{
                    width: `${width * 100}%`,
                    height: 4,
                    borderRadius: 2,
                    background:
                      gone > 0.5
                        ? "rgba(17,18,20,0.2)"
                        : "rgba(255,255,255,0.72)",
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Resource meters live in screen space so camera moves cannot drag them
          through the phone or machine. */}
      {[
        { label: "CPU", x: 480, level: 0.94, from: at.code, to: at.database },
        {
          label: "storage I/O",
          x: 960,
          level: 0.88,
          from: at.database,
          to: at.carrying,
        },
        {
          label: "network",
          x: 1440,
          level: 0.91,
          from: at.carrying,
          to: at.memory,
        },
      ].map((meter) => (
        <Meter
          key={meter.label}
          label={meter.label}
          x={meter.x}
          y={780}
          width={360}
          level={causes * meter.level}
          active={cause(meter.from, meter.to)}
          reveal={causes}
          limit={0.96}
        />
      ))}

      <Label x={960} y={156} size={40} accent opacity={queueShot}>
        requests waiting in line
      </Label>

      <div
        style={{
          position: "absolute",
          left: 430,
          top: 126,
          width: 500,
          opacity: crossFade(frame, [
            at.kill,
            at.kill + 34,
            at.bugs - 28,
            at.bugs,
          ]),
          fontFamily: theme.fontFamily,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 800 }}>application process</div>
        <div
          style={{
            marginTop: 10,
            fontSize: 27,
            fontWeight: 700,
            color: frame < at.restarts ? theme.colors.gray : theme.colors.blue,
          }}
        >
          {frame < at.restarts ? "stopped, memory cleared" : "restarting"}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 1060,
          top: 126,
          width: 430,
          opacity: crossFade(frame, [
            at.remains,
            at.remains + 34,
            at.bugs - 28,
            at.bugs,
          ]),
          fontFamily: theme.fontFamily,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 800 }}>stored data</div>
        <div
          style={{
            marginTop: 10,
            fontSize: 27,
            fontWeight: 800,
            color: theme.colors.blue,
          }}
        >
          still here
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: timeoutCard,
          transform: `translateY(${interpolate(timeoutCard, [0, 1], [12, 0], clamp)}px)`,
          fontFamily: theme.fontFamily,
          background: "transparent",
          zIndex: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontSize: 34,
            fontWeight: 700,
            color: theme.colors.gray,
            marginBottom: 12,
          }}
        >
          the client stops waiting
        </div>
        <div
          style={{
            fontSize: 78,
            fontWeight: 800,
            letterSpacing: "-0.055em",
            color: theme.colors.ink,
          }}
        >
          Request timed out
        </div>
        <div
          style={{
            marginTop: 14,
            width: interpolate(frame, [at.timeout, at.error], [0, 560], clamp),
            height: 7,
            borderRadius: 4,
            background: theme.colors.blue,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 230,
          right: 230,
          top: 150,
          opacity: failureStrip,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: theme.fontFamily,
        }}
      >
        {[
          {
            label: "bug in code",
            symbol: "{ }",
            mark: at.bugs,
            next: at.hardware,
          },
          {
            label: "hardware failure",
            symbol: "chip",
            mark: at.hardware,
            next: at.power,
          },
          {
            label: "power loss",
            symbol: "power",
            mark: at.power,
            next: at.dependencies,
          },
          {
            label: "failed dependency",
            symbol: "link",
            mark: at.dependencies,
            next: at.resource,
          },
        ].map((item) => {
          const active = 0.25 + beat(frame, item.mark, item.next, 14) * 0.75;
          return (
            <div
              key={item.label}
              style={{ width: 310, textAlign: "center", opacity: active }}
            >
              <div
                style={{
                  width: 86,
                  height: 62,
                  margin: "0 auto 14px",
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    active > 0.6 ? theme.colors.blue : "rgba(17,18,20,0.08)",
                  color: active > 0.6 ? theme.colors.white : theme.colors.gray,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                {item.symbol}
              </div>
              <div
                style={{
                  fontSize: 27,
                  fontWeight: 700,
                  color: theme.colors.ink,
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      <EditorialShot
        opacity={conclusion}
        push={settle(frame, [{ from: at.resource - 12, to: at.resource }])[0]}
        zIndex={10}
      >
        <EditorialCopy top={392}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: "-0.055em",
              color: theme.colors.ink,
            }}
          >
            resource limit{" "}
            <span style={{ color: theme.colors.blue }}>→ one outage cause</span>
          </div>
          <div
            style={{
              marginTop: 30,
              fontSize: 46,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: theme.colors.gray,
            }}
          >
            resource limit ≠ the definition of a crash
          </div>
        </EditorialCopy>
      </EditorialShot>

      <Sfx name="send" at={at.line - 40} gain={0.6} />
      <Sfx name="tick" at={at.grows} gain={0.5} />
      <Sfx name="dissolve" at={at.timeout} gain={0.7} />
      <Sfx name="dissolve" at={at.kill + 20} gain={0.95} />
      <Sfx name="appear" at={at.remains + 110} gain={0.6} />
      <Sfx name="name" at={at.outage} gain={0.6} />
      <Sfx name="appear" at={at.restarts} gain={0.6} />
      <Sfx name="name" at={at.resource} gain={0.6} />
    </SceneShell>
  );
};
