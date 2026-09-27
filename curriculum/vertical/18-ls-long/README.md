# Vertical 18: ls -l is seven columns

Status: blocked

Built, rendered and reviewed. The creator understanding check is still open.

## What it claims

One `ls -l` line is seven columns, and each one can be read: the type and the
chmod mode, the link count, the owner, the group, the size in bytes, the time it
last changed, and the name. The first ten characters are exactly what VR12
taught.

The size column lies to almost everybody the first time they meet it on a
folder. A folder holding a 10,485,760 byte file says 4096. That number is the
size of the folder's own list of names, kept in 4096-byte blocks, and has
nothing to do with what the names point at. 361 of the 363 folders in a fresh
Debian /usr say 4096.

## Why this topic

VR12, chmod, is the page's best vertical cut at 139K, with 140 shares, 303
follows and comments still asking permission questions days later. This is its
sequel with a new picture, not a rerun: a line everybody who has opened a
terminal has half read, decoded column by column, with the chmod digits as the
callback.

Picked after four misses in a row, on the working hypothesis in
[[reach-cliff-after-qr]]: the page is recommendable, the reels since QR were
tested on shrinking follower audiences and never widened, and the job now is a
reel with the highest ceiling available. Judge it at four days, not one. Under
15K at four days means momentum is the wrong explanation too.

## What is out of scope

The `total` line at the top of a multi-file listing, which is blocks rather
than bytes. The `@` and `+` macOS and ACL suffixes on the mode. What a hard
link is beyond "names pointing at it". `ls -h`. Why a folder's link count is two
plus its subfolders, which the script measures and the reel does not explain.
The six-month date rule is written on the date row as a note and not animated.

That a folder never shrinks after its files are deleted is measured and is the
catch in the caption, not a shot.
