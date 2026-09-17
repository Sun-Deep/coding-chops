# Script

Status: published

No voiceover and no music. The narration is burned into the frame. Twenty-seven
words across 14 seconds.

| Frames  | Line                                 |
| ------- | ------------------------------------ |
| 6-68    | chmod 755. You have typed it.        |
| 80-142  | Each digit is three switches.        |
| 154-216 | Read 4. Write 2. Run 1.              |
| 228-300 | Throw one. Watch the number.         |
| 312-412 | **512 combinations. Four do 99.7%.** |

## On screen

```text
eyebrow    FILE PERMISSIONS
command    chmod 755        (live: it follows the dials)
labels     YOU      GROUP      EVERYONE
dials      7        5          5
switches   r w x    r w x      r w x
weights    4 + 2 + 1   with the off ones struck through
sums       = 7      = 5        = 5
list       644  rw-r--r--  a file you edit          56.3%
           444  r--r--r--  a file nobody edits      22.2%
           755  rwxr-xr-x  a program anyone runs    17.6%
           555  r-xr-xr-x  a program nobody edits    3.6%
total      512 POSSIBLE · FOUR COVER 99.7% OF 4,572 FILES
```

The command is live rather than a caption. Frame zero is `chmod 755` in the
largest type in the frame, which is what every cut this channel has published
above 275,000 views does, and it keeps up with the lock instead of sitting over
it.

## Sound

A lock being worked, and nothing else. Every cue is a switch arriving, a digit
going past on a spinning drum, or a switch being thrown. Frames come out of
`beats.ts`, which the picture reads too.

Every number comes from `measurements.ts` and the committed measurement run.
