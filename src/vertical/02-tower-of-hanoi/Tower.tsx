import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { EASE_IN_OUT, EASE_OUT } from "../../shared/video/motion";
import { clamp } from "../../shared/video/timing";
import { ACCENT } from "../../shared/vertical/palette";
import { Label } from "../../shared/vertical/type";
import { END_CARD_FROM, MOVE_LENGTH, MOVE_TRAVEL, TRACE_END } from "./beats";
import { DISKS, MOVES, MOVE_COUNT, type Peg } from "./measurements";
import { WeightPlate, WeightPlateDefs } from "./WeightPlate";

const PEG_X: Record<Peg, number> = { A: 252, B: 540, C: 828 };
const DISK_Y = 672;
const DISK_GAP = 38;

const initial: Record<Peg, readonly number[]> = {
  A: Array.from({ length: DISKS }, (_, index) => DISKS - index),
  B: [],
  C: [],
};

const states = MOVES.reduce<Array<Record<Peg, readonly number[]>>>(
  (history, move) => {
    const previous = history[history.length - 1] ?? initial;
    const source = [...previous[move.from]];
    const target = [...previous[move.to]];
    const disk = source.pop();
    if (disk !== move.disk)
      throw new Error(`invalid measured move ${move.disk}`);
    target.push(disk);
    return [
      ...history,
      { ...previous, [move.from]: source, [move.to]: target },
    ];
  },
  [initial],
);

const positionInState = (
  state: Record<Peg, readonly number[]>,
  disk: number,
) => {
  for (const peg of ["A", "B", "C"] as const) {
    const index = state[peg].indexOf(disk);
    if (index !== -1) {
      return { x: PEG_X[peg], y: DISK_Y - index * DISK_GAP };
    }
  }
  throw new Error(`disk ${disk} is missing`);
};

const Board: React.FC = () => {
  const frame = useCurrentFrame();
  const tracing = frame < TRACE_END;
  const moveIndex = tracing
    ? Math.min(MOVE_COUNT - 1, Math.floor(frame / MOVE_LENGTH))
    : MOVE_COUNT;
  const local = tracing ? frame - moveIndex * MOVE_LENGTH : MOVE_TRAVEL;
  const moving = tracing && local < MOVE_TRAVEL;
  const before = states[Math.min(moveIndex, MOVE_COUNT)];
  const after = states[Math.min(moveIndex + 1, MOVE_COUNT)];
  const state = moving ? before : after;
  const move = MOVES[Math.min(moveIndex, MOVE_COUNT - 1)];
  const fade = interpolate(
    frame,
    [END_CARD_FROM, END_CARD_FROM + 24],
    [1, 0],
    clamp,
  );

  let movingPosition: { x: number; y: number } | null = null;
  if (moving) {
    const start = positionInState(before, move.disk);
    const end = positionInState(after, move.disk);
    // The first move starts slightly before frame zero. The opening frame is
    // already moving instead of waiting for a ramp to begin.
    const t = interpolate(local, [-5, MOVE_TRAVEL - 4], [0, 1], {
      ...clamp,
      easing: EASE_IN_OUT.easing,
    });
    const lift = 455;
    const x = interpolate(
      t,
      [0, 0.28, 0.72, 1],
      [start.x, start.x, end.x, end.x],
      clamp,
    );
    const y = interpolate(t, [0, 0.28, 0.72, 1], [start.y, lift, lift, end.y], {
      ...clamp,
      easing: EASE_IN_OUT.easing,
    });
    movingPosition = { x, y };
  }

  const visibleMove = Math.min(MOVE_COUNT, moveIndex + 1);
  const solved = frame >= TRACE_END;

  return (
    <div style={{ opacity: fade }}>
      <Label top={286} opacity={1} color={solved ? ACCENT : theme.colors.gray}>
        {solved
          ? `Solved · ${MOVE_COUNT} moves`
          : `Move ${visibleMove} of ${MOVE_COUNT}`}
      </Label>

      <svg
        width={1080}
        height={470}
        viewBox="0 0 1080 470"
        style={{ position: "absolute", left: 0, top: 330, overflow: "visible" }}
      >
        <defs>
          <linearGradient id="base-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4B4D52" />
            <stop offset="1" stopColor="#24262B" />
          </linearGradient>
          <linearGradient id="base-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#24262B" />
            <stop offset="1" stopColor="#111214" />
          </linearGradient>
          <linearGradient id="peg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5C5E63" />
            <stop offset="0.48" stopColor="#D0CDC3" />
            <stop offset="1" stopColor="#383A3F" />
          </linearGradient>
          <WeightPlateDefs />
        </defs>

        {movingPosition ? (
          <path
            d={`M ${PEG_X[move.from]} ${positionInState(before, move.disk).y - 330} V 125 H ${PEG_X[move.to]} V ${positionInState(after, move.disk).y - 330}`}
            fill="none"
            stroke={ACCENT}
            strokeWidth={3}
            strokeDasharray="7 12"
            opacity={0.32}
          />
        ) : null}

        <polygon
          points="116,365 914,365 976,400 178,400"
          fill="url(#base-top)"
        />
        <polygon
          points="178,400 976,400 976,430 178,430"
          fill="url(#base-front)"
        />
        <polygon points="116,365 178,400 178,430 116,395" fill="#1A1B1F" />

        {(["A", "B", "C"] as const).map((peg) => (
          <g key={peg}>
            <rect
              x={PEG_X[peg] - 9}
              y={92}
              width={18}
              height={276}
              rx={9}
              fill="url(#peg)"
            />
            <ellipse cx={PEG_X[peg]} cy={93} rx={9} ry={5} fill="#D8D4CA" />
            <text
              x={PEG_X[peg]}
              y={458}
              textAnchor="middle"
              fontFamily={theme.monoFamily}
              fontSize={22}
              fontWeight={500}
              letterSpacing="0.18em"
              fill={theme.colors.gray}
            >
              {peg}
            </text>
          </g>
        ))}

        {Array.from({ length: DISKS }, (_, index) => index + 1).map((disk) => {
          if (moving && disk === move.disk) return null;
          const pos = positionInState(state, disk);
          return (
            <WeightPlate key={disk} disk={disk} x={pos.x} y={pos.y - 330} />
          );
        })}

        {movingPosition ? (
          <WeightPlate
            disk={move.disk}
            x={movingPosition.x}
            y={movingPosition.y - 330}
            active
            shadow={0.38}
          />
        ) : null}
      </svg>
    </div>
  );
};

const code = [
  "function hanoi(n, from, to, spare) {",
  "  if (n === 0) return;",
  "  hanoi(n - 1, from, spare, to);",
  "  move(n, from, to);",
  "  hanoi(n - 1, spare, to, from);",
  "}",
] as const;

const spareFor = (from: Peg, to: Peg): Peg =>
  (["A", "B", "C"] as const).find((peg) => peg !== from && peg !== to) ?? "B";

const postPath = (moveIndex: number): readonly number[] => {
  if (moveIndex === MOVE_COUNT - 1) return [5, 2, 6];
  const move = MOVES[moveIndex];
  const next = MOVES[moveIndex + 1];
  return next.disk < move.disk ? [5, 3, 4] : [5, 2, 4];
};

const lineMeaning = (line: number, moveIndex: number) => {
  if (line === 2) return "n is zero · return";
  if (line === 3) return "solve the left half";
  if (line === 4) {
    const move = MOVES[Math.min(moveIndex, MOVE_COUNT - 1)];
    return `move disk ${move.disk} · ${move.from} → ${move.to}`;
  }
  if (line === 5) return "solve the right half";
  return "all calls returned";
};

const CodeTraversal: React.FC = () => {
  const frame = useCurrentFrame();
  const tracing = frame < TRACE_END;
  const moveIndex = tracing
    ? Math.min(MOVE_COUNT - 1, Math.floor(frame / MOVE_LENGTH))
    : MOVE_COUNT - 1;
  const local = tracing ? frame - moveIndex * MOVE_LENGTH : MOVE_TRAVEL;
  const post = postPath(moveIndex);
  const postIndex = Math.min(
    post.length - 1,
    Math.floor(
      ((local - MOVE_TRAVEL) / (MOVE_LENGTH - MOVE_TRAVEL)) * post.length,
    ),
  );
  const activeLine = !tracing
    ? 0
    : local < MOVE_TRAVEL
      ? 4
      : post[Math.max(0, postIndex)];
  const fade = interpolate(
    frame,
    [END_CARD_FROM, END_CARD_FROM + 24],
    [1, 0],
    clamp,
  );
  const result = interpolate(
    frame,
    [TRACE_END - 8, TRACE_END + 18],
    [0, 1],
    EASE_OUT,
  );

  return (
    <div style={{ opacity: fade }}>
      <Label top={810} opacity={1}>
        Live code traversal
      </Label>

      <div
        style={{
          position: "absolute",
          top: 854,
          left: 150,
          width: 780,
          fontFamily: theme.monoFamily,
          fontSize: 25,
          lineHeight: 1,
        }}
      >
        {code.map((text, index) => {
          const line = index + 1;
          const active = line === activeLine;
          const recursiveResult = !tracing && (line === 3 || line === 5);
          return (
            <div
              key={text}
              style={{
                position: "relative",
                height: 55,
                display: "grid",
                gridTemplateColumns: "46px 1fr",
                alignItems: "center",
                color:
                  active || recursiveResult
                    ? theme.colors.chalk
                    : theme.colors.grayLight,
                opacity: active || recursiveResult ? 1 : 0.55,
                background: active ? "rgba(255,122,51,0.10)" : "transparent",
              }}
            >
              <span
                style={{
                  height: "100%",
                  display: "grid",
                  placeItems: "center",
                  borderLeft:
                    active || recursiveResult
                      ? `4px solid ${ACCENT}`
                      : "4px solid transparent",
                  color: active || recursiveResult ? ACCENT : theme.colors.gray,
                  fontSize: 19,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {line}
              </span>
              <span style={{ whiteSpace: "pre" }}>{text}</span>
              {active ? (
                <span
                  style={{
                    position: "absolute",
                    left: 46,
                    bottom: 0,
                    height: 2,
                    width: `${interpolate(local % 18, [0, 17], [12, 100], clamp)}%`,
                    maxWidth: 734,
                    background: ACCENT,
                    opacity: 0.72,
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          top: 1214,
          left: 150,
          width: 780,
          textAlign: "center",
          fontFamily: theme.monoFamily,
          color: tracing ? theme.colors.grayLight : ACCENT,
          opacity: 0.86,
          fontSize: 21,
          letterSpacing: "0.02em",
        }}
      >
        {tracing ? (
          <>
            depth {DISKS - MOVES[moveIndex].disk + 1} · hanoi(
            {MOVES[moveIndex].disk}, {MOVES[moveIndex].from},{" "}
            {MOVES[moveIndex].to},{" "}
            {spareFor(MOVES[moveIndex].from, MOVES[moveIndex].to)})
            <br />
            <span
              style={{
                color: activeLine === 4 ? ACCENT : theme.colors.grayLight,
              }}
            >
              L{activeLine} · {lineMeaning(activeLine, moveIndex)}
            </span>
          </>
        ) : (
          <span style={{ opacity: result }}>
            moves(n) = 2 × moves(n − 1) + 1
          </span>
        )}
      </div>
    </div>
  );
};

export const TowerOfHanoiTraversal: React.FC = () => (
  <>
    <Board />
    <CodeTraversal />
  </>
);
