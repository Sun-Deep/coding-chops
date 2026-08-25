import { interpolate } from "remotion";
import { theme } from "../../../../shared/brand/theme";
import { clamp } from "../../../../shared/video/timing";

/**
 * What each of the five closing questions looks like when you actually answer it.
 *
 * These were five decorative shapes: blobs standing in for people, bars
 * scattered off any baseline for request rate, three pills of arbitrary length
 * for data volume. Nothing on them could be read as a quantity, which is the
 * opposite of the point — the narration is telling the viewer to go and measure
 * these things before drawing any boxes.
 *
 * So every card now carries a real, proportional answer with its numbers on it.
 * Bars sit on a baseline, proportions are the proportions they claim to be, and
 * cobalt falls on the one part of each card that holds the lesson.
 *
 * The numbers are a plausible photo-sharing app at small scale, not a
 * measurement of anything real. They are there to show what the answers look
 * like, which is why every one of them carries its unit.
 */

const PAD = 90;
const TRACK = 580;
const INK_SOFT = "rgba(17,18,20,0.13)";
const INK_MID = "rgba(17,18,20,0.34)";

type CardProps = { frame: number; mark: number };

const Note: React.FC<{ children: React.ReactNode; top: number }> = ({
  children,
  top,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top,
      textAlign: "center",
      fontSize: 29,
      fontWeight: 800,
      letterSpacing: "-0.02em",
      color: theme.colors.ink,
    }}
  >
    {children}
  </div>
);

/**
 * What will people actually do?
 *
 * The shape of the answer is the lesson: almost everything people do is a read,
 * the write is rare, and the rare one is the expensive one. Twelve blobs could
 * not say that.
 */
export const Actions: React.FC<CardProps> = ({ frame, mark }) => {
  const grow = interpolate(frame, [mark + 4, mark + 42], [0, 1], clamp);

  return (
    <>
      {[
        { label: "open the feed", value: "100", fraction: 1 },
        { label: "scroll for more", value: "84", fraction: 0.84 },
        { label: "open one photo", value: "41", fraction: 0.41 },
        { label: "upload a photo", value: "6", fraction: 0.06, accent: true },
      ].map((row, i) => (
        <div
          key={row.label}
          style={{
            position: "absolute",
            left: PAD,
            width: TRACK,
            top: 52 + i * 92,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              fontSize: 26,
              fontWeight: 700,
              marginBottom: 10,
              color: row.accent ? theme.colors.ink : theme.colors.gray,
            }}
          >
            <span>{row.label}</span>
            <span
              style={{
                color: row.accent ? theme.colors.blue : theme.colors.gray,
              }}
            >
              {row.value}
            </span>
          </div>
          <div style={{ height: 18, borderRadius: 9, background: INK_SOFT }}>
            <div
              style={{
                width: `${row.fraction * grow * 100}%`,
                height: "100%",
                borderRadius: 9,
                background: row.accent ? theme.colors.blue : INK_MID,
              }}
            />
          </div>
        </div>
      ))}
      <Note top={432}>actions per 100 visits</Note>
    </>
  );
};

/**
 * How many requests arrive?
 *
 * A day of traffic on a baseline, so the quiet hours and the evening peak are
 * both legible. The old version placed each bar at `sin(i)` off an invented
 * origin, which produced a scatter that meant nothing.
 */
export const Arrivals: React.FC<CardProps> = ({ frame, mark }) => {
  const day = [8, 6, 5, 7, 14, 27, 45, 58, 52, 61, 88, 120, 96, 54];
  const peak = Math.max(...day);
  const base = 366;
  const tall = 250;
  const barWidth = 30;
  const step = 42;
  const peakIndex = day.indexOf(peak);

  return (
    <>
      {day.map((value, i) => {
        const grown = interpolate(
          frame,
          [mark + 2 + i * 2, mark + 22 + i * 2],
          [0, 1],
          clamp,
        );
        const height = (value / peak) * tall * grown;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: PAD + i * step,
              top: base - height,
              width: barWidth,
              height,
              borderRadius: 7,
              background: i === peakIndex ? theme.colors.blue : INK_MID,
            }}
          />
        );
      })}

      {/* The bars need something to stand on, or they read as floating. */}
      <div
        style={{
          position: "absolute",
          left: PAD - 14,
          top: base,
          width: TRACK + 28,
          height: 2,
          background: INK_SOFT,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: PAD + peakIndex * step - 58,
          top: base - tall - 46,
          width: barWidth + 116,
          textAlign: "center",
          fontSize: 25,
          fontWeight: 800,
          color: theme.colors.blue,
          opacity: interpolate(frame, [mark + 34, mark + 52], [0, 1], clamp),
        }}
      >
        peak 120/s
      </div>

      <Note top={412}>requests per second, across one day</Note>
    </>
  );
};

/**
 * How much data moves?
 *
 * One response, split by what is actually in it. Three pills of arbitrary
 * length said nothing; this says the thing worth knowing, which is that the
 * photo is effectively the entire payload and everything else is rounding.
 */
export const Payload: React.FC<CardProps> = ({ frame, mark }) => {
  const grow = interpolate(frame, [mark + 4, mark + 40], [0, 1], clamp);
  const photoShare = 0.98;
  const barTop = 214;
  const barHeight = 58;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: PAD,
          top: barTop,
          width: TRACK,
          height: barHeight,
          borderRadius: 12,
          background: INK_SOFT,
          overflow: "hidden",
          display: "flex",
        }}
      >
        <div
          style={{
            width: `${(1 - photoShare) * 100}%`,
            height: "100%",
            background: INK_MID,
          }}
        />
        <div
          style={{
            width: `${photoShare * grow * 100}%`,
            height: "100%",
            background: theme.colors.blue,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: PAD,
          top: barTop + barHeight + 20,
          width: TRACK,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 25,
          fontWeight: 700,
        }}
      >
        <span style={{ color: theme.colors.gray }}>json + headers 60 KB</span>
        <span style={{ color: theme.colors.blue }}>the photo 2.9 MB</span>
      </div>

      <Note top={barTop + barHeight + 82}>≈ 3 MB per response</Note>
    </>
  );
};

/**
 * How fast must the response be?
 *
 * A budget, broken down over the exact path the episode has been tracing:
 * out over the network, through the application, into the database and back.
 * A clock face with a hand sweeping through an arbitrary arc showed a passage
 * of time without ever showing how much, or where it went.
 */
export const Latency: React.FC<CardProps> = ({ frame, mark }) => {
  const scale = 250;
  const budget = 200;
  const legs = [
    { label: "network", ms: 40 },
    { label: "application", ms: 25 },
    { label: "database", ms: 90, accent: true },
    { label: "network", ms: 40 },
  ];
  const barTop = 210;
  const barHeight = 60;
  const px = (ms: number) => (ms / scale) * TRACK;

  let offset = 0;
  const placed = legs.map((leg) => {
    const left = offset;
    offset += px(leg.ms);
    return { ...leg, left, width: px(leg.ms) };
  });
  const total = legs.reduce((sum, leg) => sum + leg.ms, 0);

  const reveal = (i: number) =>
    interpolate(frame, [mark + 4 + i * 9, mark + 22 + i * 9], [0, 1], clamp);

  return (
    <>
      {/* Budget marker first, so the segments read as filling towards it. */}
      <div
        style={{
          position: "absolute",
          left: PAD + px(budget),
          top: barTop - 44,
          width: 2,
          height: barHeight + 60,
          background: theme.colors.ink,
          opacity: 0.55,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: PAD + px(budget) - 150,
          top: barTop - 78,
          width: 300,
          textAlign: "center",
          fontSize: 24,
          fontWeight: 800,
          color: theme.colors.ink,
        }}
      >
        budget 200 ms
      </div>

      <div
        style={{
          position: "absolute",
          left: PAD,
          top: barTop,
          width: TRACK,
          height: barHeight,
          borderRadius: 12,
          background: INK_SOFT,
        }}
      />

      {placed.map((leg, i) => (
        <div key={`${leg.label}-${i}`}>
          <div
            style={{
              position: "absolute",
              left: PAD + leg.left,
              top: barTop,
              width: leg.width * reveal(i),
              height: barHeight,
              background: leg.accent ? theme.colors.blue : INK_MID,
              borderTopLeftRadius: i === 0 ? 12 : 0,
              borderBottomLeftRadius: i === 0 ? 12 : 0,
              overflow: "hidden",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: PAD + leg.left,
              top: barTop + 14,
              width: leg.width,
              textAlign: "center",
              fontSize: 26,
              fontWeight: 800,
              color: theme.colors.paperBright,
              opacity: reveal(i),
            }}
          >
            {leg.ms}
          </div>
          {/* A 25 ms segment is 58px wide and "application" is not, so the
              odd legs drop to a second row on a tick rather than being
              abbreviated away from the names the episode has been using. */}
          {i % 2 === 1 ? (
            <div
              style={{
                position: "absolute",
                left: PAD + leg.left + leg.width / 2,
                top: barTop + barHeight + 4,
                width: 1,
                height: 30,
                background: INK_SOFT,
                opacity: reveal(i),
              }}
            />
          ) : null}
          <div
            style={{
              position: "absolute",
              left: PAD + leg.left - 70,
              top: barTop + barHeight + (i % 2 === 1 ? 40 : 12),
              width: leg.width + 140,
              textAlign: "center",
              fontSize: 22,
              fontWeight: 700,
              color: leg.accent ? theme.colors.blue : theme.colors.gray,
              opacity: reveal(i),
            }}
          >
            {leg.label}
          </div>
        </div>
      ))}

      <Note top={barTop + barHeight + 116}>{total} ms end to end</Note>
    </>
  );
};

/**
 * What happens when something fails?
 *
 * The request leaves and nothing comes back. A grey placeholder rectangle with
 * a question under it was a caption with a box next to it, not an answer.
 */
export const Failure: React.FC<CardProps> = ({ frame, mark }) => {
  const send = interpolate(frame, [mark + 6, mark + 30], [0, 1], clamp);
  const stopped = interpolate(frame, [mark + 30, mark + 48], [0, 1], clamp);
  const wireY = 268;
  const phoneLeft = 50;
  const phoneRight = 210;
  const breakAt = 350;
  const machineLeft = 450;

  return (
    <>
      {/* The phone, with a feed that never arrives. */}
      <div
        style={{
          position: "absolute",
          left: phoneLeft,
          top: 130,
          width: 160,
          height: 276,
          borderRadius: 26,
          background: theme.colors.paperBright,
          boxShadow:
            "0 14px 30px rgba(17,18,20,0.10), inset 0 0 0 2px rgba(17,18,20,0.10)",
          padding: 13,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: 68,
              marginBottom: 11,
              borderRadius: 9,
              background: INK_SOFT,
              opacity: 1 - stopped * 0.55,
            }}
          />
        ))}
      </div>

      {/* Wire out to the break, then a gap, then the last stretch. */}
      <div
        style={{
          position: "absolute",
          left: phoneRight,
          top: wireY,
          width: breakAt - phoneRight,
          height: 2,
          background: INK_SOFT,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: breakAt + 80,
          top: wireY,
          width: machineLeft - breakAt - 80,
          height: 2,
          background: INK_SOFT,
          opacity: 1 - stopped * 0.6,
        }}
      />

      {/* The request, stopping where the wire does. */}
      <div
        style={{
          position: "absolute",
          left: interpolate(send, [0, 1], [phoneRight, breakAt - 40]),
          top: wireY - 17,
          width: 46,
          height: 34,
          borderRadius: 8,
          background: theme.colors.blue,
          opacity: send,
        }}
      />

      {/* The machine, with its lights out. */}
      <div
        style={{
          position: "absolute",
          left: machineLeft,
          top: 172,
          width: 260,
          height: 192,
          borderRadius: 20,
          background: theme.colors.paperBright,
          boxShadow:
            "0 14px 30px rgba(17,18,20,0.08), inset 0 0 0 2px rgba(17,18,20,0.09)",
          opacity: 1 - stopped * 0.42,
          padding: 18,
        }}
      >
        <div
          style={{
            height: 116,
            borderRadius: 12,
            background: `rgba(17,18,20,${0.82 - stopped * 0.68})`,
          }}
        />
        <div style={{ display: "flex", gap: 7, marginTop: 12 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: INK_MID,
                opacity: 1 - stopped,
              }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: breakAt - 110,
          top: wireY - 104,
          width: 300,
          textAlign: "center",
          fontSize: 30,
          fontWeight: 800,
          color: theme.colors.blue,
          opacity: stopped,
        }}
      >
        no response
      </div>

      <Note top={444}>so what does the app show?</Note>
    </>
  );
};
