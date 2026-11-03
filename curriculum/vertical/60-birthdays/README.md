# A class of 23

VR60 is a fourteen-second Blender cut, composed at 1080 x 1920 and 30 fps.
A classroom from above and in front: 23 students stand in a ring facing the
camera, each with their birthday over their head. A string is drawn on the
floor between every pair of them, faster and faster, until 253 strings make
a web. One string turns orange: students 6 and 18 were both born on 12
November, and both raise a hand. The camera rises and the room is one of 100
classrooms, each with its own 23 and its own web. Every room where two share
a birthday lights an orange border, nearest first, until 53 of the 100 are
lit. The ending gives the exact chance, 50.7%.

The point the picture makes is the strings. Nobody needs to share your
birthday; any two of the 23 will do, and 23 people make 253 pairs.

## What the numbers are

Birthdays are drawn uniformly from 365 days, no 29 February, from a seeded
generator. The 100 rooms are 100 such classes; the first room is the first
of them with exactly one shared pair, picked after all 100 were drawn, so
the 53 is not changed by the choice. The 50.7% is the exact probability
1 - (365 x 364 x ... x 343) / 365^23, and a million simulated classes give
50.8%. Real birthdays are not quite uniform, which makes a match slightly
more likely, not less.

## Reproduce

```sh
node scripts/measure-birthdays.mjs curriculum/vertical/60-birthdays/runs/birthdays.json
bash scripts/blender/birthdays/render.sh
npx remotion render src/index.ts VR60-Birthdays out/vertical/vr60-birthdays.mp4
npx remotion still src/index.ts VR60-Cover out/vertical/vr60-birthdays-cover.png
```

Characters are Quaternius's CC0 pack in `third_party/quaternius-characters`.
Renders stay out of Git.
