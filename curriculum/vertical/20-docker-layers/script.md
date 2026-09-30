# Script

Status: blocked

No voiceover and no music. The narration is burned into the frame. Twenty-eight
words across 14 seconds.

| Frames  | Line                                           |
| ------- | ---------------------------------------------- |
| 6-52    | Same app. Two Dockerfiles.                     |
| 60-100  | Change one line of code.                       |
| 110-206 | A changed layer rebuilds every layer below it. |
| 230-290 | Here, nothing sits below it.                   |
| 298-414 | **Copy your code after the install.**          |

Line three is the rule, and the frame draws it while it is up: the changed
file flies into `COPY . .`, that step turns orange, and the orange runs down
through the install. Line four is the same rule on the other file, where the
changed file lands in the last step. The last line is what to do, not a
summary of what happened.

## On screen

```text
eyebrow     DOCKER BUILD CACHE
headline    Same app. One line changed. / One reinstalls 67 packages.
files       package*.json and server.js over each tower; server.js turns
            orange when it changes, and each COPY's files fly into it
towers      CODE FIRST and PACKAGES FIRST, one slab per Dockerfile step,
            each saying built, cached, input changed, ran again or base image
cascade     an orange line running down from the first changed step to the
            bottom of the tower
packages    67 squares, one per package, refilled in the accent when rerun
verdict     4.37 MB + 30 KB rebuilt, 67 packages / 30 KB rebuilt, 0 packages
diff        server.js line 11, the only change
provenance  docker 29.5.2 · node:22-slim · express 4.21.2 · 67 packages
```
