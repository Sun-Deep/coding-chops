import { simAt } from "./beats";
import { sampleAt } from "./runs";
import type { Pose, Rule } from "./simulation";

export const STRIDE_RATE = 0.46;
export const SCOOP_RATE = 0.23;
const px = (x: number) => 102 + x * 72;

/** A continuous path from the foreground queue to the salad, then right. */
export const floorPose = (rule: Rule, p: Pose) => {
  if (p.x < -0.5 && rule === "line") {
    const d = -p.x - 0.5;
    return d < 1.8
      ? { x: px(-0.5) + d * 28, y: 222 + d * 28, scale: 0.84 + d * 0.025 }
      : { x: px(-0.5) + 50 + (d - 1.8) * 65, y: 273, scale: 0.9 };
  }
  if (rule === "skip" && p.state === "wait")
    return {
      x: px(p.x) + (p.queue % 2) * 19,
      y: 226 + Math.floor(p.queue / 2) * 39,
      scale: 0.84,
    };
  return {
    x: px(p.x),
    y: rule === "skip" && p.state === "walk" ? 280 : 222,
    scale: rule === "skip" && p.state === "walk" ? 0.92 : 0.84,
  };
};

/** Smooth model positions over four frames without changing their order. */
export const poseAt = (rule: Rule, id: number, frame: number) => {
  const p = sampleAt(rule, simAt(frame))[id];
  const pos = floorPose(rule, p);
  let x = 0,
    y = 0,
    scale = 0;
  for (let k = 0; k < 4; k++) {
    const old = floorPose(rule, sampleAt(rule, simAt(frame - k))[id]);
    x += old.x / 4;
    y += old.y / 4;
    scale += old.scale / 4;
  }
  const old = floorPose(rule, sampleAt(rule, simAt(frame - 4))[id]);
  return {
    p,
    x,
    y,
    scale,
    speed: Math.min(1, Math.hypot(pos.x - old.x, pos.y - old.y) / 12),
  };
};
