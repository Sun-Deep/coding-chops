# Publishing

Not posted. The understanding check is open.

## Files

```text
reel     out/vertical/vr13-zip.mp4                1080x1920, 420 frames, 14.06 seconds
cover    out/vertical/vr13-zip-cover.png          1080x1920
crops    out/vertical/vr13-zip-cover-crop-1x1.png
         out/vertical/vr13-zip-cover-crop-3x4.png
```

## Facebook, Instagram and TikTok caption

```text
2,080 bytes of logs zip to 678, because 1,867 of those bytes were already on the page.

Zip compresses each file on its own, so the second log gets nothing for matching the first.

Code and measurements: github.com/Sun-Deep/coding-chops

#zip #compression #algorithms #backend #softwareengineering
```

297 characters. The first line is 86, so the finding survives the cut Facebook
puts at about 100.

## YouTube Shorts title

```text
2,080 bytes of logs zip down to 678 bytes
```

41 characters, so the whole claim is inside the truncation.

## YouTube Shorts description

Same two lines as the caption.

```text
2,080 bytes of logs zip to 678, because 1,867 of those bytes were already on the page.

Zip compresses each file on its own, so the second log gets nothing for matching the first.

Code and measurements: github.com/Sun-Deep/coding-chops

#zip #compression #algorithms #backend #softwareengineering
```

## Checks

- [x] The whole caption is 297 characters, hashtags included
- [x] Two lines of prose, no paragraph re-explaining the mechanism
- [x] The surprise is inside the first 100 characters
- [x] Every number in the caption is in `measurements.ts`
- [x] The catch is named, in one sentence, and it was run rather than asserted
- [x] Five hashtags, lowercase, none of them the channel name
- [x] Title under 60 characters with the hook inside the first 40
- [x] No em dashes, no call to action, no question mark
- [x] The repository line is there

## Review

| Check               | Result                                         |
| ------------------- | ---------------------------------------------- |
| duration            | 14.06s                                         |
| longest frozen hold | 0.07s                                          |
| audio peak          | -4.8 dBFS                                      |
| audio mean          | -23.1 dBFS                                     |
| silence gaps        | one, 0.45s, the closing hold                   |
| safe areas          | clear, card and bars stop at the rail edge     |
| cover crops         | both hold the headline, the sheet and the mark |
| measurement rerun   | byte identical                                 |
