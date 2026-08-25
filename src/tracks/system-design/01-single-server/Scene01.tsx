import { interpolate, useCurrentFrame } from "remotion";
import type { Caption } from "@remotion/captions";
import { SceneShell } from "../../../shared/primitives/SceneShell";
import { Sfx } from "../../../shared/primitives/Sfx";
import { theme } from "../../../shared/brand/theme";
import { clamp } from "../../../shared/video/timing";
import { wordFrame } from "../../../shared/video/captions";
import {
  EASE_IN_OUT,
  EASE_OUT,
  arrive,
  travel,
} from "../../../shared/video/motion";
import {
  Camera,
  LINE_Y,
  PHONE,
  PHONE_RIGHT,
  Packet,
  Phone,
  SERVER,
  SERVER_LEFT,
  Wire,
  Label,
  anchorTo,
  dof,
} from "../../../shared/scene/stage";
import { Machine } from "../../../shared/scene/machine";
import { Tangle } from "./scene-01/tangle";
import captionData from "../../../../curriculum/system-design/01-single-server/audio/captions/scene-01.json";

const captions = captionData as Caption[];

/**
 * Beats are anchored to the frame each word is spoken, read from the locked
 * narration. Nothing here is a hand-picked frame number, so a re-record moves
 * the picture with the voice instead of quietly desynchronising it.
 */
const at = {
  load: wordFrame(captions, "load"),
  caches: wordFrame(captions, "caches"),
  queues: wordFrame(captions, "queues"),
  microservices: wordFrame(captions, "microservices"),
  ignore: wordFrame(captions, "ignore"),
  request: wordFrame(captions, "request"),
  imagine: wordFrame(captions, "imagine"),
  opens: wordFrame(captions, "opens"),
  phone: wordFrame(captions, "phone"),
  receives: wordFrame(captions, "receives"),
  code: wordFrame(captions, "code"),
  data: wordFrame(captions, "data"),
  reply: wordFrame(captions, "reply"),
  server: wordFrame(captions, "server"),
  small: wordFrame(captions, "small"),
  needs: wordFrame(captions, "needs"),
};

const PACKET_REST = PHONE_RIGHT + 46;
const PACKET_ARRIVE = SERVER_LEFT - 46;

/** Camera framings in world pixels. */
const shots = {
  wide: [960, 540, 1],
  pushed: [960, 540, 1.5],
  onPhone: [706, 524, 1.12],
  bothWide: [960, 560, 0.98],
  onServer: [1160, 560, 1.04],
  settled: [960, 570, 0.92],
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

export const SingleServerScene01: React.FC = () => {
  const frame = useCurrentFrame();

  // The camera never cuts. It pushes into the mess, finds one packet, moves
  // left to the phone, widens for the trip, tightens on the machine, settles.
  let cam: [number, number, number];
  if (frame < at.ignore) cam = [...shots.wide];
  else if (frame < at.imagine)
    cam = between(frame, at.ignore, at.request, shots.wide, shots.pushed);
  else if (frame < at.phone)
    cam = between(
      frame,
      at.imagine,
      at.imagine + 48,
      shots.pushed,
      shots.onPhone,
    );
  else if (frame < at.receives)
    cam = between(
      frame,
      at.phone,
      at.receives - 14,
      shots.onPhone,
      shots.bothWide,
    );
  else if (frame < at.server)
    cam = between(
      frame,
      at.receives,
      at.receives + 44,
      shots.bothWide,
      shots.onServer,
    );
  else
    cam = between(
      frame,
      at.server,
      at.small + 46,
      shots.onServer,
      shots.settled,
    );

  const [camX, camY, zoom] = cam;

  const tanglePresence = interpolate(
    frame,
    [at.ignore, at.request - 26],
    [1, 0],
    EASE_IN_OUT,
  );

  const born = interpolate(
    frame,
    [at.ignore + 18, at.ignore + 44],
    [0, 1],
    EASE_OUT,
  );
  const toPhone = interpolate(
    frame,
    [at.imagine, at.imagine + 44],
    [0, 1],
    EASE_IN_OUT,
  );

  // Anticipation before the send, overshoot and settle on arrival. A packet
  // that eases linearly from A to B is the clearest sign nobody animated it.
  const outbound = travel(
    frame,
    at.phone,
    at.receives,
    PACKET_REST,
    PACKET_ARRIVE,
  );
  const inbound = travel(
    frame,
    at.reply,
    at.reply + 48,
    PACKET_ARRIVE,
    PACKET_REST,
  );
  const returning = frame >= at.reply;

  const packetX = returning
    ? inbound
    : frame >= at.phone
      ? outbound
      : interpolate(toPhone, [0, 1], [960, PACKET_REST], EASE_IN_OUT);
  // The packet rides the wire. Travelling above it was the tell that the two
  // were drawn separately rather than belonging to one system.
  const packetY = interpolate(toPhone, [0, 1], [430, LINE_Y], EASE_IN_OUT);
  const packetScale =
    arrive(frame, at.request - 14, 28, 0.4, 1) *
    interpolate(toPhone, [0, 1], [2.1, 1], EASE_IN_OUT);

  const activity = [at.code, at.data, at.reply].reduce(
    (sum, mark) =>
      sum + interpolate(frame, [mark, mark + 8, mark + 30], [0, 1, 0], clamp),
    0,
  );

  const phoneIn = interpolate(
    frame,
    [at.imagine, at.imagine + 28],
    [0, 1],
    EASE_OUT,
  );
  const serverIn = interpolate(
    frame,
    [at.phone + 16, at.phone + 56],
    [0, 1],
    EASE_OUT,
  );
  const wireIn = interpolate(
    frame,
    [at.phone - 16, at.phone + 16],
    [0, 1],
    EASE_OUT,
  );
  const photos = interpolate(
    frame,
    [at.reply + 34, at.reply + 96],
    [0, 1],
    EASE_IN_OUT,
  );

  // Where the highlight sits on every surface. Tied to camera position, so the
  // light moves because the viewpoint moved, not on a timer of its own.
  const sheen = interpolate(camX, [400, 1500], [0.12, 0.88], clamp);

  // What the camera is focused on, in layer depth. It rides back to the pile
  // for the opening, then sits on the phone and packet plane for the rest.
  const focus = interpolate(
    frame,
    [at.ignore, at.request - 20],
    [-420, 0],
    EASE_IN_OUT,
  );

  const anchor = (world: { x: number; y: number }) =>
    anchorTo(world, { x: camX, y: camY, zoom });

  // Scene 02 opens on this exact camera holding this exact machine. Everything
  // that is not the machine leaves first, so the cut has one thing to hold on
  // to rather than emptying the frame and refilling it.
  const handoff = interpolate(
    frame,
    [at.needs + 20, at.needs + 50],
    [1, 0],
    clamp,
  );
  // Scene 02 rests its lamps at 0.25 and 0.2. `activity` has decayed to zero by
  // here, so without this the panel jumps a full shade on the frame after the
  // cut, on the one object the cut is holding still.
  const handoffLit = interpolate(
    frame,
    [at.needs + 20, at.needs + 50],
    [0, 1],
    clamp,
  );

  return (
    <SceneShell captions={captions} narration="scene-01">
      <Camera x={camX} y={camY} zoom={zoom}>
        <Wire opacity={wireIn * handoff} defocus={dof(-34, focus)} />
        <Machine
          x={SERVER.x}
          y={SERVER.y}
          width={SERVER.width}
          height={SERVER.height}
          opacity={serverIn}
          frame={frame}
          light={sheen}
          defocus={dof(SERVER.depth, focus)}
          process={{
            lit: Math.max(Math.min(1, activity), handoffLit * 0.25),
            alive: 1,
            fill: 1,
          }}
          database={{
            lit: Math.max(Math.min(1, activity) * 0.7, handoffLit * 0.2),
            alive: 1,
            fill: 1,
          }}
        />
        <Phone
          loaded={photos}
          opacity={phoneIn * handoff}
          frame={frame}
          defocus={dof(PHONE.depth, focus)}
          light={sheen}
        />
        <Packet
          x={packetX}
          y={packetY}
          scale={packetScale}
          opacity={born * handoff}
          kind={returning ? "response" : "request"}
          defocus={dof(26, focus)}
        />
      </Camera>

      {/* The opening is the diagram itself, assembling faster than anyone can
          read it. No headline and no prompt over it: the narration already says
          both, and repeating a caption on screen is duplication, not emphasis. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: tanglePresence,
          background: theme.colors.paper,
          pointerEvents: "none",
        }}
      >
        <Tangle
          frame={frame}
          namedAt={[at.load, at.caches, at.queues, at.microservices]}
          hold={6}
        />
      </div>

      {/* Labels live in screen space, not in the world.
          Anchoring them to the object inside a moving camera pushed them off
          frame and into the caption band as the camera pushed in. Projecting
          them out and clamping to a safe band keeps them legible at any zoom. */}
      <Label
        {...anchor({ x: packetX, y: packetY - 120 })}
        size={48}
        accent
        opacity={interpolate(
          frame,
          [at.request, at.request + 14, at.imagine, at.imagine + 20],
          [0, 1, 1, 0],
          clamp,
        )}
      >
        one request
      </Label>
      <Label
        {...anchor({ x: PHONE.x, y: PHONE.y - PHONE.height / 2 - 64 })}
        size={40}
        opacity={
          handoff *
          interpolate(frame, [at.opens, at.opens + 20], [0, 1], EASE_OUT)
        }
      >
        your photo app
      </Label>
      <Label
        {...anchor({ x: SERVER.x, y: SERVER.y + SERVER.height / 2 + 62 })}
        size={56}
        opacity={
          handoff *
          interpolate(frame, [at.server, at.server + 20], [0, 1], EASE_OUT)
        }
      >
        Server
      </Label>

      {[at.load, at.caches, at.queues, at.microservices].map((mark) => (
        <Sfx key={mark} name="tick" at={mark} gain={0.5} />
      ))}
      <Sfx name="dissolve" at={at.ignore} gain={0.9} />
      <Sfx name="appear" at={at.request - 14} gain={0.85} />
      <Sfx name="settle" at={at.imagine} gain={0.7} />
      <Sfx name="settle" at={at.phone + 16} gain={0.45} />
      <Sfx name="send" at={at.phone} gain={0.9} />
      <Sfx name="land" at={at.receives} gain={0.8} />
      <Sfx name="process" at={at.code} gain={0.8} />
      <Sfx name="process" at={at.data} gain={0.8} />
      <Sfx name="return" at={at.reply} gain={0.9} />
      {[36, 48, 60].map((offset) => (
        <Sfx key={offset} name="fill" at={at.reply + offset} gain={0.9} />
      ))}
      <Sfx name="name" at={at.server} gain={0.7} />
    </SceneShell>
  );
};
