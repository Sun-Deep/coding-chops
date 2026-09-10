# Publishing

Not ready to post. `script.md` is `Status: blocked`, the understanding check has
ten unticked boxes, and that gate is the creator's. The copy below is written
against the finished render and is ready when the gate opens.

Still outstanding: hearing the cut on a phone at feed size. The third
measurement run is done and is recorded in `measurements.md`; it moved the
sequential scan's time on the verdict frame from 140 ms to 151.

## Files

```text
reel     out/vertical/vr05-index-only-scan.mp4    1080x1920, 660 frames, 22.1s
cover    out/vertical/vr05-cover.png              1080x1920
cover    out/vertical/vr05-cover-crop-1x1.png     1080x1080, the TikTok grid
cover    out/vertical/vr05-cover-crop-3x4.png     1080x1440, the Instagram grid
```

The crops are the upload's proof that the cover was laid out against
`SQUARE_TOP` and `SQUARE_BOTTOM` rather than against the full 1920. Both come
from `scripts/crop-cover.sh`, which derives them from the input rather than
hardcoding the offsets. Only the 9:16 file is uploaded; the crops exist so the
grids can be checked before it is.

## Facebook, Instagram, TikTok caption

```text
The index was there. Postgres still read 69,211 of the table's 123,457 pages.

Finding the rows cost 88 page reads. Fetching them cost the rest, because they sit scattered across the table. Put amount in the index and it reads 281.

The catch is VACUUM. Skip it after an update and it falls back to 70,103 pages. It is also 215 MB against 66.

Code and measurements: github.com/Sun-Deep/coding-chops

#postgres #database #sql #backend #softwareengineering
```

Four hundred and fifty-five characters. The finding closes at seventy-six, so
all of it clears Facebook's cut before "more".

The mechanism sentence splits the cost in two on purpose. Finding the rows was
88 page reads. Fetching them was everything else. Most people picture an index
scan as the first half and price it accordingly.

The first draft ran to 565 characters against the playbook's ceiling of about
450. It lost the difference in the mechanism paragraph, which was restating what
the reel already shows.

## YouTube Shorts title

```text
With an index, Postgres still reads half the table
```

Forty-nine characters. The whole surprise closes at thirty-nine, inside the
forty a phone shows, which is why the title carries "half the table" rather than
69,211. The exact figure needs six characters that would push the hook past the
cut, and it is the first line of the caption anyway.

## Checklist

- [x] First 100 characters carry the surprise
- [x] Every figure in the caption is in `measurements.ts`
- [x] The catch is named
- [x] Five hashtags, none the channel name
- [x] Title under 60 characters, hook inside the first 40
- [x] No em dashes, no call to action, no question mark
- [x] Repository line present
