# Script

Status: blocked

No voiceover and no music. The narration is burned into the frame. Twenty-seven
words across 14 seconds.

| Frames  | Line                               |
| ------- | ---------------------------------- |
| 6-54    | Commit a 10 KB file.               |
| 62-124  | Change one line.                   |
| 142-240 | Git stores the whole file again.   |
| 246-308 | Then git gc packs the repo.        |
| 318-414 | **The old copy becomes 68 bytes.** |

## On screen

```text
eyebrow     HOW GIT STORES A CHANGE
headline    Change one line. / Git stores the whole file.
file        config.txt, 10,240 B, the real 160 lines, line 80 marked
store       .git/objects, each copy drawn to scale by its bytes on disk
terminal    git commit, git diff with the real - and + line, git commit,
            git gc, git verify-pack -v with the two blob rows
card        to rebuild v1: take v2, put back line 80 = 44a7db096b15d190…
```

The headline says "stores the whole file", and the store label says "whole
file" beside 5,138 B, so nobody is told the full 10,240 bytes sit on disk
uncompressed.
