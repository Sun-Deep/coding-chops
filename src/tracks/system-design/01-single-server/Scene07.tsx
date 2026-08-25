import { interpolate, useCurrentFrame } from "remotion";
import type { Caption } from "@remotion/captions";
import { SceneShell } from "../../../shared/primitives/SceneShell";
import {
  EditorialCopy,
  EditorialShot,
} from "../../../shared/primitives/EditorialShot";
import { Sfx } from "../../../shared/primitives/Sfx";
import { theme } from "../../../shared/brand/theme";
import { Logo } from "../../../shared/brand/Logo";
import { Wordmark } from "../../../shared/brand/Wordmark";
import { clamp } from "../../../shared/video/timing";
import { wordFrame } from "../../../shared/video/captions";
import {
  stageBehind,
  EASE_IN_OUT,
  EASE_OUT,
  crossFade,
  deck,
  settle,
} from "../../../shared/video/motion";
import {
  Camera,
  Label,
  Packet,
  Phone,
  Wire,
  dof,
} from "../../../shared/scene/stage";
import { Machine } from "../../../shared/scene/machine";
import {
  Actions,
  Arrivals,
  Failure,
  Latency,
  Payload,
} from "./scene-07/metrics";
import captionData from "../../../../curriculum/system-design/01-single-server/audio/captions/scene-07.json";

const captions = captionData as Caption[];

const at = {
  maybe: wordFrame(captions, "maybe"),
  plenty: wordFrame(captions, "plenty"),
  machine: wordFrame(captions, "machine"),
  workload: wordFrame(captions, "workload"),
  ask: wordFrame(captions, "ask"),
  people: wordFrame(captions, "people"),
  requests: wordFrame(captions, "requests"),
  data: wordFrame(captions, "data"),
  fast: wordFrame(captions, "fast"),
  fails: wordFrame(captions, "fails"),
  diagram: wordFrame(captions, "diagram"),
  next: wordFrame(captions, "next"),
  technical: wordFrame(captions, "technical"),
  requirements: wordFrame(captions, "requirements"),
  decide: wordFrame(captions, "decide"),
  // Anchored on the adjacent word rather than on "one server", which
  // whisper has rendered as both one token and two across runs.
  oneServer: wordFrame(captions, "whether"),
  change: wordFrame(captions, "change"),
  trace: wordFrame(captions, "trace"),
  application: wordFrame(captions, "application", 3),
  database: wordFrame(captions, "database"),
  back: wordFrame(captions, "back"),
  animation: wordFrame(captions, "animation"),
  code: wordFrame(captions, "code"),
  repository: wordFrame(captions, "repository"),
  like: wordFrame(captions, "like"),
  share: wordFrame(captions, "share"),
  subscribe: wordFrame(captions, "subscribe"),
};

const MACHINE = { x: 1400, y: 560, width: 452, height: 316 };

/**
 * The close.
 *
 * The last thing the viewer sees traced is the same request that opened the
 * episode, going the whole way and back, so the model they leave with is the
 * one they were shown rather than a summary of it.
 */
const shots = {
  full: [960, 470, 0.88],
  outro: [960, 470, 0.94],
} as const;

export const SingleServerScene07: React.FC = () => {
  const frame = useCurrentFrame();
  const last = 1695;

  const cam: [number, number, number] = [
    interpolate(
      frame,
      [at.trace, at.repository],
      [shots.full[0], shots.outro[0]],
      EASE_IN_OUT,
    ),
    interpolate(
      frame,
      [at.trace, at.repository],
      [shots.full[1], shots.outro[1]],
      EASE_IN_OUT,
    ),
    interpolate(
      frame,
      [at.trace, at.repository],
      [shots.full[2], shots.outro[2]],
      EASE_IN_OUT,
    ),
  ];
  const [camX, camY, zoom] = cam;
  const sheen = interpolate(frame, [0, last], [0.2, 0.8], clamp);

  // One last full round trip, on the line that recaps it.
  const out = interpolate(
    frame,
    [at.trace, at.application],
    [0, 1],
    EASE_IN_OUT,
  );
  const back = interpolate(frame, [at.back, at.back + 34], [0, 1], EASE_IN_OUT);
  const rest = 700;
  const arrival = MACHINE.x - MACHINE.width / 2 - 46;
  const packetX =
    back > 0
      ? interpolate(back, [0, 1], [arrival, rest])
      : interpolate(out, [0, 1], [rest, arrival]);
  const returning = back > 0;

  const scene = interpolate(
    frame,
    [at.animation - 20, at.animation + 16],
    [1, 0],
    EASE_IN_OUT,
  );
  const outro = interpolate(
    frame,
    [at.like - 10, at.like + 24],
    [0, 1],
    EASE_OUT,
  );
  const photos = interpolate(
    frame,
    [at.back, at.back + 30],
    [0, 1],
    EASE_IN_OUT,
  );
  const healthy = crossFade(frame, [
    at.plenty - 10,
    at.plenty + 18,
    at.workload - 18,
    at.workload,
  ]);
  const healthyTrip = interpolate(
    frame,
    [at.plenty, at.machine],
    [rest, arrival],
    EASE_IN_OUT,
  );
  // Full-frame shots. The trace animation plays on the stage between them.
  const slides = [
    { from: at.next, to: at.trace },
    { from: at.animation, to: at.like },
  ];
  const [nextPanel, repositoryPanel] = deck(frame, slides);
  const [nextPush, repositoryPush] = settle(frame, slides);

  // The five answer cards share one slot, so they hand over the same way the
  // full-frame shots do: a card only draws once it is past halfway, which is
  // exactly when the one before it has stopped drawing.
  const answers = [
    { Card: Actions, from: at.people, to: at.requests },
    { Card: Arrivals, from: at.requests, to: at.data },
    { Card: Payload, from: at.data, to: at.fast },
    { Card: Latency, from: at.fast, to: at.fails },
    { Card: Failure, from: at.fails, to: at.diagram },
  ];
  const cards = deck(frame, answers, 16);
  const cardPush = settle(frame, answers, 46);
  const cardLeaving = (i: number) =>
    Math.max(0, Math.min(1, cardPush[i] - cards[i]));

  // Both full-frame shots replace the stage, so it dissolves out under them
  // instead of waiting behind at full strength.
  const stageCover = Math.max(nextPanel, repositoryPanel);

  return (
    <SceneShell captions={captions} narration="scene-07" fadeIn={22}>
      <div
        style={{
          // The questions and their answer cards own this stretch. At 0.16
          // the machine still collided with them, and even at 0.04 a ghost of
          // the phone and the machine read through the cards, so the stage
          // clears completely and comes back once the checklist is done.
          opacity:
            scene *
            interpolate(
              frame,
              [
                at.people - 26,
                at.people + 18,
                at.diagram + 40,
                at.diagram + 86,
              ],
              [1, 0, 0, 1],
              EASE_IN_OUT,
            ) *
            stageBehind(stageCover),
        }}
      >
        <Camera x={camX} y={camY} zoom={zoom}>
          <Wire opacity={1} defocus={dof(-34, -70)} />
          <Machine
            x={MACHINE.x}
            y={MACHINE.y}
            width={MACHINE.width}
            height={MACHINE.height}
            opacity={1}
            frame={frame}
            light={sheen}
            defocus={dof(-70, -70)}
            process={{
              lit: interpolate(
                frame,
                [
                  at.application - 12,
                  at.application + 12,
                  at.database - 10,
                  at.database,
                ],
                [0.55, 1, 1, 0.55],
                clamp,
              ),
              alive: 1,
              fill: 1,
            }}
            database={{
              lit: interpolate(
                frame,
                [at.database - 12, at.database + 12],
                [0.5, 1],
                clamp,
              ),
              alive: 1,
              fill: 1,
            }}
          />
          <Phone
            loaded={photos}
            opacity={1}
            frame={frame}
            defocus={dof(0, -70)}
            light={sheen}
          />
          <Packet
            x={packetX}
            y={560}
            scale={0.9}
            opacity={interpolate(
              frame,
              [at.trace - 20, at.trace],
              [0, 1],
              clamp,
            )}
            kind={returning ? "response" : "request"}
            defocus={dof(26, -70)}
          />
          <Packet
            x={healthyTrip}
            y={560}
            scale={0.62}
            opacity={healthy}
            kind="request"
            defocus={dof(26, -70)}
          />
        </Camera>

        <Label
          x={960}
          y={168}
          size={54}
          opacity={crossFade(frame, [
            at.maybe,
            at.maybe + 24,
            at.ask - 18,
            at.ask - 6,
          ])}
        >
          is one server enough?
        </Label>
      </div>

      {/* Five questions, each landing on the words that ask it. This is the
          checklist the episode wants the viewer to leave holding. */}
      {[
        { text: "what will people actually do?", mark: at.people },
        { text: "how many requests arrive?", mark: at.requests },
        { text: "how much data moves?", mark: at.data },
        { text: "how fast must the response be?", mark: at.fast },
        { text: "what happens when something fails?", mark: at.fails },
      ].map((question, i) => (
        <Label
          key={question.text}
          x={610}
          y={286 + i * 84}
          size={38}
          weight={600}
          opacity={crossFade(frame, [
            question.mark - 12,
            question.mark + 18,
            at.diagram + 40,
            at.diagram + 80,
          ])}
        >
          {question.text}
        </Label>
      ))}

      <div
        style={{
          position: "absolute",
          left: 1010,
          top: 258,
          width: 760,
          height: 520,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          opacity: crossFade(frame, [
            at.people - 10,
            at.people + 16,
            at.diagram - 18,
            at.diagram,
          ]),
          fontFamily: theme.fontFamily,
          color: theme.colors.ink,
        }}
      >
        {answers.map(({ Card, from }, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              opacity: Math.max(0, cards[i] * 2 - 1),
              transform: `translateY(${(1 - cardPush[i]) * 24 - cardLeaving(i) * 20}px)`,
            }}
          >
            <Card frame={frame} mark={from} />
          </div>
        ))}
      </div>

      <EditorialShot opacity={nextPanel} push={nextPush} zIndex={6}>
        <Label x={960} y={118} size={38} weight={700} opacity={nextPanel}>
          next lesson
        </Label>
        <div style={{ position: "absolute", left: 210, top: 300, width: 440 }}>
          <div
            style={{ fontSize: 29, fontWeight: 700, color: theme.colors.gray }}
          >
            rough product idea
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: 60,
              fontWeight: 800,
              letterSpacing: "-0.055em",
            }}
          >
            People upload photos.
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 750,
            top: 282,
            fontSize: 56,
            fontWeight: 700,
            color: theme.colors.blue,
          }}
        >
          →
        </div>
        <div
          style={{
            position: "absolute",
            left: 900,
            top: 245,
            width: 720,
            opacity: interpolate(
              frame,
              [at.technical - 10, at.requirements + 18],
              [0, 1],
              clamp,
            ),
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: theme.colors.blue,
              marginBottom: 22,
            }}
          >
            technical requirements
          </div>
          {[
            "request rate",
            "photo size",
            "response time",
            "failure behavior",
          ].map((item, i) => (
            <div
              key={item}
              style={{
                fontSize: 34,
                fontWeight: 700,
                padding: "12px 0",
                borderBottom: "1px solid rgba(17,18,20,0.12)",
                opacity: interpolate(
                  frame,
                  [at.technical + i * 8, at.technical + i * 8 + 16],
                  [0, 1],
                  clamp,
                ),
              }}
            >
              {item}
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: 760,
            right: 210,
            top: 700,
            display: "flex",
            justifyContent: "space-between",
            opacity: interpolate(
              frame,
              [at.decide - 10, at.decide + 16],
              [0, 1],
              clamp,
            ),
            fontSize: 36,
            fontWeight: 800,
          }}
        >
          <span
            style={{
              color:
                frame >= at.oneServer ? theme.colors.blue : theme.colors.gray,
            }}
          >
            Is one server enough?
          </span>
          <span
            style={{
              color: frame >= at.change ? theme.colors.blue : theme.colors.gray,
            }}
          >
            What changes first?
          </span>
        </div>
      </EditorialShot>

      <EditorialShot opacity={repositoryPanel} push={repositoryPush} zIndex={6}>
        <EditorialCopy top={286}>
          <div
            style={{
              fontSize: 78,
              fontWeight: 800,
              letterSpacing: "-0.06em",
              color: theme.colors.ink,
            }}
          >
            The animation is code.
          </div>
          <div
            style={{
              marginTop: 34,
              padding: "30px 34px",
              borderRadius: 18,
              background: theme.colors.blackSoft,
              color: theme.colors.white,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 26,
              lineHeight: 1.62,
            }}
          >
            <div style={{ color: "rgba(255,255,255,0.55)" }}>
              src/tracks/system-design/01-single-server/
            </div>
            {/* Every scene, because naming one file made it look like the whole
                episode was a single component. */}
            <div style={{ color: theme.colors.blueBright }}>
              Scene01 Scene02 Scene03 Scene04 Scene05 Scene05b Scene06 Scene07
            </div>
            <div style={{ color: "rgba(255,255,255,0.55)" }}>src/shared/</div>
            <div>the phone, the wire, the machine, the captions</div>
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 30,
              fontWeight: 700,
              color:
                frame >= at.repository ? theme.colors.blue : theme.colors.gray,
            }}
          >
            repository linked below
          </div>
        </EditorialCopy>
      </EditorialShot>

      {/* Dedicated outro on the warm paper canvas, per the storyboard. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: outro,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 34,
          fontFamily: theme.fontFamily,
        }}
      >
        {/* The channel lockup: prompt mark, then the name. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 26,
            opacity: interpolate(outro, [0, 0.6], [0, 1], clamp),
          }}
        >
          <Logo size={72} />
          <Wordmark size={72} />
        </div>
        <div
          style={{
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: "-0.07em",
            lineHeight: 0.94,
            color: theme.colors.ink,
            transform: `translateY(${interpolate(outro, [0, 1], [20, 0])}px)`,
          }}
        >
          One request. Full path.
        </div>
        <div
          style={{
            display: "flex",
            gap: 34,
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: "0.01em",
          }}
        >
          <span
            style={{
              color: frame >= at.like ? theme.colors.blue : theme.colors.gray,
            }}
          >
            Like
          </span>
          <span
            style={{
              color: frame >= at.share ? theme.colors.blue : theme.colors.gray,
            }}
          >
            Share
          </span>
          <span
            style={{
              color:
                frame >= at.subscribe ? theme.colors.blue : theme.colors.gray,
            }}
          >
            Subscribe
          </span>
        </div>
      </div>

      <Sfx name="send" at={at.trace} gain={0.75} />
      <Sfx name="return" at={at.trace + 80} gain={0.75} />
      <Sfx name="land" at={at.trace + 150} gain={0.7} />
      <Sfx name="name" at={at.repository + 10} gain={0.6} />
    </SceneShell>
  );
};
