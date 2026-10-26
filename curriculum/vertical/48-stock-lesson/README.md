# Vertical 48: Best Time to Buy and Sell Stock, voiced

Status: approved, posting 26 Oct 2026 at 8:45 PM.

## What it is

The first voiced, longer vertical cut, 100.4 seconds, teaching LeetCode
121 in the creator's own voice: the problem, why trying every pair is slow,
the one price worth remembering, the walk, what it saves, and the move to
keep.

## Why it exists

The creator wants reels people can learn a problem from, and wants to learn
each one while making it. Fourteen seconds holds one idea, not a lesson. So
this is a deliberate comparison, the only way the vertical standard allows
a cut past fifteen seconds: this cut against a 14-second silent cut of the
same problem (VR49), posted a week apart. The exception is recorded in
section 14 of `docs/vertical-format-standard.md`.

The problem is one the creator has already learned and narrated for the
horizontal episode, on purpose. The pilot tests the format, so the
material should not be the variable.

## How it is judged

Against VR49 and against the coding reels before it, at 15 minutes, 1 hour
and 24 hours: 3-second view rate, average watch time, completion, non-
follower share, and follows per 1,000 viewers. Follows decide it, since
growing the page is the goal and this format will reach fewer people by
design.

## Files

- `script.md`: the six stems to record
- `recording.md`: how to record them and where they go
- `understanding-check.md`: the creator gate
- `storyboard.md`: the look and one shot per stem
- `learning-notes.md`, `sources.md`: what is kept, what backs it
- `scripts/measure-stock.mjs` and `src/vertical/48-stock-lesson/measurements.ts`:
  the run behind every number

## Building it

The stems stay out of Git. To rebuild:

1. Put the six stems in `audio/master/`, and link them where Remotion looks:
   `ln -sfn ../../../curriculum/vertical/48-stock-lesson/audio/master public/narration/vertical/48-stock-lesson`
2. `node scripts/transcribe-narration.mjs curriculum/vertical/48-stock-lesson/audio`
   and `node scripts/stem-bounds.mjs curriculum/vertical/48-stock-lesson/audio`
   (only after a re-record; the captions and `stems.json` are committed)
3. `scripts/blender/stock/render.sh`
4. `npx remotion render src/index.ts VR48-Stock-Lesson out/vertical/vr48-stock-lesson.mp4`

`src/vertical/48-stock-lesson/timeline.ts` turns the captions into every
frame the reel uses, and the Blender export calls the same function, so the
pillars, the marks and the voice cannot drift apart.
