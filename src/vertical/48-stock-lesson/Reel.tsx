import {
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import { B, T } from "./clock";
import { Code } from "./Code";
import { CUES } from "./cues";
import { Stage } from "./Stage";

export const HEADLINE_TOP = 232;

/** The creator's six stems, trimmed to their words, end to end. */
const Voice: React.FC = () => (
  <>
    {T.stems.map((s) => (
      <Sequence key={s.file} from={s.at} durationInFrames={s.frames}>
        <Audio
          src={staticFile(`narration/vertical/48-stock-lesson/${s.file}.wav`)}
          trimBefore={Math.round((s.fromMs / 1000) * 30)}
        />
      </Sequence>
    ))}
  </>
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

/**
 * The hook, until time and space; then the headline is the readout, the
 * biggest type in the frame, changing as each complexity is said.
 */
const Heads: React.FC = () => {
  const f = useCurrentFrame();
  const steps: [number, React.ReactNode][] = [
    [
      0,
      <>
        Buy low, sell high.
        <br />
        But which day?
      </>,
    ],
    [
      B.nSquared,
      <>
        Every pair:
        <br />
        O(n
        <span style={{ letterSpacing: "0.02em", marginLeft: "0.03em" }}>²</span>
        ) time
      </>,
    ],
    [
      B.n,
      <>
        One pass:
        <br />
        <span style={{ color: ACCENT }}>O(n)</span> time
      </>,
    ],
    [
      B.one,
      <>
        <span style={{ color: ACCENT }}>O(n)</span> time,
        <br />
        <span style={{ color: ACCENT }}>O(1)</span> space
      </>,
    ],
  ];
  return (
    <>
      {steps.map(([at, text], k) => {
        const next = steps[k + 1]?.[0];
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
          <Headline key={k} top={HEADLINE_TOP} opacity={opacity}>
            {text}
          </Headline>
        ) : null;
      })}
    </>
  );
};

/** The captions are the spoken words, from the transcription of the stems. */
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

export const StockLessonReel: React.FC = () => (
  <VerticalShell>
    <Body />
    <Heads />
    <Narration lines={lines} />
    <Voice />
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
