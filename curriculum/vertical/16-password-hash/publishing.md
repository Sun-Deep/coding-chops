# Publishing

Not posted. The understanding check is open.

## Files

```text
reel     out/vertical/vr16-password-hash.mp4          1080x1920, 420 frames, 14.06 seconds
cover    out/vertical/vr16-password-hash-cover.png    1080x1920
crops    out/vertical/vr16-password-hash-cover-crop-1x1.png
         out/vertical/vr16-password-hash-cover-crop-3x4.png
```

## Facebook, Instagram and TikTok caption

```text
A site never stores your password. It stores 64 characters, and one changed letter leaves 3.

Two accounts with the same password get the same 64, so a real store salts every row.

Code and measurements: github.com/Sun-Deep/coding-chops

#sha256 #security #hashing #backend #softwareengineering
```

294 characters. The first line is 92, so the finding survives the cut Facebook
puts at about 100.

## YouTube Shorts title

```text
A site never stores your password, only 64 characters
```

53 characters, and the hook is inside the first 34.

## YouTube Shorts description

Same two lines as the caption.

```text
A site never stores your password. It stores 64 characters, and one changed letter leaves 3.

Two accounts with the same password get the same 64, so a real store salts every row.

Code and measurements: github.com/Sun-Deep/coding-chops

#sha256 #security #hashing #backend #softwareengineering
```

## Checks

- [x] The whole caption is 294 characters, hashtags included
- [x] Two lines of prose, no paragraph re-explaining the mechanism
- [x] The surprise is inside the first 100 characters
- [x] Every number in the caption is in `measurements.ts`
- [x] The catch is named, in one sentence, and it was run rather than asserted
- [x] Five hashtags, lowercase, none of them the channel name
- [x] Title under 60 characters with the hook inside the first 40
- [x] No em dashes, no call to action, no question mark
