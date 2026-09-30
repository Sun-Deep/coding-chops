# Sources

- Elevator algorithm (SCAN and LOOK), Wikipedia:
  https://en.wikipedia.org/wiki/Elevator_algorithm
  Checked 2026-09-30 for the description of SCAN continuing in its direction
  until nothing is left that way, and LOOK turning at the last request.
- The simulation itself: `scripts/measure-elevator.mjs`, re-implemented in
  `src/vertical/21-elevator/simulation.ts`, which throws on load if any rider
  gets out at a different second from the committed run.

The 2 s a floor and 8 s a stop are round assumptions, not sourced figures. They
are stated on screen and the result is re-run at four other settings.
