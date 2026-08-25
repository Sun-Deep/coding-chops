import type { ReactNode } from "react";
import { interpolate } from "remotion";
import { theme } from "../brand/theme";
import { clamp } from "../video/timing";

/**
 * The episode's objects, built as flat layers in a space with real perspective.
 *
 * Not 3D. Each object is a face plus a visible edge, sitting at its own depth,
 * so the camera produces genuine parallax without any of the look-development
 * cost of a lit 3D scene. Depth comes from layering, edges, and shadow.
 *
 * World units are pixels against a 1920 by 1080 frame, which is far easier to
 * reason about than abstract units when placing type next to an object.
 */
export const WORLD = { width: 1920, height: 1080 };

export const PHONE = { x: 520, y: 560, width: 288, height: 574, depth: 0 };
export const SERVER = { x: 1400, y: 560, width: 452, height: 316, depth: -70 };
/** Shared height of the wire and everything that travels along it. */
export const LINE_Y = 560;

export const PHONE_RIGHT = PHONE.x + PHONE.width / 2;
export const SERVER_LEFT = SERVER.x - SERVER.width / 2;

export const INK = "17,18,20";
const TILES = 18;

/**
 * Photograph stand-ins. Muted and desaturated on purpose, so they read as
 * content without competing with cobalt, which stays the only meaningful
 * accent in the frame.
 */
export const PHOTO_TONES = [
  ["#CEC4B3", "#A2937C"],
  ["#B8C0BC", "#8C9995"],
  ["#D0C1B8", "#A8938A"],
  ["#BAC1CB", "#909DAC"],
  ["#C9C5B6", "#A19E8B"],
  ["#D2C6BF", "#AC9B94"],
];

/**
 * Specular highlight sweeping across a surface as the camera moves past it.
 *
 * Static gradients are the reason flat objects read as illustration. A material
 * catches light differently from different angles, and tying the highlight to
 * camera position is what makes the surface feel like a surface.
 */
export const Sheen: React.FC<{ light: number; radius: number }> = ({
  light,
  radius,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: radius,
      pointerEvents: "none",
      background: `linear-gradient(104deg, rgba(255,255,255,0) ${light * 100 - 22}%, rgba(255,255,255,0.62) ${light * 100}%, rgba(255,255,255,0) ${light * 100 + 24}%)`,
      mixBlendMode: "soft-light",
    }}
  />
);

/**
 * Idle drift. Nothing in a finished piece is ever perfectly still between
 * beats, and a frozen frame is one of the clearest signs of a computer render.
 * Amplitude is under two pixels on purpose: felt, never seen.
 */
export const idle = (frame: number, phase: number, amplitude = 1.7): number =>
  Math.sin(frame / 46 + phase) * amplitude;

/**
 * The feed's navigation bar. Real icons, because five identical grey squares
 * read as a wireframe, and the phone has to look like an app someone uses.
 */
const NavIcons: React.FC = () => {
  const stroke = `rgba(${INK},0.32)`;
  const active = `rgba(${INK},0.7)`;
  const common = {
    fill: "none",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <>
      <svg
        width={19}
        height={19}
        viewBox="0 0 24 24"
        stroke={active}
        {...common}
      >
        <path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
      </svg>
      <svg
        width={19}
        height={19}
        viewBox="0 0 24 24"
        stroke={stroke}
        {...common}
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.6-3.6" />
      </svg>
      <svg
        width={19}
        height={19}
        viewBox="0 0 24 24"
        stroke={stroke}
        {...common}
      >
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <path d="M12 8.5v7M8.5 12h7" />
      </svg>
      <svg
        width={19}
        height={19}
        viewBox="0 0 24 24"
        stroke={stroke}
        {...common}
      >
        <path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 3C19.5 15.4 12 20 12 20z" />
      </svg>
      <svg
        width={19}
        height={19}
        viewBox="0 0 24 24"
        stroke={stroke}
        {...common}
      >
        <circle cx="12" cy="8.6" r="3.6" />
        <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
      </svg>
    </>
  );
};

/** Contact shadow. Weight under an object, not a slab beside it. */
export const Contact: React.FC<{
  x: number;
  y: number;
  width: number;
  opacity: number;
}> = ({ x, y, width, opacity }) => (
  <div
    style={{
      position: "absolute",
      left: x - width / 2,
      top: y - width * 0.09,
      width,
      height: width * 0.18,
      opacity,
      borderRadius: "50%",
      background: `radial-gradient(ellipse at 50% 50%, rgba(${INK},0.3) 0%, rgba(${INK},0.1) 42%, rgba(${INK},0) 72%)`,
      filter: "blur(6px)",
    }}
  />
);

/**
 * A layer at a given depth. Everything in the scene goes through this, so the
 * parallax relationship between objects is defined in one place.
 */
export const Layer: React.FC<{
  depth: number;
  children: ReactNode;
  /** Distance in depth units from whatever the camera is focused on. */
  defocus?: number;
}> = ({ depth, children, defocus = 0 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      transform: `translateZ(${depth}px)`,
      transformStyle: "preserve-3d",
      filter: defocus > 0.15 ? `blur(${defocus}px)` : undefined,
    }}
  >
    {children}
  </div>
);

/**
 * Lens blur for a layer, from how far it sits off the focal plane.
 *
 * This is the cue that most reads as "shot with a lens" rather than "drawn".
 * Capped, because past about 14px it stops being depth and starts being fog.
 */
export const dof = (depth: number, focus: number): number =>
  Math.min(Math.abs(depth - focus) * 0.019, 14);

export const Phone: React.FC<{
  loaded: number;
  opacity: number;
  frame: number;
  defocus: number;
  light: number;
}> = ({ loaded, opacity, frame, defocus, light }) => {
  const left = PHONE.x - PHONE.width / 2;
  const top = PHONE.y - PHONE.height / 2 + idle(frame, 0);

  return (
    <Layer depth={PHONE.depth} defocus={defocus}>
      <Contact
        x={PHONE.x + 10}
        y={top + PHONE.height + 8}
        width={340}
        opacity={opacity}
      />

      {/* The edge is what stops a rectangle reading as a rectangle. */}
      <div
        style={{
          position: "absolute",
          left: left + PHONE.width - 12,
          top: top + 16,
          width: 22,
          height: PHONE.height - 30,
          opacity,
          borderRadius: "0 28px 28px 0",
          background: "linear-gradient(90deg, #E4E1D8 0%, #D2CFC5 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left,
          top,
          width: PHONE.width,
          height: PHONE.height,
          opacity,
          borderRadius: 42,
          background: `linear-gradient(152deg, #FFFFFF 0%, ${theme.colors.paperBright} 46%, #EDEAE2 100%)`,
          boxShadow: `0 28px 58px rgba(${INK},0.1), 0 2px 6px rgba(${INK},0.06), inset 0 1px 0 rgba(255,255,255,0.95)`,
          padding: 13,
        }}
      >
        <Sheen light={light} radius={42} />
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 31,
            background: "#FEFDFA",
            boxShadow: `inset 0 0 0 1px rgba(${INK},0.08)`,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              flex: 1,
              padding: 12,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 6,
              alignContent: "start",
            }}
          >
            {Array.from({ length: TILES }, (_, i) => {
              // Photos land one after another, so the reply reads as data
              // arriving rather than a light switch.
              const fill = interpolate(
                loaded * TILES - i,
                [0, 1],
                [0, 1],
                clamp,
              );
              const tone = PHOTO_TONES[i % PHOTO_TONES.length];
              // Skeleton sweep on whatever has not arrived yet. Offset per tile
              // so the row does not shimmer in lockstep.
              const sweep = ((frame * 2.4 + i * 26) % 220) / 220;

              return (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    aspectRatio: "1",
                    borderRadius: 7,
                    overflow: "hidden",
                    background: `rgba(${INK},0.055)`,
                  }}
                >
                  {fill < 1 ? (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 100%)`,
                        transform: `translateX(${interpolate(sweep, [0, 1], [-140, 140])}%)`,
                        opacity: 0.55,
                      }}
                    />
                  ) : null}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: fill,
                      transform: `scale(${0.9 + fill * 0.1})`,
                      background: `linear-gradient(148deg, ${tone[0]} 0%, ${tone[1]} 100%)`,
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Bottom bar. A photo feed has one, and its absence was part of why
              the device read as a placeholder rather than an app. */}
          <div
            style={{
              height: 46,
              borderTop: `1px solid rgba(${INK},0.07)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              padding: "0 14px",
            }}
          >
            <NavIcons />
          </div>
        </div>
      </div>
    </Layer>
  );
};

export const Server: React.FC<{
  activity: number;
  opacity: number;
  frame: number;
  defocus: number;
  light: number;
}> = ({ activity, opacity, frame, defocus, light }) => {
  const left = SERVER.x - SERVER.width / 2;
  const top = SERVER.y - SERVER.height / 2 + idle(frame, 2.3, 1.3);

  return (
    <Layer depth={SERVER.depth} defocus={defocus}>
      <Contact
        x={SERVER.x + 12}
        y={top + SERVER.height + 8}
        width={500}
        opacity={opacity}
      />

      <div
        style={{
          position: "absolute",
          left: left + SERVER.width - 14,
          top: top + 12,
          width: 30,
          height: SERVER.height - 22,
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
          width: SERVER.width,
          height: SERVER.height,
          opacity,
          borderRadius: 26,
          background: `linear-gradient(150deg, #FFFFFF 0%, ${theme.colors.paperBright} 42%, #E9E6DD 100%)`,
          boxShadow: `0 32px 64px rgba(${INK},0.11), 0 2px 6px rgba(${INK},0.06), inset 0 1px 0 rgba(255,255,255,0.95)`,
          overflow: "hidden",
          padding: 22,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <Sheen light={light} radius={26} />
        {/* Two rack units, because the machine runs two programs. Scene 02
            names them as the application process and the database. */}
        {[0, 1].map((row) => {
          const lit = row === 0 ? activity : activity * 0.45;
          return (
            <div
              key={row}
              style={{
                flex: 1,
                borderRadius: 12,
                background: `rgba(${INK},${0.035 + lit * 0.05})`,
                boxShadow: `inset 0 1px 3px rgba(${INK},0.06)`,
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                gap: 12,
              }}
            >
              {/* Status lamps. Blink phase differs per lamp so the machine does
                  not pulse as one block. */}
              <div style={{ display: "flex", gap: 7 }}>
                {[
                  { hue: "#4CA46A", period: 23, offset: 0 },
                  { hue: "#D9A441", period: 11, offset: 5 },
                  { hue: theme.colors.blue, period: 7, offset: 3 },
                ].map((lamp) => {
                  const beat = (frame + lamp.offset) % lamp.period;
                  const on = beat < lamp.period * 0.45 ? 1 : 0.22;
                  const level = 0.34 + on * (0.5 + lit * 0.5);
                  return (
                    <div
                      key={lamp.hue}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: lamp.hue,
                        opacity: level,
                        boxShadow: `0 0 ${5 * on}px ${lamp.hue}`,
                      }}
                    />
                  );
                })}
              </div>

              {/* Vent grille. */}
              <div style={{ flex: 1, display: "flex", gap: 4 }}>
                {Array.from({ length: 22 }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 26,
                      borderRadius: 2,
                      background: `rgba(${INK},0.07)`,
                    }}
                  />
                ))}
              </div>

              {/* Ports. */}
              <div style={{ display: "flex", gap: 6 }}>
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 18,
                      height: 13,
                      borderRadius: 2,
                      background: `rgba(${INK},0.13)`,
                      boxShadow: `inset 0 1px 2px rgba(${INK},0.22)`,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Layer>
  );
};

/** Thin neutral connector, touching both objects so the link is unbroken. */
export const Wire: React.FC<{ opacity: number; defocus: number }> = ({
  opacity,
  defocus,
}) => (
  <Layer depth={-34} defocus={defocus}>
    <div
      style={{
        position: "absolute",
        left: PHONE_RIGHT,
        top: LINE_Y - 1,
        width: SERVER_LEFT - PHONE_RIGHT,
        height: 2,
        opacity: opacity * 0.6,
        background: theme.colors.grayLight,
      }}
    />
  </Layer>
);

/**
 * Whatever is travelling on the wire.
 *
 * A request and a response are not the same object with a different colour. An
 * ask is short. A response carries data, and web applications send that data as
 * JSON, so the response shows braces and key-value rows. The viewer should be
 * able to tell which direction traffic is going with the sound off.
 */
export const Packet: React.FC<{
  x: number;
  y: number;
  scale: number;
  opacity: number;
  kind: "request" | "response";
  defocus: number;
}> = ({ x, y, scale, opacity, kind, defocus }) => {
  const response = kind === "response";
  const width = (response ? 118 : 84) * scale;
  const height = (response ? 82 : 56) * scale;

  return (
    <Layer depth={26} defocus={defocus}>
      <div
        style={{
          position: "absolute",
          left: x - 160 * scale,
          top: y - 160 * scale,
          width: 320 * scale,
          height: 320 * scale,
          opacity: opacity * 0.42,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(23,105,224,0.28) 0%, rgba(23,105,224,0) 66%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x - width / 2,
          top: y - height / 2,
          width,
          height,
          opacity,
          borderRadius: 13 * scale,
          background: response
            ? `linear-gradient(140deg, ${theme.colors.blueBright} 0%, ${theme.colors.blue} 100%)`
            : `linear-gradient(140deg, ${theme.colors.blue} 0%, #1155BE 100%)`,
          boxShadow: `0 ${12 * scale}px ${28 * scale}px rgba(23,105,224,0.36), inset 0 1px 0 rgba(255,255,255,0.34)`,
          padding: `${(response ? 10 : 12) * scale}px ${13 * scale}px`,
          display: "flex",
          alignItems: "center",
          gap: 8 * scale,
        }}
      >
        {response ? (
          <>
            <span
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 40 * scale,
                lineHeight: 0.8,
                fontWeight: 500,
                color: "rgba(255,255,255,0.62)",
              }}
            >
              {"{"}
            </span>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 5 * scale,
              }}
            >
              {[
                [0.46, 0.34],
                [0.38, 0.44],
                [0.5, 0.28],
              ].map(([key, value], i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 5 * scale,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: `${key * 100}%`,
                      height: 5 * scale,
                      borderRadius: 3 * scale,
                      background: "rgba(255,255,255,0.9)",
                    }}
                  />
                  <div
                    style={{
                      width: `${value * 100}%`,
                      height: 5 * scale,
                      borderRadius: 3 * scale,
                      background: "rgba(255,255,255,0.5)",
                    }}
                  />
                </div>
              ))}
            </div>
            <span
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 40 * scale,
                lineHeight: 0.8,
                fontWeight: 500,
                color: "rgba(255,255,255,0.62)",
              }}
            >
              {"}"}
            </span>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 6 * scale,
            }}
          >
            {[1, 0.68, 0.42].map((w) => (
              <div
                key={w}
                style={{
                  width: `${w * 100}%`,
                  height: 6 * scale,
                  borderRadius: 3 * scale,
                  background: "rgba(255,255,255,0.72)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </Layer>
  );
};

/**
 * The camera. Trucks, dollies, never rotates.
 *
 * Perspective lives here, so a layer's depth turns into parallax for free as
 * the camera moves. That relationship is the whole point of 2.5D.
 */
export const Camera: React.FC<{
  children: ReactNode;
  x: number;
  y: number;
  zoom: number;
  /**
   * Fade the whole stage out. A full-frame teaching shot laid on top has to
   * dissolve against something; without this the stage is still there at full
   * strength behind it and snaps back the instant the shot's paper clears.
   */
  opacity?: number;
}> = ({ children, x, y, zoom, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      opacity,
      perspective: 1600,
      perspectiveOrigin: "50% 50%",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformStyle: "preserve-3d",
        transform: `scale(${zoom}) translate(${WORLD.width / 2 - x}px, ${WORLD.height / 2 - y}px)`,
      }}
    >
      {children}
    </div>
  </div>
);

/** Where a world point lands on screen, given the camera above. */
/** Matches the `perspective` on the camera wrapper. */
export const PERSPECTIVE = 1600;

/**
 * Where a world point lands on screen.
 *
 * `depth` matters. Every object sits on a layer at some translateZ, and CSS
 * perspective scales that layer toward the vanishing point. Projecting without
 * it puts a callout's arrow near its subject but never on it, and the error
 * grows with the zoom, which is why arrows drifted most in the tight shots.
 */
export const toScreen = (
  world: { x: number; y: number },
  cam: { x: number; y: number; zoom: number },
  depth = 0,
) => {
  const foreshorten = PERSPECTIVE / (PERSPECTIVE - depth);
  return {
    x: (world.x - cam.x) * cam.zoom * foreshorten + WORLD.width / 2,
    y: (world.y - cam.y) * cam.zoom * foreshorten + WORLD.height / 2,
  };
};

/**
 * A label in screen space.
 *
 * Whether it sits above or below its object is decided per label and never
 * re-evaluated per frame, because choosing per frame makes the label flip
 * sides whenever the camera crosses the threshold.
 */
export const Label: React.FC<{
  children: ReactNode;
  x: number;
  y: number;
  opacity: number;
  size?: number;
  accent?: boolean;
  weight?: number;
}> = ({ children, x, y, opacity, size = 40, accent = false, weight = 700 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: "translateX(-50%)",
      opacity,
      whiteSpace: "nowrap",
      fontFamily: theme.fontFamily,
      fontSize: size,
      fontWeight: weight,
      letterSpacing: "-0.04em",
      color: accent ? theme.colors.blue : theme.colors.ink,
    }}
  >
    {children}
  </div>
);

/** Captions occupy the bottom band. Nothing else may enter it. */
export const SAFE_BOTTOM = 892;

/**
 * Project a world point to screen without clamping.
 *
 * Callouts need the true position so they can tell when their subject has left
 * the frame. Clamping would park the arrow on the edge, pointing at nothing.
 */
export const pointAt = (
  world: { x: number; y: number },
  cam: { x: number; y: number; zoom: number },
  depth = 0,
) => toScreen(world, cam, depth);

/** Project a world point to screen and keep it inside the safe area. */
export const anchorTo = (
  world: { x: number; y: number },
  cam: { x: number; y: number; zoom: number },
  depth = 0,
) => {
  const point = toScreen(world, cam, depth);
  return {
    x: Math.min(Math.max(point.x, 190), 1730),
    y: Math.min(Math.max(point.y, 60), SAFE_BOTTOM),
  };
};
