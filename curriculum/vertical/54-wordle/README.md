# Wordle's best opener

VR54 is a fourteen-second Blender gameplay replay, composed at 1080 x 1920
and 30 fps. The main object is a physical Wordle board with the six-row,
five-column grid and the three-row keyboard. Real feedback colors and actual
candidate sets drive the demonstration.

The first play uses ADIEU against the historical answer TRACE. Its feedback
leaves 187 candidates. The board resets for the same hidden answer and ROATE
leaves three candidates. TRACE then solves the replay. The ending compares the
all-answer means, 123.4 for ADIEU and 60.1 for ROATE.

The example is one puzzle. The means come from the complete benchmark of
12,972 openers against 2,309 historical answers. They are different quantities
and the cut labels each. The replay is not today's NYT game or a screen recording
from its website. It does not claim the second guess is guaranteed to solve.

ROATE wins the one-step mean but cannot be an answer on this list. RAISE wins
when restricted to answer words. The creator's understanding and phone review
remain open. Nothing has been published or rescheduled.

## Reproduce

```sh
node --experimental-strip-types --no-warnings scripts/measure-wordle-game.mjs
bash scripts/blender/wordle/render.sh
npx remotion render src/index.ts VR54-Wordle out/vertical/vr54-wordle-blender.mp4
npx remotion still src/index.ts VR54-Cover out/vertical/vr54-wordle-cover.png
```

Blender lives at `/Applications/Blender.app`. The scene uses the Mac system Arial
Bold and Georgia Bold fonts, without copying those files into the repository.
All rendered frames and the scene video stay out of Git. The board source and
its shared frame timeline stay in Git. Generated assets live in `public/vr54/`.
