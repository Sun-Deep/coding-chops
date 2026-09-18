# Vertical 13: zip finds what you already said

Status: blocked

Built, rendered and reviewed. The creator understanding check is still open.

## What it claims

A zip is not a shrink ray. It reads each file once, and every time it reaches a
run of characters it has already seen _in that file_, it writes down a pointer
to the earlier copy instead of the characters.

A folder with two days of logs in it is 2,080 bytes. 1,867 of those bytes are a
copy of something earlier in the same file. `zip -9` writes the folder out as
`logs.zip`, 678 bytes.

## Why this topic

Everybody has compressed a folder. Almost nobody has been shown what the zip
actually did, and the usual explanation is the word "compression", which is a
restatement rather than a mechanism.

It is also the shape that carries this page. A large search space collapsing is
behind Dijkstra against A star at 1.4M and Selection Sort at 596K, and a folder
collapsing onto itself is that shape with an object in the middle of it. Same
reasoning that picked VR12: a thing the viewer already owns, with a mechanism
hiding inside it.

## Why a folder rather than one file

The first build of this compressed a single file and showed the mechanism
correctly and completely. It did not look like zipping anything. Everything on
screen was the inside of the encoder and nothing was the household operation it
belongs to, so the subject is now a folder with a folder icon, and the output is
`logs.zip` with a zip icon, drawn to the same scale.

The change paid for itself twice. A zip compresses each member on its own, so
the second file starts with nothing behind it and the encoder has to spell it
out again from scratch. That is visible, it is audible, and it is the one thing
about zip most people have never been told. It is the same idea as the headline
rather than a second one: it can only point at what it has already said, and at
a new file it has not said anything yet.

## What is out of scope

Huffman coding, the second half of DEFLATE, and the reason the 1,867 bytes of
copies do not map onto the 1,402 bytes saved. The reel animates the matching and
reports the real archive size, and never subtracts one from the other.

Also out of scope: the 32K window, why compressing an already compressed file
does nothing, and that `tar.gz` beats `zip` on a folder of similar files because
it compresses the stream rather than the members. That last one is the caption's
catch. Each is a second idea, and this cut has one.

## Files

| File                                   | What it is                                   |
| -------------------------------------- | -------------------------------------------- |
| `scripts/measure-zip.mjs`              | the measurement, and the source of figures   |
| `src/vertical/13-zip/measurements.ts`  | the figures, one module                      |
| `src/vertical/13-zip/lz77.ts`          | the parse, per file, recomputed and asserted |
| `src/vertical/13-zip/Sheet.tsx`        | the member being compressed                  |
| `src/vertical/13-zip/ZipTarget.tsx`    | the folder and the archive                   |
| `src/vertical/13-zip/Substitution.tsx` | one match, at a size somebody can read       |
