import { interpolate } from "remotion";
import { theme } from "../brand/theme";
import { clamp } from "../video/timing";
import { Contact, INK, Layer, Sheen, idle } from "./stage";

/**
 * The machine, and the two different things inside it.
 *
 * The first version drew the process and the database as the same rounded
 * rectangle with slightly different grey lines inside. They are not the same
 * kind of thing, and a viewer cannot be asked to tell them apart by squinting
 * at line spacing.
 *
 * They are now distinct in shape, in value, and in content:
 *
 *   process   a dark code surface, because that is what running code looks
 *             like on every machine anyone has ever used
 *   database  a cylinder, because it is the one shape in this field that
 *             every reader already knows on sight
 *
 * The chassis around them stays neutral paper. It is the physical box; the two
 * things inside it are the lesson.
 */
export type Unit = {
  /** Brightens while this part is the subject or is doing work. */
  lit: number;
  /** 0 means the program is not running. Its contents go with it. */
  alive: number;
  /** How much of its contents have arrived, 0 to 1. */
  fill: number;
  /** 0 removes the part entirely. The other one widens to take the space,
   *  which is what happens when the database moves to its own machine. */
  present?: number;
};

/** Where each part sits inside the chassis, as a fraction of its width. */
export const PROCESS_FRACTION = 0.6;

/**
 * How far the machine's side face stands out past the front face, in world
 * units. Anything bracketing or measuring the machine has to include it, or it
 * lands short of the object's visible right edge.
 */
export const MACHINE_EDGE = 16;
/** The side face starts this far back inside the front face. */
const EDGE_INSET = 14;

const Lamps: React.FC<{ frame: number; alive: number }> = ({
  frame,
  alive,
}) => (
  <div style={{ display: "flex", gap: 6 }}>
    {[
      { hue: "#4CA46A", period: 23, offset: 0 },
      { hue: "#D9A441", period: 11, offset: 5 },
      { hue: theme.colors.blue, period: 7, offset: 3 },
    ].map((lamp) => {
      const beat = (frame + lamp.offset) % lamp.period;
      const on = beat < lamp.period * 0.45 ? 1 : 0.22;
      return (
        <div
          key={lamp.hue}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: lamp.hue,
            opacity: alive * (0.32 + on * 0.62),
            boxShadow: `0 0 ${6 * on * alive}px ${lamp.hue}`,
          }}
        />
      );
    })}
  </div>
);

/** A code surface. Dark, monospaced rhythm, a cursor that keeps moving. */
const Process: React.FC<{
  frame: number;
  unit: Unit;
  width: number;
  height: number;
}> = ({ frame, unit, width, height }) => {
  const rows = 6;
  const active = Math.floor(frame / 15) % rows;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 14,
        background: `linear-gradient(158deg, #1B1F26 0%, ${theme.colors.blackSoft} 62%, #0A0C0F 100%)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 6px 18px rgba(${INK},0.22)`,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        justifyContent: "center",
        overflow: "hidden",
        opacity: (unit.present ?? 1) * (0.55 + unit.lit * 0.45),
      }}
    >
      {Array.from({ length: rows }, (_, i) => {
        const widths = [0.68, 0.42, 0.82, 0.55, 0.74, 0.36];
        const indent = [0, 1, 1, 2, 1, 0][i];
        const shown = Math.min(1, Math.max(0, unit.fill * rows - i + 1));
        const isActive = i === active;
        return (
          <div
            key={i}
            style={{ display: "flex", gap: 7, paddingLeft: indent * 16 }}
          >
            <div
              style={{
                width: `${widths[i] * 100 * shown}%`,
                height: 7,
                borderRadius: 4,
                opacity: unit.alive * (isActive ? 1 : 0.42),
                background: isActive ? theme.colors.blueBright : "#B7BCC6",
              }}
            />
            {isActive ? (
              <div
                style={{
                  width: 8,
                  height: 14,
                  marginTop: -3,
                  borderRadius: 2,
                  background: theme.colors.blueBright,
                  opacity: unit.alive * (Math.floor(frame / 9) % 2 ? 0.35 : 1),
                }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

/** A cylinder. The one shape in this field a reader already knows on sight. */
const Database: React.FC<{ unit: Unit; width: number; height: number }> = ({
  unit,
  width,
  height,
}) => {
  const cap = width * 0.3;
  const bands = 3;

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        opacity: (unit.present ?? 1) * (0.55 + unit.lit * 0.45),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: cap / 2,
          width,
          height: height - cap,
          background: `linear-gradient(90deg, #C2BDAF 0%, #FBF9F4 24%, #E7E3D8 68%, #B8B3A5 100%)`,
          boxShadow: `inset 0 0 0 1px rgba(${INK},0.1)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: height - cap,
          width,
          height: cap,
          borderRadius: "50%",
          background: `linear-gradient(90deg, #B4AF9F 0%, #EDE9DE 30%, #C7C2B4 100%)`,
        }}
      />
      {Array.from({ length: bands }, (_, i) => {
        const arrived = interpolate(
          unit.fill * bands - i,
          [0, 1],
          [0, 1],
          clamp,
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: cap / 2 + (i + 1) * ((height - cap * 1.5) / (bands + 1)),
              width,
              height: cap * 0.62,
              borderRadius: "50%",
              border: `2px solid rgba(${INK},${0.1 + arrived * 0.16})`,
              borderTopColor: `rgba(${INK},${0.12 + arrived * 0.26})`,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width,
          height: cap,
          borderRadius: "50%",
          background: `linear-gradient(150deg, #FFFFFF 0%, ${theme.colors.paperBright} 52%, #DAD5C8 100%)`,
          boxShadow: `inset 0 0 0 1px rgba(${INK},0.12), 0 3px 8px rgba(${INK},0.08)`,
        }}
      />
    </div>
  );
};

export const Machine: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  process: Unit;
  database: Unit;
  frame: number;
  light: number;
  defocus: number;
  depth?: number;
}> = ({
  x,
  y,
  width,
  height,
  opacity,
  process,
  database,
  frame,
  light,
  defocus,
  depth = -70,
}) => {
  const left = x - width / 2;
  const top = y - height / 2 + idle(frame, 2.3, 1.3);
  const inner = width - 44;
  const pShare = (process.present ?? 1) * PROCESS_FRACTION;
  const dShare = (database.present ?? 1) * (1 - PROCESS_FRACTION);
  const total = Math.max(pShare + dShare, 0.0001);
  const gap = 18 * Math.min(pShare, dShare) * 4;
  const processWidth = Math.max(0, (inner - gap) * (pShare / total));
  const dbWidth = Math.max(0, (inner - gap) * (dShare / total));

  return (
    <Layer depth={depth} defocus={defocus}>
      <Contact
        x={x + 12}
        y={top + height + 8}
        width={width * 1.1}
        opacity={opacity}
      />

      <div
        style={{
          position: "absolute",
          left: left + width - EDGE_INSET,
          top: top + 12,
          width: EDGE_INSET + MACHINE_EDGE,
          height: height - 22,
          opacity,
          borderRadius: "0 22px 22px 0",
          background: "linear-gradient(90deg, #E2DFD5 0%, #CFCCC1 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left,
          top,
          width,
          height,
          opacity,
          borderRadius: 26,
          background: `linear-gradient(150deg, #FFFFFF 0%, ${theme.colors.paperBright} 42%, #E9E6DD 100%)`,
          boxShadow: `0 32px 64px rgba(${INK},0.11), 0 2px 6px rgba(${INK},0.06), inset 0 1px 0 rgba(255,255,255,0.95)`,
          overflow: "hidden",
          padding: 22,
          display: "flex",
          alignItems: "center",
          gap,
        }}
      >
        <Sheen light={light} radius={26} />
        <Process
          frame={frame}
          unit={process}
          width={processWidth}
          height={height - 76}
        />
        <Database unit={database} width={dbWidth} height={height - 84} />

        {/* Lamps belong to the chassis. They are the machine's state, not a
            property of either program. */}
        <div style={{ position: "absolute", left: 24, bottom: 14 }}>
          <Lamps frame={frame} alive={1} />
        </div>
      </div>
    </Layer>
  );
};
