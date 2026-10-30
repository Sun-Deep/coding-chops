import { writeFileSync } from "node:fs";
import * as beats from "../../../src/vertical/54-wordle/beats.ts";
import { gameAt, GAME_COLORS } from "../../../src/vertical/54-wordle/game.ts";

writeFileSync(
  process.argv[2],
  JSON.stringify({
    duration: beats.DURATION,
    beats,
    colors: GAME_COLORS,
    frames: Array.from({ length: beats.DURATION }, (_, f) => gameAt(f)),
  }),
);
console.log(`Exported ${beats.DURATION} verified game states.`);
