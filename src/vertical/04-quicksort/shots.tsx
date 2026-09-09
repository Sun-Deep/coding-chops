import { interpolate, useCurrentFrame } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { theme } from "../../shared/brand/theme";
import { clamp } from "../../shared/video/timing";
import { ACCENT } from "../../shared/vertical/palette";
import { WIDTH } from "../../shared/vertical/geometry";
import { Headline } from "../../shared/vertical/type";
import { Field } from "./Field";
import {
  N,
  QUICK,
  RATIO,
  SEED,
  SELECTION,
  SELECTION_SORTED,
  SORTED,
  WRITE_RATIO,
} from "./measurements";
import {
  QUICK_FIRST_DONE,
  RESHUFFLE_AT,
  SCATTER,
  SHOTS,
  comparisonsAt,
  length,
  quickComparisonsAt,
} from "./beats";
import {
  heatAt,
  probeAt,
  quickSort,
  rangeAt,
  shuffled,
  stateAt,
  type Trace,
} from "./sorting";

/* ------------------------------------------------------------------ pieces */

const mono = (size: number, color: string): React.CSSProperties => ({
  fontFamily: theme.monoFamily,
  fontSize: size,
  fontWeight: 600,
  letterSpacing: "-0.02em",
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
  color,
});

const caption: React.CSSProperties = {
  marginTop: 16,
  fontFamily: theme.monoFamily,
  fontSize: 20,
  fontWeight: 500,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: theme.colors.grayDark,
};

/**
 * Both counts, side by side, on one line.
 *
 * They read the same number nearly all the time and that is the point: the two
 * fields compare at the same rate, so the count is not what differs between
 * them. What differs is the tally beside it. Stacking them down the middle of
 * the frame made the match look like a rendering fault rather than the claim,
 * and it cost each field two hundred pixels.
 *
 * The row sits above `RAIL_FROM`, so it has the full width rather than the
 * narrow column everything below the action rail is stuck with.
 */
const Counts: React.FC<{
  top: number;
  left: { figure: string; label: React.ReactNode; lit?: boolean };
  right: { figure: string; label: React.ReactNode; lit?: boolean };
}> = ({ top, left, right }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 0,
      width: WIDTH,
      display: "flex",
    }}
  >
    {[left, right].map((cell, i) => (
      <div key={i} style={{ flex: 1, textAlign: "center" }}>
        <div style={mono(66, cell.lit ? ACCENT : theme.colors.chalk)}>
          {cell.figure}
        </div>
        <div style={caption}>{cell.label}</div>
      </div>
    ))}
  </div>
);

/** One count, centred, for the shots that only run one algorithm. */
const Count: React.FC<{
  top: number;
  figure: string;
  label: React.ReactNode;
  lit?: boolean;
}> = ({ top, figure, label, lit }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 0,
      width: WIDTH,
      textAlign: "center",
    }}
  >
    <div style={mono(72, lit ? ACCENT : theme.colors.chalk)}>{figure}</div>
    <div style={caption}>{label}</div>
  </div>
);

const settledFlags = (trace: Trace, k: number): boolean[] =>
  Array.from(trace.settledAt, (at) => k >= at);

/* -------------------------------------------------------------------- race */

/**
 * Quicksort's later runs, each on a fresh shuffle.
 *
 * Built on demand and cached. The point of running it again is that the ratio
 * between the two algorithms arrives as repetitions rather than as a number on
 * a card, and a repetition of the same array would be a replay.
 */
const laterRuns = new Map<number, Trace>();
const quickRun = (index: number): Trace => {
  if (index === 0) return QUICK;
  let run = laterRuns.get(index);
  if (!run) {
    run = quickSort(shuffled(N, SEED + index * 101));
    laterRuns.set(index, run);
  }
  return run;
};

/**
 * Which quicksort run is on screen, and how far into it.
 *
 * After the one hold, quicksort's clock runs continuously: a run ends and the
 * next begins on the same frame. The scatter is a four frame visual transition
 * laid over the start of the new run rather than a pause in the count, so the
 * comparison figure never stops for it and the tally stays honest.
 */
const quickState = (frame: number) => {
  const total = quickComparisonsAt(frame);
  const per = QUICK.comparisons;
  const index = Math.min(Math.floor(total / per), 40);
  const withinRaw = total - index * per;
  const run = quickRun(index);
  const within = Math.min(withinRaw, run.comparisons);
  const holding = frame > QUICK_FIRST_DONE && frame <= RESHUFFLE_AT;
  return { run, index, within, total, holding, tally: index };
};

export const Race: React.FC = () => {
  const frame = useCurrentFrame();
  const k = Math.min(comparisonsAt(frame), SELECTION.comparisons);

  const selectionValues = stateAt(SELECTION, k);
  const selectionProbe = probeAt(SELECTION, k);

  const q = quickState(frame);
  const quickValues = q.holding ? SORTED : stateAt(q.run, q.within);

  // The scatter. Bars fall out of the finished ramp into the next shuffle,
  // staggered across the width so the field breaks up rather than cutting.
  const scatterT = interpolate(
    frame,
    [RESHUFFLE_AT, RESHUFFLE_AT + SCATTER],
    [0, 1],
    clamp,
  );
  const scattering = frame >= RESHUFFLE_AT && scatterT < 1;
  const displayed = scattering
    ? SORTED.map((v, i) => {
        const t = interpolate(
          scatterT,
          [(i / N) * 0.4, (i / N) * 0.4 + 0.6],
          [0, 1],
          clamp,
        );
        return v + (quickValues[i] - v) * t;
      })
    : quickValues;

  const quickDone = q.holding || q.within >= q.run.comparisons;

  return (
    <>
      <Field
        values={selectionValues}
        settled={settledFlags(SELECTION, k)}
        probe={selectionProbe ? selectionProbe.b : null}
        anchor={selectionProbe ? selectionProbe.a : null}
        side="top"
        baseline={270}
      />
      <Field
        values={displayed}
        settled={
          q.holding
            ? SORTED.map(() => true)
            : scattering
              ? SORTED.map(() => false)
              : settledFlags(q.run, q.within)
        }
        probe={quickDone || scattering ? null : q.run.probeB[q.within - 1]}
        anchor={quickDone || scattering ? null : q.run.probeA[q.within - 1]}
        side="bottom"
        baseline={1300}
      />

      <Counts
        top={710}
        left={{
          figure: k.toLocaleString(),
          label: (
            <>
              selection<span>{"  sorted ×0"}</span>
            </>
          ),
        }}
        right={{
          figure: q.total.toLocaleString(),
          lit: quickDone,
          label: (
            <>
              quicksort
              <span
                style={{ color: q.tally > 0 ? ACCENT : theme.colors.grayDark }}
              >
                {"  sorted ×"}
                {q.tally}
              </span>
            </>
          ),
        }}
      />
    </>
  );
};

/* ------------------------------------------------------------------ cleave */

/**
 * One quicksort, slowed to sixteen comparisons a frame.
 *
 * The race shows that quicksort is cheap and shows it honestly, but at
 * sixty-two comparisons a frame the reason is a blur. A cut that sells an
 * algorithm and never draws its mechanism is a scoreboard, so this is the shot
 * where the partition is visible: the range in play is lit, everything outside
 * it drops back, and the lit stretch halves and halves again.
 */
const CLEAVE = quickSort(shuffled(N, SEED + 7717));

export const Cleave: React.FC = () => {
  const frame = useCurrentFrame();
  const span = length(SHOTS.cleave);
  const k = Math.min(
    Math.round(
      interpolate(frame, [2, span - 16], [0, CLEAVE.comparisons], clamp),
    ),
    CLEAVE.comparisons,
  );
  const done = k >= CLEAVE.comparisons;

  return (
    <>
      <Count
        top={250}
        figure={k.toLocaleString()}
        lit={done}
        label="comparisons · one run"
      />
      <Field
        values={stateAt(CLEAVE, k)}
        settled={settledFlags(CLEAVE, k)}
        probe={done ? null : CLEAVE.probeB[Math.max(k - 1, 0)]}
        anchor={done ? null : CLEAVE.probeA[Math.max(k - 1, 0)]}
        range={done ? null : rangeAt(CLEAVE, k)}
        side="bottom"
        baseline={1300}
        span={860}
      />
    </>
  );
};

/* ------------------------------------------------------------------ sorted */

/**
 * Selection sort on an array that is already in order.
 *
 * This is the shot the cut exists for. Nineteen thousand nine hundred is not
 * what selection sort costs on this input, it is what selection sort costs on
 * every input, because the count is n(n-1)/2 and nothing in the algorithm can
 * notice that there is nothing to do. The bars never move. The counter runs
 * anyway.
 *
 * The rake runs at a hundred and eighty comparisons a frame here rather than
 * the race's sixty-two, because this is a separate demonstration and not part
 * of the race. The counter is the honest thing and it is not touched.
 */
export const AlreadySorted: React.FC = () => {
  const frame = useCurrentFrame();
  const span = length(SHOTS.sorted);
  const k = Math.min(
    Math.round(
      interpolate(
        frame,
        [2, span - 20],
        [0, SELECTION_SORTED.comparisons],
        clamp,
      ),
    ),
    SELECTION_SORTED.comparisons,
  );
  const probe = probeAt(SELECTION_SORTED, k);

  return (
    <>
      <Counts
        top={250}
        left={{
          figure: k.toLocaleString(),
          label: "comparisons",
        }}
        right={{
          figure: (SELECTION_SORTED.writes / 2).toLocaleString(),
          label: "swaps",
          lit: true,
        }}
      />
      <Field
        values={SORTED}
        settled={SORTED.map(() => true)}
        probe={probe ? probe.b : null}
        anchor={null}
        side="bottom"
        baseline={1300}
        span={860}
      />
    </>
  );
};

/* ------------------------------------------------------------------ writes */

/**
 * The catch, and the reason selection sort still ships.
 *
 * Everything up to here says quicksort wins. It does, on comparisons. It loses
 * on writes by a factor of three, and a write is the expensive operation on
 * anything with a limited erase cycle, which is why the slow algorithm is still
 * the right one on flash and on EEPROM.
 *
 * The field stops being about order in this shot. A bar lights by how many
 * times it has been written, so selection sort's field stays nearly dark at
 * three hundred and eighty-four and quicksort's fills in at one thousand two
 * hundred and twenty-eight.
 */
export const Writes: React.FC = () => {
  const frame = useCurrentFrame();
  const span = length(SHOTS.writes);
  const t = interpolate(frame, [2, span - 42], [0, 1], clamp);

  const sel = heatAt(SELECTION, Math.round(t * SELECTION.comparisons));
  const qk = heatAt(QUICK, Math.round(t * QUICK.comparisons));

  return (
    <>
      <Field
        values={SORTED}
        settled={SORTED.map(() => true)}
        probe={null}
        anchor={null}
        heat={sel.heat}
        side="top"
        baseline={270}
      />
      <Field
        values={SORTED}
        settled={SORTED.map(() => true)}
        probe={null}
        anchor={null}
        heat={qk.heat}
        side="bottom"
        baseline={1300}
      />
      <Counts
        top={710}
        left={{
          figure: sel.writes.toLocaleString(),
          label: "selection writes",
        }}
        right={{
          figure: qk.writes.toLocaleString(),
          lit: true,
          label: "quicksort writes",
        }}
      />
    </>
  );
};

/* ----------------------------------------------------------------- verdict */

const Row: React.FC<{
  top: number;
  label: string;
  left: string;
  right: string;
  delay: number;
}> = ({ top, label, left, right, delay }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 10], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 96,
        width: WIDTH - 192,
        display: "flex",
        alignItems: "baseline",
        opacity: t,
        transform: `translateX(${(1 - t) * 40}px)`,
      }}
    >
      <div style={{ ...caption, marginTop: 0, flex: 1, textAlign: "left" }}>
        {label}
      </div>
      <div
        style={{
          ...mono(44, theme.colors.chalk),
          width: 210,
          textAlign: "right",
        }}
      >
        {left}
      </div>
      <div style={{ ...mono(44, ACCENT), width: 210, textAlign: "right" }}>
        {right}
      </div>
    </div>
  );
};

export const Verdict: React.FC = () => {
  const frame = useCurrentFrame();
  const ratioT = interpolate(frame, [30, 40], [0, 1], clamp);

  return (
    <>
      <Field
        values={SORTED}
        settled={SORTED.map(() => true)}
        probe={null}
        anchor={null}
        side="bottom"
        baseline={1400}
        span={300}
      />

      <div
        style={{
          position: "absolute",
          top: 300,
          left: 96,
          width: WIDTH - 192,
          display: "flex",
          alignItems: "baseline",
        }}
      >
        <div style={{ ...caption, marginTop: 0, flex: 1, textAlign: "left" }} />
        <div
          style={{ ...caption, marginTop: 0, width: 210, textAlign: "right" }}
        >
          selection
        </div>
        <div
          style={{ ...caption, marginTop: 0, width: 210, textAlign: "right" }}
        >
          quicksort
        </div>
      </div>

      <Row
        top={370}
        label="comparisons"
        left={SELECTION.comparisons.toLocaleString()}
        right={QUICK.comparisons.toLocaleString()}
        delay={6}
      />
      <Row
        top={450}
        label="writes"
        left={SELECTION.writes.toLocaleString()}
        right={QUICK.writes.toLocaleString()}
        delay={14}
      />

      <div
        style={{
          position: "absolute",
          top: 600,
          left: 0,
          width: WIDTH,
          textAlign: "center",
          opacity: ratioT,
          transform: `translateY(${(1 - ratioT) * 12}px)`,
        }}
      >
        <div style={mono(104, ACCENT)}>{RATIO.toFixed(1)}&times;</div>
        <div style={caption}>fewer comparisons</div>
        <div style={{ ...mono(56, theme.colors.chalk), marginTop: 44 }}>
          {WRITE_RATIO.toFixed(1)}&times;
        </div>
        <div style={caption}>more writes</div>
      </div>
    </>
  );
};

/* ---------------------------------------------------------------- end card */

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [2, 14], [0, 1], clamp);
  const sub = interpolate(frame, [16, 28], [0, 1], clamp);
  const mark = interpolate(frame, [30, 44], [0, 1], clamp);

  return (
    <>
      <Field
        values={SORTED}
        settled={SORTED.map(() => true)}
        probe={null}
        anchor={null}
        side="bottom"
        baseline={1400}
        span={260}
      />
      <Headline top={430} size={78} opacity={t} dy={(1 - t) * 14}>
        Selection sort is not
        <br />
        slow by accident.
      </Headline>
      <div
        style={{
          position: "absolute",
          top: 640,
          left: 0,
          width: WIDTH,
          textAlign: "center",
          opacity: sub,
        }}
      >
        <div style={{ ...caption, marginTop: 0 }}>
          it trades time for writes
        </div>
      </div>

      {/* The mark, after the line rather than beside it. The shell hands the
          corner watermark over on the same beat, so only one lockup is ever on
          screen. */}
      <div
        style={{
          position: "absolute",
          top: 780,
          left: 0,
          width: WIDTH,
          display: "flex",
          justifyContent: "center",
          opacity: mark,
          transform: `translateY(${(1 - mark) * 16}px)`,
        }}
      >
        <Lockup size={62} tone="black" stacked />
      </div>
    </>
  );
};
