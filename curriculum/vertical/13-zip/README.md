# Vertical 13: zip finds what you already said

Status: blocked

Built, rendered and reviewed. The creator understanding check is still open.

## What it claims

A zip is not a shrink ray. It reads the file once, and every time it reaches a
run of characters it has already seen, it writes down a pointer to the earlier
copy instead of the characters.

On a 1,035 byte log, 939 of those bytes are a copy of something earlier in the
same file. zlib's DEFLATE at level 9 writes it out as 177 bytes.

## Why this topic

Everybody has zipped a file. Almost nobody has been shown what the zip actually
did, and the usual explanation is the word "compression", which is a restatement
rather than a mechanism.

It is also the shape that carries this page. A large search space collapsing is
behind Dijkstra against A star at 1.4M and Selection Sort at 596K, and a file
collapsing onto itself is that shape with an object in the middle of it. The
same reasoning that picked VR12: a thing the viewer already owns, with a
mechanism hiding inside it.

A log is the fixture because the repetition is visible before any mechanism
runs. A stranger reading frame zero can see that most of the file is the same
few strings over and over, which is the whole claim, and they can see it without
being told.

## What is out of scope

Huffman coding, which is the second half of DEFLATE and the reason the 939 bytes
of copies do not map one to one onto the 858 bytes saved. The reel animates the
matching and reports the real output size, and never subtracts one from the
other. `measurements.md` carries the `Z_HUFFMAN_ONLY` run that shows matching is
the part worth the fourteen seconds.

Also out of scope: the 32K window, why compressing an already compressed file
does nothing, and the distinction between `zip` the container and DEFLATE the
encoder. Each is a second idea, and this cut has one.

## Files

| File                                  | What it is                                 |
| ------------------------------------- | ------------------------------------------ |
| `scripts/measure-zip.mjs`             | the measurement, and the source of figures |
| `src/vertical/13-zip/measurements.ts` | the figures, one module                    |
| `src/vertical/13-zip/lz77.ts`         | the parse, recomputed and asserted         |
| `src/vertical/13-zip/Sheet.tsx`       | the file as an object                      |
