# Publishing

Not posted. The understanding check is open.

## Files

```text
reel     out/vertical/vr14-qr.mp4                1080x1920, 420 frames, 14.06 seconds
cover    out/vertical/vr14-qr-cover.png          1080x1920
crops    out/vertical/vr14-qr-cover-crop-1x1.png
         out/vertical/vr14-qr-cover-crop-3x4.png
```

## Facebook, Instagram and TikTok caption

```text
Blank 121 of a QR code's 841 squares and it still scans.

Blank 49 in a corner instead and it dies, because that square is how the scanner finds the code.

Code and measurements: github.com/Sun-Deep/coding-chops

#qrcode #encoding #algorithms #backend #softwareengineering
```

272 characters. The first line is 56, so the finding survives the cut Facebook
puts at about 100.

## YouTube Shorts title

```text
Blank 121 squares of a QR code. It still scans.
```

47 characters, so the whole claim is inside the truncation.

## YouTube Shorts description

Same two lines as the caption.

```text
Blank 121 of a QR code's 841 squares and it still scans.

Blank 49 in a corner instead and it dies, because that square is how the scanner finds the code.

Code and measurements: github.com/Sun-Deep/coding-chops

#qrcode #encoding #algorithms #backend #softwareengineering
```

## Checks

- [x] The whole caption is 272 characters, hashtags included
- [x] Two lines of prose, no paragraph re-explaining the mechanism
- [x] The surprise is inside the first 100 characters
- [x] Every number in the caption is in `measurements.ts`
- [x] The catch is named, in one sentence, and it was run rather than asserted
- [x] Five hashtags, lowercase, none of them the channel name
- [x] Title under 60 characters with the hook inside the first 40
- [x] No em dashes, no call to action, no question mark
- [x] The repository line is there

## Review

| Check               | Result                                        |
| ------------------- | --------------------------------------------- |
| duration            | 14.06s                                        |
| longest frozen hold | 0.47s, and it is the closing hold             |
| audio peak          | -4.4 dBFS                                     |
| audio mean          | -23.4 dBFS                                    |
| silence gaps        | none                                          |
| safe areas          | clear, symbol and band inside the rail        |
| cover crops         | both hold the headline, the code and the mark |
| measurement rerun   | byte identical                                |
