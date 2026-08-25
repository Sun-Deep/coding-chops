import { interpolate, useCurrentFrame } from "remotion";
import type { Caption } from "@remotion/captions";
import { SceneShell } from "../../../shared/primitives/SceneShell";
import { Sfx } from "../../../shared/primitives/Sfx";
import { theme } from "../../../shared/brand/theme";
import { clamp } from "../../../shared/video/timing";
import { wordFrame } from "../../../shared/video/captions";
import { EASE_OUT } from "../../../shared/video/motion";
import { Camera, Label, dof, pointAt } from "../../../shared/scene/stage";
import { MACHINE_EDGE, Machine } from "../../../shared/scene/machine";

/** Objects live on the machine layer, so screen anchors project against it. */
const MACHINE_DEPTH = -70;
import captionData from "../../../../curriculum/system-design/01-single-server/audio/captions/scene-05b.json";

const captions = captionData as Caption[];

/**
 * The affiliate segment.
 *
 * Rules for this shot come from docs/affiliate-and-sponsor-standard.md, not
 * from taste. The disclosure holds for the entire segment because a spoken
 * disclosure alone does not reach a muted viewer. No logo: the standard says
 * set the company name in type like any other word, and never show a product
 * dashboard, which would date the video within a year.
 *
 * The machine is the same object from the surrounding scenes. A Droplet is one
 * virtual machine running the application process and the database side by
 * side, so the hero object carries straight through the break.
 */
const at = {
  disclosure: wordFrame(captions, "disclosure"),
  link: wordFrame(captions, "link"),
  sign: wordFrame(captions, "sign"),
  commission: wordFrame(captions, "commission"),
  nothing: wordFrame(captions, "nothing"),
  nobody: wordFrame(captions, "nobody"),
  paid: wordFrame(captions, "paid"),
  script: wordFrame(captions, "script"),
  droplet: wordFrame(captions, "droplet"),
  virtual: wordFrame(captions, "virtual"),
  rented: wordFrame(captions, "rented"),
  application: wordFrame(captions, "application"),
  database: wordFrame(captions, "database"),
  side: wordFrame(captions, "side-by-side"),
  setup: wordFrame(captions, "setup"),
  matters: wordFrame(captions, "matters"),
};

const MACHINE = { x: 1360, y: 570, width: 452, height: 316 };
const CAMERA = { x: 1120, y: 500, zoom: 1.04 };
/** Title, gap, bracket arms, gap, subtitle. Used to sit the block above the machine. */
const BRACKET_HEIGHT = 114;

export const SingleServerScene05b: React.FC = () => {
  const frame = useCurrentFrame();

  const machineTop = MACHINE.y - MACHINE.height / 2;
  const machineLeft = pointAt(
    { x: MACHINE.x - MACHINE.width / 2, y: machineTop },
    CAMERA,
    MACHINE_DEPTH,
  );
  // The side face stands out past the front, so the right arm has to reach it.
  const machineRight = pointAt(
    { x: MACHINE.x + MACHINE.width / 2 + MACHINE_EDGE, y: machineTop },
    CAMERA,
    MACHINE_DEPTH,
  );

  const relationship = interpolate(
    frame,
    [at.disclosure - 6, at.disclosure + 20, at.nobody - 18, at.nobody],
    [0, 1, 1, 0],
    clamp,
  );
  const independence = interpolate(
    frame,
    [at.nobody - 10, at.nobody + 18, at.droplet - 16, at.droplet],
    [0, 1, 1, 0],
    clamp,
  );
  const dropletIn = interpolate(
    frame,
    [at.droplet - 12, at.droplet + 24],
    [0, 1],
    EASE_OUT,
  );
  const handoff = interpolate(
    frame,
    [at.matters - 12, at.matters + 24],
    [0, 1],
    EASE_OUT,
  );
  const machinePair = interpolate(
    frame,
    [at.application - 10, at.application + 20, at.matters - 20, at.matters],
    [0, 1, 1, 0],
    clamp,
  );

  return (
    <SceneShell captions={captions} narration="scene-05b" fadeIn={22}>
      <Camera x={CAMERA.x} y={CAMERA.y} zoom={CAMERA.zoom}>
        <Machine
          x={MACHINE.x}
          y={MACHINE.y}
          width={MACHINE.width}
          height={MACHINE.height}
          opacity={1}
          frame={frame}
          light={0.52}
          defocus={dof(-70, -70)}
          process={{
            // The last pair of keyframes settles the lamp to the level scene 06
            // opens on. It carries this machine over on the same framing, so a
            // shade change here shows up as a flash on the one held object.
            lit: interpolate(
              frame,
              [
                at.application - 10,
                at.application + 14,
                at.side + 30,
                at.side + 60,
              ],
              [0.35, 1, 1, 0.85],
              clamp,
            ),
            alive: 1,
            fill: 1,
          }}
          database={{
            lit: interpolate(
              frame,
              [at.database - 10, at.database + 14, at.side + 30, at.side + 60],
              [0.35, 1, 1, 0.7],
              clamp,
            ),
            alive: 1,
            fill: 1,
          }}
        />
      </Camera>

      <div
        style={{
          position: "absolute",
          left: 170,
          top: 210,
          width: 850,
          opacity: relationship,
          fontFamily: theme.fontFamily,
          color: theme.colors.ink,
        }}
      >
        <div
          style={{ fontSize: 68, fontWeight: 800, letterSpacing: "-0.06em" }}
        >
          Affiliate link
        </div>
        <div
          style={{
            marginTop: 34,
            display: "grid",
            gridTemplateColumns: "180px 34px 250px 34px 260px",
            alignItems: "center",
            fontSize: 28,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              color: frame >= at.sign ? theme.colors.blue : theme.colors.gray,
            }}
          >
            you sign up
          </span>
          <span style={{ textAlign: "center" }}>→</span>
          <span style={{ textAlign: "center" }}>DigitalOcean</span>
          <span style={{ textAlign: "center" }}>→</span>
          <span
            style={{
              color:
                frame >= at.commission ? theme.colors.blue : theme.colors.gray,
            }}
          >
            I earn commission
          </span>
        </div>
        <div
          style={{
            marginTop: 38,
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: "-0.045em",
            color: frame >= at.nothing ? theme.colors.blue : theme.colors.gray,
          }}
        >
          extra cost to you: 0
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 170,
          top: 255,
          width: 700,
          opacity: independence,
          fontFamily: theme.fontFamily,
          color: theme.colors.ink,
        }}
      >
        <div
          style={{
            fontSize: 58,
            fontWeight: 800,
            letterSpacing: "-0.055em",
            marginBottom: 32,
          }}
        >
          The lesson stayed independent.
        </div>
        <div
          style={{
            fontSize: 34,
            fontWeight: 700,
            marginBottom: 22,
            color: frame >= at.paid ? theme.colors.blue : theme.colors.gray,
          }}
        >
          paid for this video: no
        </div>
        <div
          style={{
            fontSize: 34,
            fontWeight: 700,
            color: frame >= at.script ? theme.colors.blue : theme.colors.gray,
          }}
        >
          read or approved the script: no
        </div>
      </div>

      <div style={{ opacity: dropletIn * (1 - handoff) }}>
        <Label x={500} y={234} opacity={dropletIn} size={42} weight={600}>
          DigitalOcean
        </Label>
        <Label
          x={500}
          y={286}
          opacity={dropletIn}
          size={94}
          weight={800}
          accent
        >
          Droplet
        </Label>
        <Label
          x={500}
          y={404}
          opacity={interpolate(
            frame,
            [at.virtual - 10, at.rented + 20],
            [0, 1],
            clamp,
          )}
          size={32}
          weight={600}
        >
          one virtual machine, rented by the hour
        </Label>
      </div>

      {/*
        Spans the machine's projected edges rather than a guessed pixel range.

        Hard-coded at left 1068 by width 510 it covered 1068 to 1578, while the
        machine actually lands on 974 to 1424, so both arms hung off the right
        of the thing they were bracketing.
      */}
      <div
        style={{
          position: "absolute",
          left: machineLeft.x,
          top: machineLeft.y - BRACKET_HEIGHT - 18,
          width: machineRight.x - machineLeft.x,
          opacity: machinePair,
          fontFamily: theme.fontFamily,
          color: theme.colors.ink,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 800, whiteSpace: "nowrap" }}>
          application process + database
        </div>
        <div
          style={{
            marginTop: 12,
            height: 34,
            borderTop: `2px solid ${theme.colors.blue}`,
            borderLeft: `2px solid ${theme.colors.blue}`,
            borderRight: `2px solid ${theme.colors.blue}`,
          }}
        />
        <div
          style={{
            marginTop: 2,
            fontSize: 25,
            fontWeight: 700,
            color: theme.colors.gray,
          }}
        >
          side by side on one machine
        </div>
      </div>

      <Label x={520} y={300} opacity={handoff} size={64} weight={800} accent>
        Next: scale this machine.
      </Label>

      {/*
        Holds for the whole segment, top left, well clear of the caption band.
        This is the scoped exception in section 3 of the standard and the only
        persistent on-screen text in the episode.
      */}
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 60,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 18,
          letterSpacing: "0.06em",
          color: theme.colors.gray,
        }}
      >
        AFFILIATE LINK · I EARN A COMMISSION
      </div>

      <Sfx name="settle" at={at.disclosure} gain={0.5} />
      <Sfx name="appear" at={at.link} gain={0.6} />
      <Sfx name="name" at={at.droplet} gain={0.6} />
      <Sfx name="name" at={at.matters} gain={0.5} />
    </SceneShell>
  );
};
