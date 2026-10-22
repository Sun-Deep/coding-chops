# Vertical 41: one coin is lighter

Status: posted 2026-10-20

Nine identical-looking coins. Exactly one is lighter, and every other coin has
the same mass. An equal-arm balance identifies the lighter coin in two
weighings, whichever position it occupies.

The first weighing compares three coins with three. The higher pan contains
the lighter coin; a balanced result points to the three left out. Repeat with
one coin on each pan and one left out.

The shown run follows the middle input coin, chosen by rule. The first weighing
tips, and the second balances. The unweighed coin is revealed at the end.

## Why this topic

The viewer can solve a small physical puzzle while the algorithm runs. The
scale, coins and changing candidate group carry the explanation. The second
weighing leaves the answer unresolved until near the end of fourteen seconds.

## Build

The creator approved the full cut on 19 October 2026 and asked for more realistic
coins and handling. The coins now have thin reeded edges, a raised portrait,
lettering and wreaths. Tweezers carry them between the table and the pans. The
answer turns towards the camera while staying supported on the table.

The understanding check belongs to the creator and remains unticked.

```bash
node --experimental-strip-types --no-warnings scripts/measure-coin-puzzle.mjs
node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs scripts/check-coin-motion.mjs
bash scripts/build-sfx.sh coin-clink coin-handle scale-release coin-turn
bash scripts/blender/coins/render.sh
npx remotion render src/index.ts VR41-Coin-Puzzle out/vertical/vr41-coin-puzzle.mp4
npx remotion still src/index.ts VR41-Cover out/vertical/vr41-cover.png
```

`VR41-Coin-Puzzle` is 1080 by 1920, 420 frames at 30 fps. The preview compositions
remain available in Remotion's Review folder.

## Scope

This is the known-lighter variant. It does not solve the case where the
exceptional coin might be heavier or lighter. It teaches divide and conquer
with three possible weighing outcomes, rather than binary search on sorted
values. The balance's angle communicates direction, not the size of a mass
difference. The coin transfers are instructional animation, not a rigid-body
simulation or an actual balance experiment.
