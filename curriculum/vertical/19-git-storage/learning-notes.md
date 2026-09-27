# Learning notes

## A commit stores snapshots, not changes

A blob is the full contents of a file, named by the SHA-1 of its contents. A
commit points at a tree, the tree points at one blob per file. Change one byte
and the file's contents are different, so it hashes to a new blob, and git
writes that new blob in full. Measured: two blobs of 10,240 bytes each,
`f40bcc8` and `05e7cf5`.

Loose objects are zlib compressed one by one, on their own: 5,138 and 5,119
bytes on disk. Neither knows about the other, so the 159 identical lines are
paid for twice.

`git diff` is computed when you ask for it, from two snapshots. It is not what
git stored. Here it is 130 bytes of + and - lines.

## Packing is where deltas happen

`git gc` (and push, clone and auto gc) writes a packfile. Inside a pack an
object can be stored as a delta: instructions to copy ranges from a base object
plus the bytes that are new. Measured with `git verify-pack -v`: `05e7cf5`, the
newer copy, is stored whole at 5,112 bytes; `f40bcc8`, the older, is a delta of
56 bytes of instructions, 68 in the pack with its header, whose base is
`05e7cf5`.

So after packing the newest version is the one kept whole. Old versions are
reconstructed from newer ones, which makes reading the current code the cheap
path and history the slower one. It is the opposite of "the original plus a
chain of changes".

## Why the fixture is built the way it is

Every line differs, so zlib cannot flatten the file to almost nothing, which
would make the loose sizes unrepresentative of a real text file. Names, emails
and dates are pinned, so every object id reproduces; two runs were byte
identical. The file is exactly 10,240 bytes so "10 KB" in the narration is
exact.
