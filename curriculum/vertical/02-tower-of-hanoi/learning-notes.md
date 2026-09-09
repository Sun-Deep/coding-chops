# Learning notes

## The problem

Move a stack of disks from peg A to peg C. Move one disk at a time, and never
put a larger disk on a smaller one.

## The recursive move

To move `n` disks from `from` to `to`:

1. Move the top `n - 1` disks from `from` to `spare`.
2. Move disk `n` from `from` to `to`.
3. Move the `n - 1` disks from `spare` to `to`.

The base case returns when `n` is zero. It performs no disk move. In the code,
only `move(n, from, to)` changes a tower.

## Four plates

The measured run produces this order:

```text
1  disk 1  A -> B
2  disk 2  A -> C
3  disk 1  B -> C
4  disk 3  A -> B
5  disk 1  C -> A
6  disk 2  C -> B
7  disk 1  A -> B
8  disk 4  A -> C
9  disk 1  B -> C
10 disk 2  B -> A
11 disk 1  C -> A
12 disk 3  B -> C
13 disk 1  A -> B
14 disk 2  A -> C
15 disk 1  B -> C
```

After move eight, the largest plate is finished. The last seven moves rebuild
the three-plate tower above it.

## Work

The recurrence is `T(n) = 2T(n - 1) + 1`: two smaller tower moves and one move
for the largest disk. This gives `2^n - 1` moves. The cut ends on that cost
because short source code can still perform exponential work.

## What would make the animation wrong

The animation would be wrong if a disk moved on the base-case line, if a larger
disk landed on a smaller disk, if the peg arguments did not swap between the
two recursive calls, or if the active code line changed after the disk moved.
