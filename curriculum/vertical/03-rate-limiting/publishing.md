# Publishing

Written to step 8 of [the playbook](../../../docs/vertical-cut-playbook.md).
Every number is in `src/vertical/03-rate-limiting/measurements.ts` and came off
the run in `measurements.md`.

## The files

| Field      | Value                                      |
| ---------- | ------------------------------------------ |
| Video      | `out/vertical/vr03-rate-limiting.mp4`      |
| Cover      | `out/vertical/vr03-cover.png`              |
| Runtime    | 23 seconds                                 |
| Resolution | 1080 x 1920, 30 fps                        |
| Audio      | Sound effects only, no music, no voiceover |
| Subtitles  | Burned in. Do not upload a caption file.   |

## Facebook caption

Instagram and TikTok take the same text.

```text
A limit of 100 requests a minute let 200 through in two seconds.

Fixed window resets the counter on the clock, so 100 at 0:59 and 100 at 1:00 are two different windows. A sliding window log catches it, and costs 1,208 bytes per user instead of 48.

A token bucket gets within 3 for 64 bytes. That is why everyone runs one.

Code and measurements: github.com/Sun-Deep/coding-chops

#ratelimiting #api #backend #systemdesign #softwareengineering
```

The first line is 64 characters, so the whole finding survives the cut at about
100 where Facebook hides the rest behind "more".

## YouTube Shorts title

```text
100 requests a minute. 200 got through in two seconds.
```

54 characters. The contradiction is complete by character 40, which is where a
phone truncates it.

## Hashtags

`#ratelimiting` is the exact technique, `#api` the subject area, `#backend` the
role who searches for it, `#systemdesign` the second subject tag in place of a
language, and `#softwareengineering` the broad one. There is no query surface
here, so slot 3 takes a second subject per the playbook.

## What is deliberately absent

No call to action. No "which one do you use", which is the question this post
would get anyway and does not need to ask for.

The caption names the token bucket's cost as well as its win. A post that stops
at "fixed window is broken" sends people to the sliding window log, and they
meet the 115 MB in production.
