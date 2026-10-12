import { NAME_FROM, VERDICT_FROM, simAt } from "./beats";
import { DESSERT, RUNS } from "./runs";

const frameAt = (t: number) => {
  for (let f = 0; f < 420; f++) if (simAt(f) >= t) return f;
  return 419;
};
export const CUES = [
  { id: "salad-stall", name: "reject", frame: 8, gain: 2.4, rate: 0.8 },
  { id: "dish-pass", name: "send", frame: 66, gain: 4, rate: 1.15 },
  {
    id: "dessert-out",
    name: "plate-land",
    frame: frameAt(RUNS.skip.finished[DESSERT]),
    gain: 2.2,
    rate: 1,
  },
  { id: "line-grows", name: "probe", frame: 146, gain: 4, rate: 0.85 },
  { id: "dish-free", name: "plate-land", frame: 190, gain: 1.8, rate: 1.1 },
  { id: "average", name: "settle", frame: VERDICT_FROM, gain: 11.2, rate: 1 },
  { id: "fairness", name: "reject", frame: 276, gain: 2.2, rate: 1 },
  { id: "name", name: "settle", frame: NAME_FROM, gain: 9.3, rate: 0.9 },
] as const;
