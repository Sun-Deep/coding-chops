# Vertical 02: Tower of Hanoi code traversal

Status: approved

This 25-second cut follows the recursive JavaScript function and the same four
plates at once. The tower occupies the upper half of the frame. The code stays in
the lower half, with the active line, call depth and arguments updated on every
step.

## What it claims

The recursive solution does three things: solve the smaller left tower, move one
disk, then solve the smaller right tower. For four plates, that produces fifteen
legal moves.

## Scope

The cut shows the complete move order for four plates and ties each move to the
line that caused it. It also shows the two recursive calls that make the work
grow exponentially.

It does not prove that fifteen is the minimum, derive the closed form, compare the
iterative solution, or explain stack memory.

## Compositions

```text
VR02-Tower-Of-Hanoi   1080x1920, 750 frames, 30 fps, 25 seconds
VR02-Cover            1080x1920 still
```

```bash
npm run render:hanoi-reel
```
