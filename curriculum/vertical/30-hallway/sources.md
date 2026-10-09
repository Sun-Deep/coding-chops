# Sources

- IEEE 802.3, carrier sense multiple access with collision detection:
  truncated binary exponential backoff after a collision.
- IEEE 802.11, distributed coordination function: a random backoff from a
  contention window that doubles after each failed attempt.
- Livelock, as the counterpart of deadlock: processes keep changing state
  in response to each other without progress. Silberschatz, Galvin and
  Gagne, Operating System Concepts, deadlocks chapter.
- The run: `scripts/measure-hallway.mjs`, which imports
  `src/vertical/30-hallway/simulation.ts`, the same module the reel draws.
