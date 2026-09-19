# Publishing

Not posted. The understanding check is open.

## Files

```text
reel     out/vertical/vr14-qr.mp4                1080x1920, 420 frames, 14.06 seconds
cover    out/vertical/vr14-qr-cover.png          1080x1920
crops    out/vertical/vr14-qr-cover-crop-1x1.png
         out/vertical/vr14-qr-cover-crop-3x4.png
```

## The code in the video is live

The symbol encodes `https://github.com/Sun-Deep/coding-chops` and the finished
reel scans. Frames pulled out of the mp4 at 2.0, 3.3, 4.3, 5.3, 6.7, 8.7, 10.0,
11.3, 12.7 and 13.8 seconds all decode to that URL, including the ones with the
hole fully open. The only frames that do not are the twenty-two during the scan
sweep, where an orange wash is drawn over the code on purpose.

The cover and both grid crops scan too, so the thumbnail sitting in the profile
grid is itself a working link to the repository.

Nobody will think to try unless they are told. A pinned first comment saying so
is the cheapest way to turn that into traffic, and it is a creator call rather
than something that belongs in the caption, which is already at its ceiling.

## Facebook, Instagram and TikTok caption

```text
Blank 256 of a QR code's 1,369 squares and it still scans.

Blank 49 in a corner instead and it dies, because that square is how the scanner finds the code.

Code and measurements: github.com/Sun-Deep/coding-chops

#qrcode #encoding #algorithms #backend #softwareengineering
```

274 characters. The first line is 58, so the finding survives the cut Facebook
puts at about 100.

## YouTube Shorts title

```text
Blank 256 squares of a QR code. It still scans.
```

47 characters, so the whole claim is inside the truncation.

## YouTube Shorts description

Same two lines as the caption.

```text
Blank 256 of a QR code's 1,369 squares and it still scans.

Blank 49 in a corner instead and it dies, because that square is how the scanner finds the code.

Code and measurements: github.com/Sun-Deep/coding-chops

#qrcode #encoding #algorithms #backend #softwareengineering
```

## Checks

- [x] The whole caption is 274 characters, hashtags included
- [x] Two lines of prose, no paragraph re-explaining the mechanism
- [x] The surprise is inside the first 100 characters
- [x] Every number in the caption is in `measurements.ts`
- [x] The catch is named, in one sentence, and it was run rather than asserted
- [x] Five hashtags, lowercase, none of them the channel name
- [x] Title under 60 characters with the hook inside the first 40
- [x] No em dashes, no call to action, no question mark
- [x] The repository line is there, and the symbol encodes it

## Review

| Check               | Result                                                     |
| ------------------- | ---------------------------------------------------------- |
| duration            | 14.06s                                                     |
| longest frozen hold | 0.63s, and it is the closing hold                          |
| audio peak          | -3.9 dBFS, the loudest of the run, no clipping             |
| audio mean          | -23.0 dBFS                                                 |
| silence gaps        | none                                                       |
| safe areas          | clear, symbol, strip and ladder inside the rail            |
| cover crops         | both hold the headline, the code and the mark              |
| measurement rerun   | byte identical                                             |
| rendered reel scans | every frame outside the scan sweep decodes to the repo URL |
| cover scans         | 9:16, 1:1 and 3:4 all decode to the repo URL               |
