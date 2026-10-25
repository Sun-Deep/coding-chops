import {
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { theme } from "../../shared/brand/theme";
import { Sfx } from "../../shared/primitives/Sfx";
import { TOP } from "../../shared/vertical/geometry";
import { Narration } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { clamp } from "../../shared/video/timing";
import { B, T } from "./clock";
import { Code } from "./Code";
import { CUES } from "./cues";
import { Stage } from "./Stage";

export const HEADLINE_TOP = 232;

/**
 * The headline follows the voice: the claim people are making, the answer,
 * what the new round is, what it grades, and that it is a pilot.
 */
export const HEADS: [number, React.ReactNode][] = [
  [
    0,
    <>
      LeetCode and DSA
      <br />
      are dead?
    </>,
  ],
  [
    B.notReally,
    <>
      LeetCode is dead?
      <br />
      <span style={{ color: ACCENT }}>Not even close.</span>
    </>,
  ],
  [
    B.testing,
    <>
      Google&apos;s new round:
      <br />
      fix code with AI.
    </>,
  ],
  [
    B.grade,
    <>
      Graded: can you
      <br />
      <span style={{ color: ACCENT }}>catch the AI&apos;s bug?</span>
    </>,
  ],
  [
    B.pilot,
    <>
      Only a pilot.
      <br />
      LeetCode isn&apos;t dead.
    </>,
  ],
];

const Heads: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {HEADS.map(([at, text], k) => {
        const next = HEADS[k + 1]?.[0];
        const opacity =
          next === undefined
            ? interpolate(f, [at - 4, at + 2], [0, 1], clamp)
            : interpolate(
                f,
                [at - 4, at + 2, next - 4, next + 2],
                [k === 0 ? 1 : 0, 1, 1, 0],
                clamp,
              );
        return opacity > 0 ? (
          <Headline key={k} top={HEADLINE_TOP} size={72} opacity={opacity}>
            {text}
          </Headline>
        ) : null;
      })}
    </>
  );
};

/** Level with the corner mark, on the right: whose news this is. */
const Label: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: TOP + 4,
      right: 96,
      fontFamily: theme.monoFamily,
      fontSize: 21,
      letterSpacing: "0.26em",
      textTransform: "uppercase",
      color: theme.colors.grayLight,
    }}
  >
    Google · hiring news
  </div>
);

const Body: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Code frame={frame} />
      <Stage frame={frame} />
    </>
  );
};

const lines = T.lines.map((l) => {
  const [first, second] = l.text.split("\n");
  return {
    from: l.from,
    to: l.to,
    text: second ? (
      <>
        {first}
        <br />
        {second}
      </>
    ) : (
      first
    ),
  };
});

export const GoogleInterviewReel: React.FC = () => (
  <VerticalShell>
    <Body />
    <Label />
    <Heads />
    <Narration lines={lines} />
    <Sequence from={T.voice.at} durationInFrames={T.voice.frames}>
      <Audio
        src={staticFile(
          "narration/vertical/50-google-ai-interview/stem-01.wav",
        )}
        trimBefore={Math.round((T.voice.fromMs / 1000) * 30)}
      />
    </Sequence>
    {CUES.map((c) => (
      <Sfx
        key={c.id}
        name={c.name}
        at={c.frame}
        gain={c.gain}
        playbackRate={c.rate}
      />
    ))}
  </VerticalShell>
);
