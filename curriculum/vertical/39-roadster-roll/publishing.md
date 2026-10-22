# Publishing

Posted 2026-10-18 to Facebook. The understanding check is open.

## Files

```text
reel     out/vertical/vr39-roadster-roll.mp4                1080x1920, 420 frames, 14 seconds
cover    out/vertical/vr39-roadster-roll-cover.png          1080x1920
crops    out/vertical/vr39-roadster-roll-cover-crop-1x1.png
         out/vertical/vr39-roadster-roll-cover-crop-3x4.png
```

The two falls are rendered first with `scripts/blender/roadster/render.sh`.

## Facebook, Instagram and TikTok caption

```text
How Tesla's Roadster let go of an upside-down ramp and landed on its wheels.

Simulated from 5 m: no thrusters, the roof hits at 26 g. Thrusters roll it in 0.72 s, then brake at 2 g.

Code and measurements: github.com/Sun-Deep/coding-chops

#tesla #roadster #physics #simulation #engineering
```

291 characters. The first line is 76. The 26 g assumes 0.2 m of roof crush (11 to 51 g across
the crush depths swept); the 0.72 s and the 2 g assume braking thrust of
twice the car's weight. Tesla published none of the inputs; all are in
`measurements.md`. The backflip comparison (about 4 times the twist) no
longer fits the caption; it stays in the README for replies.

## YouTube Shorts title

```text
How did the Tesla Roadster land upright?
```

## What to read after posting

Whether a news topic, posted three days after the demo, reaches past the
followers the way the everyday topics did, and whether people ask about the
backflip.

## Checks

- [x] Caption under 300 characters, first line under 100
- [x] Two lines of prose, the catch named
- [x] Every number from the committed run
- [x] Five lowercase hashtags, no em dashes, no call to action
- [x] The repository line is there
