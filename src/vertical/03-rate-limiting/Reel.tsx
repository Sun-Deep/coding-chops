import { Sequence } from "remotion";
import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { SHOTS, length } from "./beats";
import { narration } from "./narration";
import { Bucket, EndCard, Fixed, Sliding, Verdict } from "./shots";

/**
 * The counter counting.
 *
 * One cue per ten requests rather than one per request, which is a meter
 * ticking rather than a hundred blips. `fill` is the right sound for it: the
 * set describes it as data arriving one piece at a time, and that is exactly
 * what a rate limiter is counting.
 *
 * The gain climbs across the run. A counter approaching its limit is under
 * more tension at 90 than at 10, and the rise is what carries that into the
 * `land` at the top.
 *
 * The numbers look large because `fill` is the quietest effect in the set, cut
 * at -34 dBFS to sit under narration that does not exist here. Set against the
 * finished render they land around -13 dBFS, roughly ten under the accents,
 * which is where a texture belongs.
 */
const Counting: React.FC<{
  from: number;
  to: number;
  cues?: number;
  gain?: readonly [number, number];
}> = ({ from, to, cues = 7, gain = [9, 14] }) => (
  <>
    {Array.from({ length: cues }, (_, i) => {
      const t = i / (cues - 1);
      return (
        <Sfx
          key={i}
          name="fill"
          at={Math.round(from + (to - from) * t)}
          gain={gain[0] + (gain[1] - gain[0]) * t}
        />
      );
    })}
  </>
);

/**
 * What a rate limit actually limits, in twenty-five seconds.
 *
 * One claim: a hundred requests a minute is not a hundred requests a minute if
 * the counter resets on the clock. The same two hundred request attack runs
 * against three limiters and each one fails or holds in its own way.
 *
 * No title card. The first frame is a counter already climbing, with the limit
 * beside it as the denominator, because that is a clearer statement of the rule
 * than a sentence about it and it does not cost two seconds of a still frame.
 *
 * It ends on the tradeoff rather than the winner. A cut that stops at "fixed
 * window is broken" sends people to the sliding window log, which is exact and
 * costs twenty-five times the memory, and they find that out in production.
 */
export const RateLimitingReel: React.FC = () => (
  <VerticalShell handOverAt={SHOTS.endCard.from + 22}>
    <Sequence from={SHOTS.fixed.from} durationInFrames={length(SHOTS.fixed)}>
      <Fixed />
    </Sequence>
    <Sequence
      from={SHOTS.sliding.from}
      durationInFrames={length(SHOTS.sliding)}
    >
      <Sliding />
    </Sequence>
    <Sequence from={SHOTS.bucket.from} durationInFrames={length(SHOTS.bucket)}>
      <Bucket />
    </Sequence>
    <Sequence
      from={SHOTS.verdict.from}
      durationInFrames={length(SHOTS.verdict)}
    >
      <Verdict />
    </Sequence>
    <Sequence
      from={SHOTS.endCard.from}
      durationInFrames={length(SHOTS.endCard)}
    >
      <EndCard />
    </Sequence>

    <Narration lines={narration} />

    {/*
      Events only, and every one of them short.
      
      An earlier cut of this laid `scan`, a seven and a half second bed of
      filtered noise, under four separate shots. It was reached for because the
      shots felt quiet, not because anything was scanning, and the result was a
      sustained hiss running most of the reel. Nothing sustained plays here now.

      What fills a climb instead is the climb itself, seven cues across it,
      which is a meter ticking rather than a bed. The difference matters: a
      tick is tied to the number moving on screen, and the hiss was tied to
      nothing.

      A run of requests that is being rejected gets no ticks. Nothing is being
      counted, so nothing counts.
    */}

    {/* Fixed window. The limit is reached, the clock rolls, the counter goes
        back to zero. The heaviest sound in the set is on the reset, because it
        is the one moment a number on screen goes backwards. */}
    <Sfx name="appear" at={0} gain={5} />
    <Counting from={6} to={58} />
    <Sfx name="land" at={64} gain={6} />
    <Sfx name="name" at={78} gain={6} />
    <Counting from={84} to={134} />
    <Sfx name="land" at={140} gain={6} />
    <Sfx name="settle" at={150} gain={5} />

    {/* Sliding window. The limit is reached and this time it holds, so the
        rejections start. Four of them, quieter each time, so a hundred blocked
        requests read as a run that settles rather than a machine gun. */}
    <Sfx name="send" at={186} gain={6} />
    <Counting from={192} to={240} />
    <Sfx name="land" at={244} gain={6} />
    <Sfx name="reject" at={256} gain={7} />
    <Sfx name="reject" at={270} gain={5.5} />
    <Sfx name="reject" at={288} gain={4.5} />
    <Sfx name="reject" at={302} gain={3.5} />
    <Sfx name="settle" at={320} gain={5} />

    {/* Token bucket. The tank runs dry at the end of the first burst, then
        requests bounce off it. Two get through on refilled tokens and keep
        their tick. */}
    <Sfx name="send" at={354} gain={6} />
    <Counting from={358} to={404} />
    <Sfx name="process" at={412} gain={9} />
    <Sfx name="fill" at={418} gain={13} />
    <Sfx name="reject" at={424} gain={7} />
    <Sfx name="reject" at={440} gain={5.5} />
    <Sfx name="fill" at={448} gain={11} />
    <Sfx name="reject" at={462} gain={4.5} />
    <Sfx name="settle" at={476} gain={5} />

    {/* Three rows, then the ratio a beat later so the shot has two events
        rather than one and a hold. */}
    <Sfx name="dissolve" at={504} gain={7} />
    <Sfx name="fill" at={512} gain={9} />
    <Sfx name="fill" at={520} gain={9} />
    <Sfx name="fill" at={528} gain={9} />
    <Sfx name="name" at={538} gain={5} />

    {/* The cost, then the mark. */}
    <Sfx name="send" at={600} gain={6} />
    <Sfx name="name" at={626} gain={5} />
  </VerticalShell>
);
