# Measurements

First complete scoring run: 2026-10-30T12:29:37.625Z.
Machine: Apple M5 Pro, darwin 25.5.0,
arm64, Node v22.14.0.

```sh
node scripts/measure-wordle.mjs curriculum/vertical/54-wordle/runs/first.json --write-module
```

The script reads the frozen fixture, checks uniqueness and answer membership,
then scores all 29,952,348 guess-answer pairs. A separate string scorer checks
18,472 repeated-letter and ordinary cases. Every histogram sums
to the full answer count. The mean is the integer sum of squared bucket sizes
divided by 2,309. Display values round to one decimal place.

| Guess | Rank | Exact numerator | Mean remaining |
| ----- | ---: | --------------: | -------------: |
| ADIEU | 1725 |          285015 | 123.4365526202 |
| AUDIO | 5633 |          423045 | 183.2156777826 |
| CRANE |   90 |          181687 |  78.6864443482 |
| SLATE |   26 |          164589 |  71.2815071460 |
| RAISE |    2 |          140259 |  60.7444781291 |
| ROATE |    1 |          138845 |  60.1320918146 |

`runs/first.json` holds all ranks, the selected full histograms, source revision,
input hashes, machine, start time and scoring time. `runs/module.json` is an
additional execution that generated the frame replay. The source module holds
the selected figures and prefix means; shots import it rather than copy them.

The all-correct bucket counts as one known answer. Answers are equally likely.
The test does not remove previously published answers. ROATE is absent from the
answer fixture; RAISE is the best opener within that fixture.

The hour-apart repeat began at 2026-10-30T13:30:17.395Z, 3639.770 seconds
after the first run. Its complete ranking digest and selected feedback histograms
match the first run exactly. The independent string scorer also matched every
rank. Runtime does not appear in the video.

Complete ranking SHA-256: `9e09250e4d6709f1c434dc8e36949eeecf830aa6532397c734e033e8057a9101`.

The first run retains every ranking row. The later runs retain the selected
full histograms and a hash of the complete ranking. Reproduce them with:

```sh
node scripts/measure-wordle.mjs curriculum/vertical/54-wordle/runs/module.json --write-module --summary
node scripts/measure-wordle.mjs curriculum/vertical/54-wordle/runs/reference.json --reference --summary
node scripts/measure-wordle.mjs curriculum/vertical/54-wordle/runs/hour-apart.json --summary
```

## Gameplay replay

`runs/gameplay.json` records the full candidate sets for the historical answer
TRACE. `scripts/measure-wordle-game.mjs` reproduces it and generates
`src/vertical/54-wordle/gameplay.ts`. The example counts match the selected
feedback histograms in the complete original run. Each partial flip's count is
also measured by filtering the answer list on the revealed feedback prefix.

```sh
node --experimental-strip-types --no-warnings scripts/measure-wordle-game.mjs
```

ADIEU leaves 187 candidates. ROATE leaves three, STARE, TRACE and TRADE. The
second-row TRACE guess completes the replay. These are per-puzzle counts, not
the all-answer averages shown at the end.
