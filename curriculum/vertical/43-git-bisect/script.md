# Script

Status: blocked

No voiceover and no music. The narration is burned into the frame.

| Frames  | Line                                              |
| ------- | ------------------------------------------------- |
| 4-72    | Free shipping broke in one of 1,000 commits.      |
| 78-146  | One at a time, that's up to 998 checks.           |
| 152-228 | git bisect tests the middle / and rules out half. |
| 234-308 | Each answer halves what's left.                   |
| 316-414 | **One at a time: 362 checks. / git bisect: 10.**  |

## On screen

```text
headline   1,000 commits. / Which one broke it?
terminal   the real run as git printed it: git bisect start HEAD v1.0,
           git bisect run node test.mjs, each checkout, ok or FAIL, and
           "Bisecting: N revisions left"; then git show of the commit
           git names
scene      1,000 commits as glass cards with glowing code lines, a field
           of 20 rows of 50, oldest at the back, HEAD at the front left,
           each joined to its parent; rendered in Blender
labels     HEAD · broken and v1.0 · worked at the start; the hash of the
           commit under test, then ok or FAIL; the first bad commit
chips      CHECKS and LEFT TO TEST, from git's own lines
orange     the bug: HEAD, every card that failed, the FAIL lines, the
           commit git names and the line it changed
```
