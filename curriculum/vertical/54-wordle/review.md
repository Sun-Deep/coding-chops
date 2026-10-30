# Blender rebuild review

The earlier score-display render was rejected. This file covers its replacement,
a Blender gameplay replay. It is not marked publish-ready.

## Verified before rendering

- The actual prior SQL, OFFSET and Gangnam compositions were reviewed as frame
  sequences. The new cut uses the same Blender scene and Remotion overlay split.
- The board contains six rows, five columns and a three-row keyboard. Enter and
  backspace occupy the outer keys on the third row.
- The hidden answer TRACE belongs to the historical list. ADIEU's 10010 feedback
  leaves 187 candidates. ROATE's 10212 feedback leaves STARE, TRACE and TRADE.
- The gameplay measurements match the complete benchmark's recorded histograms.
- All 420 frame states were checked for board shape, valid feedback values,
  finite flip angles, candidate counts, the keyboard reset, and the winning row.
- The original exhaustive average measurements are unchanged. They were checked
  by two scorers and repeated more than an hour apart in the first revision.
- The green/yellow/gray game colors are an episode-only exception requested by
  the creator. They encode actual feedback, not branding or decorative lanes.

## Export review

Blender rendered all 420 frames at 1440 x 1200. The scene video is composed at
1080 x 1920, 30 fps, with fourteen video seconds. The AAC container runs
14.058667 seconds. The encoded mix peaks at -5.085511 dBFS.

The entire sequence was reviewed as extracted frames. Each of the six narration
intervals was inspected at its start, midpoint and end. The opening, the three
remaining candidates and the final mean comparison were checked under the shared
safe-area overlay. The header is drawn above the scene fade so its lower edge
stays intact. Reading content clears the platform reserves and lower right rail.

The cover was inspected at 9:16, 1:1 and 3:4. The complete board, result and
lockup survive both crops. Typecheck, lint and curriculum validation pass, as
does formatting for the Wordle source and notes. Thirteen pre-existing formatting
warnings elsewhere in the repository were left alone.

The deliverable is `out/vertical/vr54-wordle-blender.mp4`. The rejected draft at
`out/vertical/vr54-wordle.mp4` is retained separately. This review does not claim
a physical phone or headphone listen; those remain the creator's checks below.

The result is an authored Blender replay. It is not a screen recording of the
NYT website, whose URL was blocked by the computer-use tool.

## Creator checks

- [ ] Pass the understanding check, including the example-versus-average distinction.
- [ ] Watch the complete Blender cut on a phone, muted.
- [ ] Watch it with sound and check the effects on the phone and headphones.
- [ ] Approve the script and final cut after those checks.
