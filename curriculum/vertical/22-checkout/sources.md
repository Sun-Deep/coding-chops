# Sources

- The simulation: `scripts/measure-checkout.mjs`, re-implemented in
  `src/vertical/22-checkout/simulation.ts`, which throws on load if any
  shopper's wait or the overtaking count differs from the committed run.

The checkout times (20 to 50 s, one in eight taking 120 to 180 s) and the 85
percent load are round assumptions, not sourced figures. They are stated in
the script and in `measurements.md`, and the result across many scenarios is
reported beside the single scenario shown.
