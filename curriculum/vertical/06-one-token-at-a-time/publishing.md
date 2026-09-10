# Publishing

Not ready to post. `script.md` is `Status: blocked`, the understanding check has
ten unticked boxes, and that gate is the creator's. The copy below is written
against the finished render and is ready when the gate opens.

Still outstanding: hearing the cut on a phone at feed size. The third
measurement run is done and is recorded in `measurements.md`; it changed nothing
that reaches a frame.

## Files

```text
reel     out/vertical/vr06-one-token-at-a-time.mp4   1080x1920, 780 frames, 26.0s
cover    out/vertical/vr06-cover.png                 1080x1920
cover    out/vertical/vr06-cover-crop-1x1.png        1080x1080, the TikTok grid
cover    out/vertical/vr06-cover-crop-3x4.png        1080x1440, the Instagram grid
```

Only the 9:16 file is uploaded. The crops exist so the profile grids can be
checked before it is, and both come from `scripts/crop-cover.sh`.

## Facebook, Instagram, TikTok caption

```text
You typed 6 tokens. The model received 25. The chat template wrapped it first.

All 25 go up through 36 layers and only the last one produces anything. 151,936 scored, one kept. Then again for the next token.

It does not re-read the conversation, it caches it. 36 KB a token, so 8,192 tokens is 288 MB, all read every time.

Code and measurements: github.com/Sun-Deep/coding-chops

#llm #machinelearning #transformers #backend #programming
```

Four hundred and forty characters. The finding closes at seventy-eight, so
all of it clears Facebook's cut before "more".

The first draft ran to 490 against the playbook's ceiling of about 450, and it
lost the difference in the mechanism paragraph, which is where it always goes:
that paragraph is the one tempted to re-explain what the reel has just shown.

The lead is the chat template rather than the 151,936, because it is the one
most people have never been told and it is concrete enough to land without
knowing what a token is. The bigger number does the work in the second
paragraph, where somebody who kept reading is already in.

The catch names the cache rather than a slowdown. Per-token time does grow with
the conversation, and it was measured at about 1.3 times across a 90 times
longer chat, which is real and would land as nothing next to 288 MB.

## YouTube Shorts title

```text
You type 6 tokens. The model receives 25.
```

Forty-one characters. The whole surprise is inside the first forty a phone
shows, which is why the title carries the template and not 151,936: the bigger
number needs seven characters and a noun before it makes sense.

## Measured on

Every figure is from a local open model, `qwen2.5-3b-instruct` through
llama.cpp, at temperature 0. Named in the reel's own receipt and worth repeating
to anyone who asks in the comments: no commercial model publishes its vocabulary
size, block count or logits, so the only honest way to put real figures on
screen is to measure one that does.

The mechanism is the same across transformers. Only the badge would have
differed, and the badge is the part that would have been false.

## Checklist

- [x] First 100 characters carry the surprise
- [x] Every figure in the caption is in `measurements.ts`
- [x] The catch is named
- [x] Five hashtags, none the channel name
- [x] Title under 60 characters, hook inside the first 40
- [x] No em dashes, no call to action, no question mark
- [x] Repository line present
