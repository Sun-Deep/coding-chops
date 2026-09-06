# Publishing

Written to step 8 of [the playbook](../../../docs/vertical-cut-playbook.md).
Every number here is in
`src/vertical/01-database-index/measurements.ts` and came off the run in
`measurements.md`.

## The files

| Field      | Value                                      |
| ---------- | ------------------------------------------ |
| Video      | `out/vertical/vr01-database-index.mp4`     |
| Cover      | `out/vertical/vr01-cover.png`              |
| Runtime    | 27 seconds                                 |
| Resolution | 1080 x 1920, 30 fps                        |
| Audio      | Sound effects only, no music, no voiceover |
| Subtitles  | Burned in. Do not upload a caption file.   |

Rebuild both with `npm run render:reel`.

## Facebook caption

Instagram and TikTok take the same text. One caption, four places.

```text
Without an index, Postgres reads all 10,000,000 rows to find one.

With a b-tree it reads three pages, then the row. Same query, same machine. 104 ms against 0.03 ms.

That index adds 214 MB to a 498 MB table and makes inserts 3x slower.

#postgres #database #sql #backend #softwareengineering
```

The first line runs 65 characters, so it survives the cut at about 100 where
Facebook hides the rest behind "more".

## YouTube Shorts title

```text
10,000,000 rows, no index. Postgres reads every one.
```

52 characters. The number lands at 1 and "index" at 18, both inside the 40 a
phone shows.

No `#Shorts` tag. YouTube detects a Short from the aspect ratio and the length.

## What is deliberately absent

No call to action. No "follow for more", no "which database do you use", no
question the post does not want answered.

The cut ends on what an index costs rather than on the speedup, and the caption
does the same. An index post that stops at 3,400x teaches people to add indexes,
which is the wrong lesson and the one they will be undoing later.
