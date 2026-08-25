import { interpolate } from "remotion";
import { theme } from "../../../../shared/brand/theme";
import { clamp } from "../../../../shared/video/timing";

/**
 * The diagram a beginner meets when they search for system design.
 *
 * Two things make this readable where a scatter of unlabelled boxes was not.
 * Every node carries the name of a real component, so it reads as a diagram
 * somebody drew rather than abstract decoration. And the connectors are drawn
 * by hand rather than ruled: they wander slightly, and they stop at the edge of
 * a box instead of running through it and under its label.
 *
 * It assembles faster than anyone can follow. That is the narration's point,
 * and it is why this is the only crowded frame in the episode.
 */
const COLUMNS = [180, 520, 860, 1200, 1540];
const ROWS = [250, 420, 590, 760];

type Node = {
  label: string;
  col: number;
  row: number;
  /** Named in the narration, so it lands on its own word and takes full ink. */
  key?: "load" | "caches" | "queues" | "microservices";
};

const nodes: Node[] = [
  { label: "CDN", col: 0, row: 0 },
  { label: "load balancer", col: 1, row: 0, key: "load" },
  { label: "API gateway", col: 2, row: 0 },
  { label: "auth service", col: 3, row: 0 },
  { label: "rate limiter", col: 4, row: 0 },
  { label: "web server", col: 0, row: 1 },
  { label: "cache", col: 2, row: 1, key: "caches" },
  { label: "search index", col: 4, row: 1 },
  { label: "message queue", col: 1, row: 2, key: "queues" },
  { label: "worker pool", col: 3, row: 2 },
  { label: "microservice", col: 0, row: 3, key: "microservices" },
  { label: "primary database", col: 2, row: 3 },
  { label: "read replica", col: 4, row: 3 },
  { label: "object storage", col: 3, row: 3 },
];

/** Connections between nodes, by index. Routed, not drawn as diagonals. */
const edges: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [1, 5],
  [2, 6],
  [4, 7],
  [5, 8],
  [6, 9],
  [8, 10],
  [9, 11],
  [6, 11],
  [11, 12],
  [9, 13],
  [7, 12],
  [10, 11],
  [3, 6],
  [8, 9],
];

const NODE_W = 232;
const NODE_H = 62;
/**
 * How far a connector stops short of the box.
 *
 * At 10 the break was only twenty pixels across a joint and two lines meeting
 * at a node still read as one continuous line passing through it.
 */
const EDGE_GAP = 20;

const centre = (node: Node) => ({
  x: COLUMNS[node.col] + NODE_W / 2,
  y: ROWS[node.row] + NODE_H / 2,
});

/**
 * Where a connector meets a box.
 *
 * Lines drawn centre to centre pass straight through the node and under its
 * label. This finds the point on the box's perimeter facing the other node, so
 * the line touches the edge and stops.
 */
const anchor = (from: Node, to: Node) => {
  const a = centre(from);
  const b = centre(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const halfW = NODE_W / 2 + EDGE_GAP;
  const halfH = NODE_H / 2 + EDGE_GAP;

  if (Math.abs(dx) * halfH > Math.abs(dy) * halfW) {
    const side = Math.sign(dx) || 1;
    return { x: a.x + side * halfW, y: a.y + (dy * halfW) / Math.abs(dx || 1) };
  }
  const side = Math.sign(dy) || 1;
  return { x: a.x + (dx * halfH) / Math.abs(dy || 1), y: a.y + side * halfH };
};

/** Deterministic jitter, so the sketch is identical on every render. */
const wobble = (seed: number, i: number) => {
  const n = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
};

/**
 * A line with a hand's unsteadiness in it.
 *
 * Perfectly straight connectors read as generated. Offsetting a few points
 * perpendicular to the line and smoothing through them gives the wander of a
 * drawn stroke. The offset tapers to nothing at both ends so the line still
 * meets each box cleanly instead of missing it.
 */
const sketch = (
  from: { x: number; y: number },
  to: { x: number; y: number },
  seed: number,
  amplitude = 7,
) => {
  const segments = 7;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const px = -dy / length;
  const py = dx / length;

  const points = Array.from({ length: segments + 1 }, (_, i) => {
    const t = i / segments;
    const taper = Math.sin(Math.PI * t);
    const offset = wobble(seed, i) * amplitude * taper;
    return {
      x: from.x + dx * t + px * offset,
      y: from.y + dy * t + py * offset,
    };
  });

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const current = points[i];
    const midX = (prev.x + current.x) / 2;
    const midY = (prev.y + current.y) / 2;
    d += ` Q ${prev.x.toFixed(1)} ${prev.y.toFixed(1)}, ${midX.toFixed(1)} ${midY.toFixed(1)}`;
  }
  const last = points[points.length - 1];
  return `${d} L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
};

export const Tangle: React.FC<{
  frame: number;
  /** Frame each named tool is spoken, in narration order. */
  namedAt: number[];
  /** Frames of stillness before the diagram starts assembling. */
  hold: number;
}> = ({ frame, namedAt, hold }) => {
  const keyed: Record<string, number> = {
    load: namedAt[0],
    caches: namedAt[1],
    queues: namedAt[2],
    microservices: namedAt[3],
  };

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
        aria-hidden
      >
        {edges.map(([a, b], i) => {
          // Accelerating: the last connectors arrive faster than the first,
          // so the diagram visibly gets away from you.
          const start = hold + 40 + i * Math.max(3, 9 - i * 0.35);
          const draw = interpolate(frame, [start, start + 26], [0, 1], clamp);
          const from = anchor(nodes[a], nodes[b]);
          const to = anchor(nodes[b], nodes[a]);

          // Two passes on slightly different seeds. A single stroke reads as
          // one clean curve; two overlapping ones read as pen on paper.
          return (
            <g key={i}>
              {[
                { seed: i + 1, width: 2.1, alpha: 0.85 },
                { seed: i + 41, width: 1.3, alpha: 0.4 },
              ].map((pass) => (
                <path
                  key={pass.seed}
                  d={sketch(from, to, pass.seed)}
                  fill="none"
                  stroke={theme.colors.grayLight}
                  strokeWidth={pass.width}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - draw}
                  opacity={pass.alpha}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {nodes.map((node, i) => {
        const named = node.key ? keyed[node.key] : undefined;
        const arrive = interpolate(
          frame,
          [hold + i * 7, hold + i * 7 + 18],
          [0, 1],
          clamp,
        );
        // Named tools are already on screen; being spoken brings them forward.
        const called =
          named === undefined
            ? 0
            : interpolate(frame, [named - 6, named + 14], [0, 1], clamp);
        const isNamed = called > 0.02;

        return (
          <div
            key={node.label}
            style={{
              position: "absolute",
              left: COLUMNS[node.col],
              top: ROWS[node.row],
              width: NODE_W,
              height: NODE_H,
              opacity: arrive * (0.62 + called * 0.38),
              transform: `translateY(${interpolate(arrive, [0, 1], [10, 0], clamp)}px) scale(${0.94 + arrive * 0.06 + called * 0.05})`,
              borderRadius: 13,
              background: isNamed ? "#EAE7DE" : theme.colors.paperBright,
              boxShadow: `inset 0 0 0 1px rgba(17,18,20,${isNamed ? 0.16 : 0.09})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: theme.fontFamily,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: theme.colors.ink,
            }}
          >
            {node.label}
          </div>
        );
      })}
    </div>
  );
};
