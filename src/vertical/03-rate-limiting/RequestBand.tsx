import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { REQUESTS, SEAM } from "./measurements";

/**
 * The two hundred requests, in the order they were sent.
 *
 * One tick each, left to right, time running the way the channel's temporal
 * grammar says it runs. This is the hero object and it does not change between
 * shots. The same attack hits three limiters, and the only thing that differs
 * is how much of it comes back lit.
 *
 * That is the whole reel in one picture. A viewer who reads nothing else can see
 * that the first limiter lit the entire band and the second lit half of it.
 *
 * A tick that got through is full height in the accent. One that was rejected
 * stays short and dim. Nothing is red: the band is not reporting a fault, it is
 * reporting a decision, and half of those decisions are the limiter working.
 */
/**
 * Four pixels per request, three of them ink.
 *
 * Whole pixels, not the 4.18 that dividing the column by two hundred gives.
 * Fractional pitch puts every second tick on a half pixel, the renderer
 * antialiases it, and two hundred identical ticks come out as an irregular
 * barcode. The eye reads that as noise rather than as two hundred of anything.
 */
const PITCH = 4;
const TICK = 3;
export const BAND_WIDTH = PITCH * REQUESTS.length;
export const BAND_HEIGHT = 340;
const LEFT = (1080 - BAND_WIDTH) / 2;
const REJECTED_HEIGHT = 0.3;

export const RequestBand: React.FC<{
  top: number;
  allowed: readonly boolean[];
  /** 0 to 1 across the stream. Ticks past this point have not been sent yet. */
  progress: number;
  /** Draw the clock-minute boundary. Only the fixed window shot needs it. */
  seam?: number;
  /**
   * False while nothing has judged the traffic yet.
   *
   * The hook shows the attack before any limiter sees it, so its ticks are
   * neutral. If they were the accent there, the fixed window shot would look
   * identical to the setup, and the one thing that shot has to land is that
   * everything got through.
   */
  decided?: boolean;
  opacity?: number;
}> = ({ top, allowed, progress, seam = 0, decided = true, opacity = 1 }) => {
  const sent = progress * REQUESTS.length;

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: LEFT,
        width: BAND_WIDTH,
        height: BAND_HEIGHT,
        opacity,
      }}
    >
      {REQUESTS.map((_, i) => {
        const arrived = i < sent;
        const lit = arrived && allowed[i];
        const height = lit ? BAND_HEIGHT : BAND_HEIGHT * REJECTED_HEIGHT;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i * PITCH,
              bottom: 0,
              width: TICK,
              height,
              background: lit && decided ? ACCENT : theme.colors.chalk,
              opacity: lit ? (decided ? 1 : 0.5) : arrived ? 0.16 : 0.07,
            }}
          />
        );
      })}

      {/* The seam. Everything the fixed window shot is about happens here, and
          it is one pixel wide in the data as well as on the screen. */}
      {seam > 0 ? (
        <div
          style={{
            position: "absolute",
            left: SEAM * PITCH - 1,
            top: -26,
            width: 2,
            height: BAND_HEIGHT + 52,
            background: theme.colors.chalk,
            opacity: seam * 0.55,
          }}
        />
      ) : null}
    </div>
  );
};

/** A labelled span over part of the band, for whatever the limiter counts. */
export const Span: React.FC<{
  top: number;
  from: number;
  to: number;
  label: string;
  opacity?: number;
}> = ({ top, from, to, label, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: LEFT + from * BAND_WIDTH,
      width: (to - from) * BAND_WIDTH,
      opacity,
    }}
  >
    <div
      style={{
        height: 10,
        borderLeft: `2px solid ${theme.colors.gray}`,
        borderRight: `2px solid ${theme.colors.gray}`,
        borderTop: `2px solid ${theme.colors.gray}`,
      }}
    />
    <div
      style={{
        marginTop: 10,
        textAlign: "center",
        fontFamily: theme.monoFamily,
        fontSize: 20,
        fontWeight: 500,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: theme.colors.gray,
      }}
    >
      {label}
    </div>
  </div>
);

/** Tokens left in the bucket, as a bar the width of the band. */
export const TokenGauge: React.FC<{
  top: number;
  tokens: number;
  capacity: number;
  opacity?: number;
}> = ({ top, tokens, capacity, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: LEFT,
      width: BAND_WIDTH,
      opacity,
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 10,
        fontFamily: theme.monoFamily,
        fontSize: 20,
        fontWeight: 500,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: theme.colors.gray,
      }}
    >
      <span>Tokens</span>
      <span>
        {Math.floor(tokens)} / {capacity}
      </span>
    </div>
    <div
      style={{
        height: 12,
        borderRadius: 2,
        background: "rgba(233,228,216,0.09)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${(tokens / capacity) * 100}%`,
          height: 12,
          background: ACCENT,
        }}
      />
    </div>
  </div>
);
