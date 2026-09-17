# Publishing

Posted.

## Files

```text
reel     out/vertical/vr11-text-search.mp4               1080x1920, 420 frames, 14.06 seconds
cover    out/vertical/vr11-text-search-cover.png         1080x1920
crops    out/vertical/vr11-text-search-cover-crop-1x1.png
         out/vertical/vr11-text-search-cover-crop-3x4.png
```

## Facebook, Instagram and TikTok caption

```text
Ctrl+F. A straight scan looks at 2,390 characters. Boyer-Moore looks at 371.

Horspool throws away the good-suffix table and still looks at only 389.

Code and measurements: github.com/Sun-Deep/coding-chops

#stringsearch #algorithms #javascript #backend #computerscience
```

271 characters. The first line is 76, so the finding survives the cut
Facebook puts at about 100.

## YouTube Shorts title

```text
Boyer-Moore read 371 characters of 2,400
```

40 characters, so the whole claim is inside the truncation.

## YouTube Shorts description

Same two lines as the caption.

```text
Ctrl+F. A straight scan looks at 2,390 characters. Boyer-Moore looks at 371.

Horspool throws away the good-suffix table and still looks at only 389.

Code and measurements: github.com/Sun-Deep/coding-chops

#stringsearch #algorithms #javascript #backend #computerscience
```

## Checks

- [x] The whole caption is 271 characters, hashtags included
- [x] Two lines of prose, no paragraph re-explaining the mechanism
- [x] The surprise is inside the first 100 characters
- [x] Every number in the caption is in `measurements.ts`
- [x] The catch is named, in one sentence, and it is measured rather than asserted
- [x] Five hashtags, lowercase, none of them the channel name
- [x] Title under 60 characters with the hook inside the first 40
- [x] No em dashes, no call to action, no question mark
- [x] The repository line is there
