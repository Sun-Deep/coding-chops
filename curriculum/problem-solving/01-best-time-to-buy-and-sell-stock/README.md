# Episode 01: Best Time to Buy and Sell Stock

Status: ready to publish.

Both gates passed. The understanding check is complete, and the finished render
was watched from beginning to end on 2026-09-06.

The six prediction holds run short. Every one was authored at two seconds and
the takes give between 0.49 and 0.79, in acts 1, 3 and 5. Watched end to end
they play, so they ship as recorded. Recorded here because it was raised six
times during the build and the decision should be findable, not remembered.

## Learning objective

After the lesson, a beginner can take an array of prices, find the largest
profit from one buy and one later sell in a single pass, and say why the
cheapest price seen so far is the only thing worth remembering.

## Scope

LeetCode 121. One buy, one sell, sell strictly after buy, return 0 when no
profitable trade exists.

```text
[7, 1, 5, 3, 6, 4]  ->  5
```

It does not cover Kadane's algorithm, the maximum subarray framing, greedy or
dynamic programming as terminology, or the multi-transaction variants. The
array of day-to-day changes makes 121 and maximum subarray the same problem,
which is why this episode comes before that one and not after.

## Why this problem, third

The channel already has Two Sum and Valid Palindrome, which taught trading
space for time and walking two pointers. A third pointer trick teaches nothing
new. This one teaches a different move: you do not need every pair, you need to
remember the one thing that matters.

## Files

- `learning-notes.md`: research questions and the explanation as it settled
- `sources.md`: what backs the on-screen claims, and what is background only
- `understanding-check.md`: the creator comprehension gate
- `script.md`: the recorded narration, approved only once the check passes
- `storyboard.md`: the visual plan, and draft narration that is not approved
- `ink/`: captured graphite marks, per `docs/ink-format.md`
- `publishing.md`: title, description with chapters, and the social captions

## Renders

| File                                           | What it is               | Runtime |
| ---------------------------------------------- | ------------------------ | ------- |
| `out/ps01-best-time-to-buy-and-sell-stock.mp4` | The episode, for YouTube | 8:26    |
| `out/ps01-part-01.mp4`                         | Scenes 1 to 2            | 2:39    |
| `out/ps01-part-02.mp4`                         | Scenes 3 to 4            | 1:36    |
| `out/ps01-part-03.mp4`                         | Scenes 5 to 6            | 2:16    |
| `out/ps01-part-04.mp4`                         | Scenes 7 to 9            | 1:55    |

Rebuild the episode with `npm run render:ps01`. The parts come from the same
master composition with a frame range, so they are frame exact and each one
opens on a match cut. Ranges are in `publishing.md`.

Nothing in `out/` is committed.

## Publishing

| Field    | Value                                                         |
| -------- | ------------------------------------------------------------- |
| Title    | Best Time to Buy and Sell Stock \| LeetCode 121 for Beginners |
| Playlist | LeetCode, Problem Solving                                     |
| Category | Education, problem walkthrough, beginner                      |
| Runtime  | 8:26                                                          |
| Language | English (United States)                                       |

The description, the chapter list and the social captions are in
`publishing.md`. No affiliate slot on this episode, so no disclosure, no pinned
comment, and the paid-promotion box stays unchecked.

Subtitles are burned into the frame. Upload a caption file anyway, or YouTube
generates its own and a viewer with captions on sees two sets at once. Build it
with `node scripts/build-srt.mjs problem-solving/01-best-time-to-buy-and-sell-stock`.

### Playlist description

```text
You can follow a LeetCode solution line by line and still not be able to write it a week later. Reading the answer and working out how someone got there are different things, and most walkthroughs only do the first.

Every episode starts with the answer you would have reached for anyway, then works out what to throw away. No pattern names, no "this one is a sliding window". What you keep is the move, not the problem.

The animations are code. All of it is open: https://github.com/Sun-Deep/coding-chops
```

The track's visual contract is `docs/problem-solving-visual-language.md`.

## Scene map

Nine scenes, no affiliate slot, so no seam. Runtime targets are in section 18
of the visual contract.

```text
Scene01  what are we even trying to do        1:30
Scene02  try every pair                       1:10
Scene03  the same question, over and over     1:20
Scene04  compressing the past                 0:50
Scene05  the walk                             2:20
Scene06  the code                             1:50
Scene07  where it breaks                      0:50
Scene08  what it cost                         0:50
Scene09  the move you keep                    0:40
```

Scene01 is storyboarded. Scenes 02 to 09 exist as titles and runtime bands
only. Section 19 of the visual contract blocks Scene01's narration from locking
until the rest are drafted, because a later scene may need Scene01 to plant
something first.
