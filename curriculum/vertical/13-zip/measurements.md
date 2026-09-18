# Measurements

Run with `node scripts/measure-zip.mjs`.

Machine: MacBook Pro, Darwin 25.5.0 arm64, Node v22.14.0, 2026-09-18.

## Two kinds of figure

The output size is exact and it is not ours. It comes off zlib's real DEFLATE,
the same encoder behind `zip`, `gzip` and every compressed response a browser
has ever received. Nothing in the script estimates it.

The parse is a demonstration. DEFLATE is two mechanisms stacked: LZ77 replaces a
run of bytes it has seen before with a pointer back to the earlier copy, and
Huffman then writes what is left in fewer bits. The reel animates the first one,
so the script performs its own LZ77 parse to know which spans are copies and
where each points, and proves it by expanding the token stream back out and
checking it is the input byte for byte.

That parse is _a_ valid parse rather than zlib's own. zlib uses lazy matching
and may split a run differently, so the 939 covered bytes describe the picture
the reel draws, not the bytes zlib emitted. It is used for the picture and never
for the byte count, and no frame subtracts one from the other.

## Drift

There is none by construction and it was still checked. The fixture is a literal
in the script rather than something generated or scanned, and no figure here is
a time, so nothing can move between runs or between machines. Run twice back to
back, the output was byte identical. This is the direct answer to VR12, whose
scan included this repository and drifted every time a file was added to the
project.

## Why matching is the part worth animating

The same encoder with matching switched off (`Z_HUFFMAN_ONLY`) gets this file to
636 bytes. With matching on it gets to 177. Reported as two runs rather than as
a split of the saving, because the two mechanisms do not decompose additively:
Huffman after LZ77 is coding a different stream than Huffman alone.

## Raw output

```text
# The file
lines                 20
bytes                 1035
distinct bytes        37

# LZ77 parse (this script, verified lossless)
tokens                135
  copies              39
  literals            96
bytes covered by copies 939  (90.7% of the file)
longest copy          51 bytes
longest back distance 879 bytes

# DEFLATE (zlib, exact)
raw                   1035 bytes
huffman only          636 bytes  (61.4%)
deflate -9            177 bytes  (17.1%)
gzip -9               195 bytes  (with header and checksum)
ratio                 5.85x
matching off          636 bytes
matching on           177 bytes

# Every copy, in order
  at   52  back   52  len  48  "2026-09-18 09:14:02 INFO  GET  /api/orders 200 1"
  at  101  back   52  len  21  "ms\n2026-09-18 09:14:0"
  at  123  back  104  len  29  " INFO  GET  /api/orders 200 1"
  at  153  back   52  len  29  "ms\n2026-09-18 09:14:03 INFO  "
  at  186  back  156  len  15  " /api/orders 20"
  at  205  back  156  len  21  "ms\n2026-09-18 09:14:0"
  at  227  back  208  len  29  " INFO  GET  /api/orders 200 1"
  at  257  back   52  len  23  "ms\n2026-09-18 09:14:04 "
  at  284  back  260  len  19  "  GET  /api/orders "
  at  307  back  155  len  22  "2ms\n2026-09-18 09:14:0"
  at  330  back  311  len  29  " INFO  GET  /api/orders 200 1"
  at  360  back   52  len  39  "ms\n2026-09-18 09:14:05 INFO  GET  /api/"
  at  401  back  362  len   4  "ers "
  at  405  back  363  len   5  " 200 "
  at  411  back  362  len  21  "ms\n2026-09-18 09:14:0"
  at  433  back   51  len  28  " INFO  GET  /api/users  200 "
  at  461  back  257  len  22  "8ms\n2026-09-18 09:14:0"
  at  483  back   51  len  18  "6 INFO  GET  /api/"
  at  501  back  361  len  34  "orders 200 12ms\n2026-09-18 09:14:0"
  at  542  back  361  len  18  " POST /api/orders "
  at  561  back  517  len   3  "00 "
  at  565  back  465  len  22  "1ms\n2026-09-18 09:14:0"
  at  588  back  569  len  51  " INFO  GET  /api/orders 200 14ms\n2026-09-18 09:14:0"
  at  640  back  413  len  51  " INFO  GET  /api/orders 200 13ms\n2026-09-18 09:14:0"
  at  691  back   52  len  18  "8 INFO  GET  /api/"
  at  709  back  310  len  33  "users  200 9ms\n2026-09-18 09:14:0"
  at  743  back  568  len  28  " INFO  POST /api/orders 201 "
  at  772  back  672  len  22  "1ms\n2026-09-18 09:14:0"
  at  794  back   52  len   8  "9 INFO  "
  at  802  back  672  len  43  "GET  /api/orders 200 12ms\n2026-09-18 09:14:"
  at  847  back  828  len  50  " INFO  GET  /api/orders 200 14ms\n2026-09-18 09:14:"
  at  897  back   52  len   3  "10 "
  at  900  back  620  len  16  "WARN  GET  /api/"
  at  916  back  517  len   7  "users  "
  at  923  back  620  len   4  "429 "
  at  927  back  671  len  21  "3ms\n2026-09-18 09:14:"
  at  950  back  879  len  50  " INFO  GET  /api/orders 200 11ms\n2026-09-18 09:14:"
  at 1000  back   52  len  31  "11 INFO  GET  /api/orders 200 1"
  at 1031  back  775  len   4  "3ms\n"
```
