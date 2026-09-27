# Script

Status: blocked

No voiceover and no music. The narration is burned into the frame. Thirty-two
words across 14 seconds.

| Frames  | Line                                             |
| ------- | ------------------------------------------------ |
| 6-74    | One ls -l line. Seven columns.                   |
| 86-140  | The first ten characters are chmod.              |
| 150-212 | Then links, owner, group, size, date, name.      |
| 228-298 | Almost every folder says 4096.                   |
| 312-414 | **That's its list of names. Not what's inside.** |

`ls -l` is set in the monospace everywhere it appears, headline and narration
included. In Inter a lowercase l is drawn like a capital I, and the first render
read "Is -l".

## On screen

```text
eyebrow     READING LS -L
headline    ls -l is seven columns. / 4096 isn't what's inside.
terminal    $ ls -l build.sh, then $ ls -ld logs, with the real line under it
            and GNU ls 9.1 · Debian 12 · ext4, 4096-byte blocks in its corner
key         seven rows, token on the left, what it is on the right
band        rwx r-x r-x as 7 5 5, handed to owner, group, everyone
            then 361 of 363 folders in Debian's /usr, one square each
            then $ ls -l logs and 4,096 against 10,485,760
```

The key is the part a viewer keeps. It stays on screen for the whole cut and is
complete in the last frame, so a screenshot of the end is the reference.
