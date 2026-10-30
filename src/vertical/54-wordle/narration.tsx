import type { NarrationLine } from "../../shared/vertical/Narration";
import { RUN } from "./measurements";

const adieu = RUN.selected.find((row) => row.word === "adieu")!;
const winner = RUN.selected.find((row) => row.word === RUN.winner)!;

export const narration: readonly NarrationLine[] = [
  { from: 4, to: 55, text: "Try every possible answer." },
  {
    from: 65,
    to: 111,
    text: `ADIEU averages ${adieu.meanRemaining.toFixed(1)} left.`,
  },
  { from: 126, to: 179, text: "Repeat with every opener." },
  {
    from: 191,
    to: 291,
    emphasis: true,
    text: `${RUN.winner.toUpperCase()} averages ${winner.meanRemaining.toFixed(1)} left.`,
  },
  {
    from: 307,
    to: 415,
    text: (
      <>
        On this list, ROATE
        <br />
        cannot win immediately.
      </>
    ),
  },
];
