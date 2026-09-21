# Publishing

Not posted. The understanding check is open.

## Files

```text
reel     out/vertical/vr15-cron.mp4                1080x1920, 420 frames, 14.06 seconds
cover    out/vertical/vr15-cron-cover.png          1080x1920
crops    out/vertical/vr15-cron-cover-crop-1x1.png
         out/vertical/vr15-cron-cover-crop-3x4.png
```

## Facebook, Instagram and TikTok caption

```text
Five stars in a cron line is 525,600 runs a year. Pin a field and it drops to 8,760.

Set the day and the weekday together and cron ORs them: 0 9 5 * 1 runs on the 5th and every Monday.

Code and measurements: github.com/Sun-Deep/coding-chops

#cron #linux #devops #backend #softwareengineering
```

294 characters. The first line is 84, so the finding survives the cut Facebook
puts at about 100.

## YouTube Shorts title

```text
Five stars in a cron line is 525,600 runs a year
```

48 characters, so the whole claim is inside the truncation.

## YouTube Shorts description

Same two lines as the caption.

```text
Five stars in a cron line is 525,600 runs a year. Pin a field and it drops to 8,760.

Set the day and the weekday together and cron ORs them: 0 9 5 * 1 runs on the 5th and every Monday.

Code and measurements: github.com/Sun-Deep/coding-chops

#cron #linux #devops #backend #softwareengineering
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
- [x] The repository line is there

## Review

| Check               | Result                                            |
| ------------------- | ------------------------------------------------- |
| duration            | 14.06s                                            |
| longest frozen hold | none anywhere in the cut                          |
| audio peak          | -4.9 dBFS                                         |
| audio mean          | -23.2 dBFS                                        |
| silence gaps        | none                                              |
| safe areas          | clear, slots, grid and list inside the rail       |
| cover crops         | both hold the headline, the schedule and the mark |
| measurement rerun   | byte identical                                    |
