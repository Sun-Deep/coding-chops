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

## Why matching is the part worth animating

The same encoder with matching switched off (`Z_HUFFMAN_ONLY`) gets this file to
636 bytes. With matching on it gets to 177. Reported as two runs rather than as
a split of the saving, because the two mechanisms do not decompose additively:
Huffman after LZ77 is coding a different stream than Huffman alone.

## The output does not only grow

The script also compresses every prefix of the file, because the reel draws the
zip filling up while the log is read and the bar has to be measured at every
point it passes through rather than fitted between the two ends.

Two things fell out of that. The shape is the argument: the first three samples
grow one for one with the file, and then the file grows from 60 bytes to 90 and
the output does not move at all, because the whole of the second line was
already on the first.

And the output is one or two bytes _smaller_ at six of the samples than it was
fifteen bytes earlier. That is real rather than a fault. Huffman codes are
chosen per block from the frequencies of the whole block, so fifteen more bytes
can shift the distribution enough to encode everything before them a byte
cheaper. It is the same reason the finished 177 bytes are not the last sample
plus a remainder, and `lz77.ts` allows for it rather than asserting a rise.

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

# The output as it grows (deflateRaw of the first N bytes)
  after    0 bytes  ->    2 bytes
  after   15 bytes  ->   17 bytes
  after   30 bytes  ->   32 bytes
  after   45 bytes  ->   47 bytes
  after   60 bytes  ->   57 bytes
  after   75 bytes  ->   57 bytes
  after   90 bytes  ->   57 bytes
  after  105 bytes  ->   60 bytes
  after  120 bytes  ->   60 bytes
  after  135 bytes  ->   63 bytes
  after  150 bytes  ->   64 bytes
  after  165 bytes  ->   67 bytes
  after  180 bytes  ->   67 bytes
  after  195 bytes  ->   73 bytes
  after  210 bytes  ->   79 bytes
  after  225 bytes  ->   79 bytes
  after  240 bytes  ->   82 bytes
  after  255 bytes  ->   83 bytes
  after  270 bytes  ->   86 bytes
  after  285 bytes  ->   91 bytes
  after  300 bytes  ->   92 bytes
  after  315 bytes  ->   98 bytes
  after  330 bytes  ->  100 bytes
  after  345 bytes  ->  102 bytes
  after  360 bytes  ->  103 bytes
  after  375 bytes  ->  105 bytes
  after  390 bytes  ->  104 bytes
  after  405 bytes  ->  109 bytes
  after  420 bytes  ->  114 bytes
  after  435 bytes  ->  118 bytes
  after  450 bytes  ->  118 bytes
  after  465 bytes  ->  120 bytes
  after  480 bytes  ->  120 bytes
  after  495 bytes  ->  121 bytes
  after  510 bytes  ->  123 bytes
  after  525 bytes  ->  124 bytes
  after  540 bytes  ->  129 bytes
  after  555 bytes  ->  133 bytes
  after  570 bytes  ->  138 bytes
  after  585 bytes  ->  138 bytes
  after  600 bytes  ->  140 bytes
  after  615 bytes  ->  139 bytes
  after  630 bytes  ->  140 bytes
  after  645 bytes  ->  142 bytes
  after  660 bytes  ->  143 bytes
  after  675 bytes  ->  144 bytes
  after  690 bytes  ->  144 bytes
  after  705 bytes  ->  147 bytes
  after  720 bytes  ->  147 bytes
  after  735 bytes  ->  147 bytes
  after  750 bytes  ->  150 bytes
  after  765 bytes  ->  150 bytes
  after  780 bytes  ->  154 bytes
  after  795 bytes  ->  153 bytes
  after  810 bytes  ->  156 bytes
  after  825 bytes  ->  155 bytes
  after  840 bytes  ->  155 bytes
  after  855 bytes  ->  159 bytes
  after  870 bytes  ->  157 bytes
  after  885 bytes  ->  158 bytes
  after  900 bytes  ->  159 bytes
  after  915 bytes  ->  162 bytes
  after  930 bytes  ->  169 bytes
  after  945 bytes  ->  169 bytes
  after  960 bytes  ->  173 bytes
  after  975 bytes  ->  172 bytes
  after  990 bytes  ->  173 bytes
  after 1005 bytes  ->  175 bytes
  after 1020 bytes  ->  175 bytes
  after 1035 bytes  ->  177 bytes

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
