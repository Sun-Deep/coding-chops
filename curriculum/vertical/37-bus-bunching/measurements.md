# Measurements

Run `node --experimental-strip-types --no-warnings scripts/measure-bus-bunching.mjs`.
The raw output is in `measurement-run.txt`, including UTC timestamp, Node
version, settings, trace hash and every stop visit. The script asserts equal
speed limits, clearance, forward motion, deterministic repeats and a control
without a delay or passenger boarding time.

All displayed numbers are deterministic model results. They are not wall-clock
benchmarks or observations from a bus route. A second run is recorded
separately. `measurement-blockage.txt` adds the exact blocked intervals and
asserts that the following bus remains still while the first boards.
`measurement-hour-repeat.txt` was recorded 3608.509 seconds after the first
run. Its trace hash matches, completing the playbook's hour-separated repeat.

| Event                                               | Delayed bus |          Following bus |
| --------------------------------------------------- | ----------: | ---------------------: |
| Queue at the delayed bus's opening stop, on arrival |          15 | 5 on its later arrival |
| Queue at the next stop, on arrival                  |          15 | 0 on its later arrival |
| Departure from the third visited stop               |     249.5 s |                256.5 s |

The revised final readout is about 23 seconds blocked. The following bus
reaches the clearance behind the boarding bus at second 226.75 and cannot
advance until second 249.5. The difference is 22.75 seconds, rounded to 23.
This interval occupies frames 240 to 325. The earlier seven-second departure
gap remains a valid model result but is no longer the on-screen verdict.
The raw trace is imported by the composition, and
`runs.ts` rejects a mismatch with `measurements.ts`.

Initial conditions are stated in `simulation.ts`. The two buses begin half a
route apart. The first has an imposed 35-second delay. Each stop gets 0.075
passengers per second on average. Boarding takes 2.5 seconds per passenger;
doors take 5 seconds; driving is capped at 8 metres per second for both.
These values are assumptions. The result changes when they change.

## Visible passenger pickup

`measurement-pickup.txt` records the same movement trace with assertions for
the revised cut. The following bus reaches stop 3 at modelled second 52.25,
which is frame 54, or 1.8 seconds. It picks up thirteen passengers and leaves
at second 89.75, frame 125. Its boarded count advances from two at frame 70
to ten at frame 110. The camera reveals the bus before it reaches this stop.
The later blocked interval and rounded 23-second verdict are unchanged.
