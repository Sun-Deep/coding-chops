import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { clamp } from "../../shared/video/timing";
import { ACCENT, ON_ACCENT } from "../../shared/vertical/palette";
import {
  cascade,
  cascadedAt,
  dialAt,
  SUMS_FROM,
  TUMBLERS_FROM,
  WEIGHTS_FROM,
} from "./beats";
import {
  DIAL_HEIGHT,
  DIAL_TOP,
  DIAL_WIDTH,
  DIAL_X,
  LABEL_TOP,
  SUM_TOP,
  TUMBLER_GAP,
  TUMBLER_SIZE,
  TUMBLER_TOP,
  WEIGHTS_TOP,
} from "./layout";
import { AUDIENCES } from "./measurements";
import { bitsOf, digitsOf } from "./modes";

/**
 * A digit, on a drum.
 *
 * Every chmod explainer ever made draws a table: rows of rwx, a column of
 * octal. A table is a readout, and nobody stops scrolling for one. A mode is
 * three digits dialled onto a file and each digit is three tumblers, so the
 * honest object is a combination lock, and a lock is a thing a viewer already
 * understands before a word of it is explained.
 *
 * The drum rolls rather than cuts, because the roll is what says the digit is a
 * value on a scale rather than a symbol.
 */
const Drum: React.FC<{ from: number; to: number; rolled: number }> = ({
  from,
  to,
  rolled,
}) => {
  const eased = interpolate(rolled, [0, 1], [0, 1], {
    ...clamp,
    easing: (t) => 1 - (1 - t) ** 3,
  });

  // A dial does not step, it spins. The drum always carries a full revolution
  // round to its new digit, so a change from 5 to 5 still turns and a change
  // from 7 to 5 is seven faces rather than one. That is what a combination lock
  // does, and it is also most of the motion in the cut.
  const faces: number[] = [from];
  let value = from;
  do {
    value = (value + 1) % 8;
    faces.push(value);
  } while (value !== to);

  const travel = faces.length - 1;

  const face = (value: number, key: number) => (
    <div
      key={key}
      style={{
        height: DIAL_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: theme.monoFamily,
        fontSize: 132,
        fontWeight: 700,
        lineHeight: 1,
        color: theme.colors.chalk,
      }}
    >
      {value}
    </div>
  );

  return (
    <div
      style={{
        width: DIAL_WIDTH,
        height: DIAL_HEIGHT,
        overflow: "hidden",
        borderRadius: 18,
        border: "1px solid rgba(255, 255, 255, 0.16)",
        background:
          "linear-gradient(180deg, #1A1F26 0%, #0C0F13 52%, #151A20 100%)",
        boxShadow: "inset 0 14px 22px #00000066, 0 16px 30px #00000055",
      }}
    >
      <div
        style={{
          transform: `translateY(${-eased * travel * DIAL_HEIGHT}px)`,
        }}
      >
        {faces.map(face)}
      </div>
    </div>
  );
};

/** One switch. Lit means the permission is granted, and it carries its value. */
const Tumbler: React.FC<{
  letter: string;
  on: boolean;
  slam: number;
  arrived: number;
  left: number;
}> = ({ letter, on, slam, arrived, left }) => (
  <div
    style={{
      position: "absolute",
      left,
      top: TUMBLER_TOP,
      width: TUMBLER_SIZE,
      height: TUMBLER_SIZE,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 9,
      opacity: arrived,
      transform: `scale(${(0.7 + arrived * 0.3) * (1 + slam * 0.3)})`,
      background: on ? ACCENT : "#171C22",
      border: `1px solid ${on ? ACCENT : "rgba(255, 255, 255, 0.14)"}`,
      boxShadow: on
        ? `0 0 ${18 + slam * 52}px ${ACCENT}${slam > 0.2 ? "AA" : "55"}`
        : `0 0 ${slam * 30}px rgba(255,255,255,${slam * 0.5})`,
      fontFamily: theme.monoFamily,
      fontSize: 30,
      fontWeight: 700,
      color: on ? ON_ACCENT : "#4C545D",
    }}
  >
    {letter}
  </div>
);

export const Lock: React.FC = () => {
  const frame = useCurrentFrame();
  const { mode, from, rolled, index } = dialAt(frame);
  const digits = digitsOf(mode);
  const previous = digitsOf(from);

  // Nine switches, nine values, three sums, each arriving in turn.
  const tumblerAt = (i: number, b: number) =>
    cascadedAt(frame, TUMBLERS_FROM, i * 3 + b);
  const weightAt = (i: number, b: number) =>
    cascadedAt(frame, WEIGHTS_FROM, i * 3 + b);
  const sumAt = (i: number) => cascadedAt(frame, SUMS_FROM, i);

  /**
   * A switch flares when its value arrives underneath it.
   *
   * Nine 33 pixel digits fading in is not a picture changing, and the
   * frozen-frame check said so: the whole stretch where the weights arrive came
   * in under the threshold. Flaring the switch the value belongs to puts a 56
   * pixel block behind every one of those arrivals, and it also says the thing
   * the frame is there to say, which is that this switch is the one worth four.
   */
  const flareAt = (i: number, b: number) => {
    const at = cascade(WEIGHTS_FROM, i * 3 + b);
    return interpolate(frame, [at, at + 5, at + 16], [0, 1, 0], clamp);
  };

  /** A switch that just changed gets hit, so a flip is felt and not just seen. */
  const slamOf = (position: number, bitIndex: number) => {
    if (index === 0) return 0;
    const changed =
      bitsOf(digits[position])[bitIndex].on !==
      bitsOf(previous[position])[bitIndex].on;
    if (!changed) return 0;
    return interpolate(rolled, [0, 1], [1, 0], clamp);
  };

  return (
    <>
      {AUDIENCES.map((audience, i) => (
        <div
          key={audience}
          style={{
            position: "absolute",
            top: LABEL_TOP,
            left: DIAL_X[i],
            width: DIAL_WIDTH,
            textAlign: "center",
            fontFamily: theme.monoFamily,
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: theme.colors.gray,
          }}
        >
          {audience}
        </div>
      ))}

      {digits.map((digit, i) => (
        <div
          key={i}
          style={{ position: "absolute", left: DIAL_X[i], top: DIAL_TOP }}
        >
          <Drum from={previous[i]} to={digit} rolled={rolled} />
        </div>
      ))}

      <div>
        {digits.map((digit, i) =>
          bitsOf(digit).map((bit, b) => (
            <Tumbler
              key={`${i}-${b}`}
              letter={bit.letter}
              on={bit.on}
              arrived={tumblerAt(i, b)}
              slam={Math.max(slamOf(i, b), flareAt(i, b))}
              left={
                DIAL_X[i] +
                (DIAL_WIDTH - (TUMBLER_SIZE * 3 + TUMBLER_GAP * 2)) / 2 +
                b * (TUMBLER_SIZE + TUMBLER_GAP)
              }
            />
          )),
        )}
      </div>

      <div>
        {digits.map((digit, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: WEIGHTS_TOP,
              left: DIAL_X[i],
              width: DIAL_WIDTH,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              fontFamily: theme.monoFamily,
              fontSize: 33,
              fontWeight: 700,
              color: theme.colors.chalk,
            }}
          >
            {bitsOf(digit).map((bit, b) => (
              <span
                key={b}
                style={{
                  display: "flex",
                  gap: 9,
                  opacity: weightAt(i, b),
                  transform: `scale(${0.55 + weightAt(i, b) * 0.45})`,
                }}
              >
                {b > 0 ? (
                  <span style={{ opacity: 0.35, fontWeight: 500 }}>+</span>
                ) : null}
                {/*
                  A switch that is off keeps its value and gets struck through.
                  Dimming alone leaves "4 + 2 + 1 = 5" on screen, which reads as
                  arithmetic that does not work and is the one thing this frame
                  cannot afford. The rule is unmistakable and it still says what
                  the switch would have been worth.
                */}
                <span
                  style={{
                    opacity: bit.on ? 1 : 0.3,
                    textDecoration: bit.on ? "none" : "line-through",
                    textDecorationThickness: "3px",
                    // Neutral, not the theme red. Six lanes of nothing here need a
                    // second hue: the rule itself is the signal and section 6 of the
                    // standard keeps colour for things that mean something.
                    textDecorationColor: theme.colors.grayDark,
                  }}
                >
                  {bit.weight}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>

      <div>
        {digits.map((digit, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              opacity: sumAt(i),
              top: SUM_TOP,
              left: DIAL_X[i],
              width: DIAL_WIDTH,
              textAlign: "center",
              fontFamily: theme.monoFamily,
              fontSize: 34,
              fontWeight: 700,
              color: ACCENT,
              fontVariantNumeric: "tabular-nums",
              transform: `scale(${0.6 + sumAt(i) * 0.4})`,
            }}
          >
            = {digit}
          </div>
        ))}
      </div>
    </>
  );
};
