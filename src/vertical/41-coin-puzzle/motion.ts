import { BEATS, DURATION } from "./beats";
import { RUN } from "./runs";
import { COINS, HERO } from "./simulation";

export type Vec3 = [number, number, number];
export const GEOMETRY = {
  halfBeam: 2.15,
  beamZ: 3.8,
  panZ: 1.36,
  radius: 0.285,
  thickness: 0.034,
} as const;
const TABLE_Z = GEOMETRY.thickness / 2 + 0.003;
const PAN_COIN_Z = TABLE_Z + 0.012;
const FIRST = RUN.steps[0];
const SECOND = RUN.steps[1];
const SLOTS: Vec3[] = [
  [-0.3, -0.19, 0],
  [0.3, -0.19, 0],
  [0, 0.34, 0],
];
const STARTS: Vec3[] = [
  [-2.65, -2.35, TABLE_Z],
  [-2.04, -2.35, TABLE_Z],
  [-1.43, -2.35, TABLE_Z],
  [1.43, -2.35, TABLE_Z],
  [2.04, -2.35, TABLE_Z],
  [2.65, -2.35, TABLE_Z],
  [-0.61, -0.95, TABLE_Z],
  [0, -0.95, TABLE_Z],
  [0.61, -0.95, TABLE_Z],
];
const SELECTED: Vec3[] = [
  [-0.66, -2.35, TABLE_Z],
  [0, -2.35, TABLE_Z],
  [0.66, -2.35, TABLE_Z],
];
export const ease = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};
const progress = (f: number, from: number, to: number) =>
  ease((f - from) / (to - from));
const mix = (a: Vec3, b: Vec3, t: number): Vec3 =>
  a.map((v, i) => v + (b[i] - v) * t) as Vec3;
const tiltDirection =
  FIRST.outcome === "right" ? 1 : FIRST.outcome === "left" ? -1 : 0;

export const tiltAt = (frame: number) => {
  const first = 0.16 * tiltDirection * progress(frame, ...BEATS.releaseFirst);
  if (frame < BEATS.keep[0]) return first;
  if (frame < 160) return first * (1 - progress(frame, 150, 160));
  // Equal pans settle after the arrest is released. The angle encodes no mass.
  if (frame >= BEATS.releaseSecond[0] && frame <= BEATS.releaseSecond[1]) {
    const t =
      (frame - BEATS.releaseSecond[0]) /
      (BEATS.releaseSecond[1] - BEATS.releaseSecond[0]);
    return 0.025 * Math.sin(t * Math.PI * 4) * (1 - t) ** 2;
  }
  return 0;
};

export const panAt = (side: number, frame: number): Vec3 => {
  const tilt = tiltAt(frame);
  return [
    side * GEOMETRY.halfBeam * Math.cos(tilt),
    0,
    GEOMETRY.panZ + side * GEOMETRY.halfBeam * Math.sin(tilt),
  ];
};
const onPan = (
  side: number,
  slot: number,
  frame: number,
  centred = false,
): Vec3 => {
  const p = panAt(side, frame);
  const offset = centred ? [0, 0, 0] : SLOTS[slot];
  return [p[0] + offset[0], offset[1], p[2] + PAN_COIN_Z];
};

type Transfer = {
  id: number;
  hand: number;
  from: number;
  to: number;
  start: Vec3;
  end: Vec3;
};
export const TRANSFERS: Transfer[] = [];
for (const [hand, ids] of [
  [-1, FIRST.left],
  [1, FIRST.right],
] as const) {
  ids.forEach((id, slot) => {
    const from = BEATS.loadFirst[0] + slot * 39;
    const to = from + 26;
    TRANSFERS.push({
      id,
      hand,
      from,
      to,
      start: STARTS[id],
      end: onPan(hand, slot, to),
    });
    const clearFrom = 160 + slot * 28;
    TRANSFERS.push({
      id,
      hand,
      from: clearFrom,
      to: clearFrom + 20,
      start: onPan(hand, slot, clearFrom),
      end: FIRST.remaining.includes(id)
        ? SELECTED[FIRST.remaining.indexOf(id)]
        : STARTS[id],
    });
  });
}
for (const [hand, ids] of [
  [-1, SECOND.left],
  [1, SECOND.right],
] as const) {
  const id = ids[0];
  TRANSFERS.push({
    id,
    hand,
    from: BEATS.loadSecond[0],
    to: BEATS.loadSecond[1],
    start: SELECTED[FIRST.remaining.indexOf(id)],
    end: onPan(hand, 0, BEATS.loadSecond[1], true),
  });
}
TRANSFERS.sort((a, b) => a.from - b.from || a.hand - b.hand);

const carry = (transfer: Transfer, frame: number): Vec3 => {
  const raw = Math.max(
    0,
    Math.min(1, (frame - transfer.from) / (transfer.to - transfer.from)),
  );
  const p = mix(transfer.start, transfer.end, ease((raw - 0.18) / 0.64));
  const height = Math.max(transfer.start[2], transfer.end[2]) + 0.32;
  p[2] =
    raw < 0.25
      ? transfer.start[2] + (height - transfer.start[2]) * ease(raw / 0.25)
      : raw > 0.75
        ? height + (transfer.end[2] - height) * ease((raw - 0.75) / 0.25)
        : height;
  return p;
};

export const coinAt = (id: number, frame: number) => {
  let pos = [...STARTS[id]] as Vec3;
  const moves = TRANSFERS.filter((t) => t.id === id);
  for (const transfer of moves) {
    if (frame < transfer.from) break;
    pos = frame <= transfer.to ? carry(transfer, frame) : [...transfer.end];
    if (frame <= transfer.to) break;
    if (transfer.to < 150 || transfer.from === BEATS.loadSecond[0]) {
      const side =
        FIRST.left.includes(id) && transfer.to < 150
          ? -1
          : transfer.from === BEATS.loadSecond[0]
            ? transfer.hand
            : 1;
      const slot = (side === -1 ? FIRST.left : FIRST.right).indexOf(id);
      pos = onPan(side, slot, frame, transfer.from === BEATS.loadSecond[0]);
    }
  }
  let rotation: Vec3 = [0, 0, 0];
  const active = moves.find((t) => frame >= t.from && frame <= t.to);
  if (active)
    rotation = [
      0.08 *
        Math.sin((Math.PI * (frame - active.from)) / (active.to - active.from)),
      0,
      0,
    ];
  if (id === HERO && frame >= BEATS.reveal[0]) {
    const t = progress(frame, ...BEATS.reveal);
    const angle = t * 1.3;
    pos = [
      0,
      -2.35,
      GEOMETRY.radius * Math.sin(angle) +
        (GEOMETRY.thickness / 2) * Math.cos(angle) +
        0.003,
    ];
    rotation = [angle, 0, -0.12 * t];
  }
  const selected = frame >= BEATS.keep[0] && FIRST.remaining.includes(id);
  const accent = selected
    ? frame < BEATS.reveal[0] || id === HERO
      ? 1
      : 0
    : 0;
  return { id, pos, rotation, accent };
};

/** Tweezers support each coin during transfer and withdraw after placement. */
export const toolAt = (hand: number, frame: number) => {
  const moves = TRANSFERS.filter((t) => t.hand === hand);
  const home: Vec3 = [hand * 4.5, -1.2, 2.0];
  for (const move of moves) {
    if (frame < move.from || frame > move.to) continue;
    const holding = frame >= move.from && frame <= move.to - 2;
    const pos = carry(move, Math.max(move.from, Math.min(move.to, frame)));
    const open = holding ? 0 : 1;
    return { hand, pos, open, visible: true, rotation: [0, 0, 0] as Vec3 };
  }
  const previous = moves.filter((m) => m.to < frame).slice(-1)[0];
  const next = moves.find((m) => m.from > frame);
  if (previous && next && next.from - previous.to < 45) {
    const t = (frame - previous.to) / (next.from - previous.to);
    const pos = mix(previous.end, next.start, ease(t));
    pos[2] += Math.sin(Math.PI * t) * 0.6;
    return {
      hand,
      pos,
      open: Math.sin(Math.PI * t),
      visible: true,
      rotation: [0, 0, 0] as Vec3,
    };
  }
  if (previous && frame <= previous.to + 10) {
    return {
      hand,
      pos: mix(
        previous.end,
        home,
        progress(frame, previous.to, previous.to + 10),
      ),
      open: 1,
      visible: true,
      rotation: [0, 0, 0] as Vec3,
    };
  }
  if (next && frame >= next.from - 10) {
    return {
      hand,
      pos: mix(home, next.start, progress(frame, next.from - 10, next.from)),
      open: 1 - progress(frame, next.from - 4, next.from),
      visible: true,
      rotation: [0, 0, 0] as Vec3,
    };
  }
  if (hand === 1 && frame >= BEATS.gripAnswer[0]) {
    const coin = coinAt(HERO, frame);
    const t = progress(frame, ...BEATS.gripAnswer);
    return {
      hand,
      pos: mix(home, coin.pos, t),
      open: 1 - t,
      visible: true,
      rotation: coin.rotation,
    };
  }
  return {
    hand,
    pos: home,
    open: 1,
    visible: false,
    rotation: [0, 0, 0] as Vec3,
  };
};

/** Every animated property is sampled at an absolute Remotion frame. */
export const stateAt = (frame: number) => {
  const close = progress(frame, ...BEATS.reveal);
  return {
    frame,
    tilt: tiltAt(frame),
    arrested:
      frame < BEATS.releaseFirst[0] ||
      (frame >= 150 && frame < BEATS.releaseSecond[0]),
    pans: [-1, 1].map((side) => panAt(side, frame)),
    coins: Array.from({ length: COINS }, (_, id) => coinAt(id, frame)),
    tools: [-1, 1].map((hand) => toolAt(hand, frame)),
    camera: {
      location: mix([0, -12, 9], [0, -8, 4.1], close),
      target: mix([0, -0.1, 1.4], [0, -2.0, 0.4], close),
      scale: (14.8 - (0.14 * frame) / DURATION) * (1 - close) + 4.8 * close,
    },
  };
};

export const CONTACT_FRAMES = [...new Set(TRANSFERS.map((t) => t.to))].sort(
  (a, b) => a - b,
);
