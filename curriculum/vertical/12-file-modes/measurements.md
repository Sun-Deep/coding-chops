# Measurements

```bash
node scripts/measure-file-modes.mjs
```

## The machine

```text
Apple M5 Pro, macOS 26.5.1, node v22.14.0
```

Nothing is timed, so the machine does not affect the arithmetic. It does affect
the distribution, which is why the roots are pinned and printed.

## Two kinds of figure, and they are not the same claim

The arithmetic is exact. Three octal digits, three bits each, worth 4, 2 and 1.
That is 512 modes, and the script does not assert it: it builds all 512, renders
each one to its `rwxrwxrwx` string, reads that string back to a number by weight
and position, and checks the two agree. Then it checks every digit from 0 to 7
is the sum of the bits that are on, which is the sentence the whole cut exists
to show.

The distribution is measured, on one disk. Which modes a filesystem carries is a
property of that filesystem. What does not move between machines is the shape: a
handful of the 512 cover almost everything, because almost every file is either
a document or a program.

## The fixture

```text
/usr/bin
/usr/lib
/etc
/usr/share/man
```

System directories only, and that is a correction rather than a choice. This
repository was in the scan first, and it made the figure drift: every file added
to the project moved the count, and the script's own assertion fired the moment
VR12's own source was written. A number that changes because somebody did
unrelated work is not a measurement. These four do not move between runs,
between hours, or because the tree is being worked on. Two consecutive runs
produce identical counts.

Only the low nine bits are counted. The fourth digit, which carries setuid,
setgid and the sticky bit, is masked off because the cut is about the three
digits people type and a fourth digit would be a second idea.

## The run

4,572 files and 127 directories. Nine distinct file modes of 512 possible.

| Mode | Symbolic  | Files | Share | Running |
| ---- | --------- | ----- | ----- | ------- |
| 644  | rw-r--r-- | 2,574 | 56.3% | 56.3%   |
| 444  | r--r--r-- | 1,016 | 22.2% | 78.5%   |
| 755  | rwxr-xr-x | 806   | 17.6% | 96.2%   |
| 555  | r-xr-xr-x | 163   | 3.6%  | 99.7%   |
| 600  | rw------- | 7     | 0.2%  | 99.9%   |
| 400  | r-------- | 2     | 0.0%  | 99.9%   |
| 440  | r--r----- | 2     | 0.0%  | 100.0%  |
| 511  | r-x--x--x | 1     | 0.0%  | 100.0%  |

Directories are 755 on 126 of 127.

The reel says "four cover 99.7%" and the script asserts that the top four clear
99.5, so the claim fails loudly rather than drifting quietly.

## The catch, run rather than described

```text
folder 755, file 644 -> read
folder 644, file 644 -> EACCES
```

A perfectly readable file, inside a folder that lost its execute bit, cannot be
read. On a directory `x` does not mean "run", it means "enter". The script makes
a temporary directory, writes a file at 644, reads it through a 755 folder and
then through a 644 folder, and asserts it gets exactly those two answers.

It is the caption's catch rather than the reel's, because it is a second idea.
