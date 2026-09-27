# Vertical 19: git stores the whole file

Status: blocked

Built, rendered and reviewed. The creator understanding check is still open.

## What it claims

Commit a 10,240 byte file, change one line, commit again. Git does not store
the change. It stores a second complete copy of the file, 5,119 bytes after
zlib, next to the first one's 5,138, for a diff of 130 bytes. 159 of the 160
lines are identical and stored twice.

Then `git gc` packs the repository, and the one people have backwards: the new
copy stays whole, 5,112 bytes, and the old copy becomes a 68-byte delta
against it. To rebuild the old version git takes the new one and puts the old
line 80 back.

## Why this topic

Git is this page's biggest subject: 10 Git Commands did 1.7M and merge against
rebase did 208K. Every one of those was commands. How git stores a change has
never been on the page, and nearly every viewer has typed `git commit` and
assumed it saves the lines they changed.

It is also the test reel for [[reach-cliff-after-qr]]. The readout is the first
15 minutes and first hour of views against the hits' 300 and 1,100 and the
misses' 150 to 180 and 340 to 620, ideally with the QR reel archived first.

## What is out of scope

Trees and commits as objects, which the script lists and the reel does not
draw. Why git picked the new copy as the base (the pack heuristic sorts by
type, name and size and prefers recent objects as bases); the reel shows the
result and names it. Packing on push and clone, auto gc thresholds, and
`git repack` options. Large files and why git is bad at binaries.
