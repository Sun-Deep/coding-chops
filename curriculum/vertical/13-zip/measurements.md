# Measurements

Run with `node scripts/measure-zip.mjs`.

Machine: MacBook Pro, Darwin 25.5.0 arm64, Node v22.14.0, Info-ZIP 3.0, 2026-09-18.

## Three kinds of figure

The archive sizes are exact and they are not ours. They come off the real `zip`
binary, the same Info-ZIP behind Finder's Compress and every `zip` on a Unix
box. The per-file stored sizes are exact too and come out of the archive's own
central directory as `unzip -lv` reports it.

The parse is a demonstration. DEFLATE is two mechanisms stacked: LZ77 replaces a
run of bytes it has seen before with a pointer back to the earlier copy, and
Huffman then writes what is left in fewer bits. The reel animates the first one,
so the script performs its own LZ77 parse and proves it by expanding the token
stream back out and checking it is the input byte for byte.

Per file, and that is the point rather than a detail. A zip compresses each
member on its own with the window reset at every file boundary, so nothing in
`tue.log` may point at anything in `mon.log`. The parse runs twice for that
reason, and the reel shows it: when the second file comes up the arcs stop and
the encoder spells everything out again.

The parse is _a_ valid parse rather than zlib's own. zlib uses lazy matching and
may split a run differently, so the 1,867 copied bytes describe the picture the
reel draws, not the bytes the archive holds. No frame subtracts one from the
other.

## Drift

There is none by construction and it was still checked. The fixture is two
literals in the script rather than anything generated or scanned, and no figure
here is a time. Run twice back to back, the output was byte identical. This is
the direct answer to VR12, whose scan included this repository and drifted every
time a file was added to the project.

The archive's _bytes_ are not reproducible, because a zip stores modification
times. Its _size_ is, which is the only thing the reel prints.

## Two checks worth naming

Each member's prefix-deflate table ends exactly on what the archive stores for
that file, 175 and 195 bytes. That is asserted, and it is what licenses drawing
a bar out of zlib and labelling it with a figure that came out of `zip`: at
these settings the two are the same encoder.

And the archive built with only the first file is 383 bytes, which is the same
number the step-by-step run reports, so the bar's anchor points are real
archives somebody could have on disk rather than interpolations.

## Not all of an archive is compressed data

370 bytes of `logs.zip` are the two members. The other 308 are local headers,
the central directory and the folder entry. That is the honest shape of zipping
a folder of small files, and it is why the ratio is 3.07x rather than the 5.6x
the payload alone would suggest.

It also shows up in the reel as a visible step: the archive bar jumps about a
hundred bytes when the second file begins, before any of its content has been
read. That step is the header the archive pays for the file itself.

## What a zip cannot do

The two logs are the same shape and the archive gets nothing for it. One DEFLATE
over the pair is 287 bytes against the archive's 370 of member data, because
every member is compressed against its own window. This is why `tar.gz` beats
`zip` on a folder of similar files. It is in the caption as the catch and stays
out of the reel, which has one idea.

## Raw output

```text
# The folder
name                  logs/
  mon.log            1040 bytes
  tue.log            1040 bytes
raw total             2080 bytes

# The archive (Info-ZIP, -9 -X, exact)
logs.zip              678 bytes
  mon.log             175 bytes stored  (16.8% of 1040)
  tue.log             195 bytes stored  (18.8% of 1040)
compressed payload    370 bytes
zip structure         308 bytes  (headers, central directory, folder entry)
ratio                 3.07x

# The archive after each file
  through mon.log       383 bytes
  through tue.log       678 bytes

# LZ77 per file (this script, verified lossless)
mon.log
  tokens              143
  copies              40
  literals            103
  bytes copied        937  (90.1% of the file)
  longest copy        50 bytes
  longest back        936 bytes
tue.log
  tokens              156
  copies              46
  literals            110
  bytes copied        930  (89.4% of the file)
  longest copy        50 bytes
  longest back        780 bytes
copied across both    1867 of 2080  (89.8%)

# What a zip cannot do
both files, one stream 287 bytes
both files, zip members 370 bytes
gzip of the pair        305 bytes

# The output as each file is written
mon.log
  after    0 bytes  ->    2 bytes
  after   15 bytes  ->   17 bytes
  after   30 bytes  ->   32 bytes
  after   45 bytes  ->   47 bytes
  after   60 bytes  ->   57 bytes
  after   75 bytes  ->   57 bytes
  after   90 bytes  ->   59 bytes
  after  105 bytes  ->   69 bytes
  after  120 bytes  ->   69 bytes
  after  135 bytes  ->   72 bytes
  after  150 bytes  ->   73 bytes
  after  165 bytes  ->   77 bytes
  after  180 bytes  ->   77 bytes
  after  195 bytes  ->   77 bytes
  after  210 bytes  ->   81 bytes
  after  225 bytes  ->   81 bytes
  after  240 bytes  ->   84 bytes
  after  255 bytes  ->   85 bytes
  after  270 bytes  ->   89 bytes
  after  285 bytes  ->   94 bytes
  after  300 bytes  ->   96 bytes
  after  315 bytes  ->  102 bytes
  after  330 bytes  ->  102 bytes
  after  345 bytes  ->  105 bytes
  after  360 bytes  ->  106 bytes
  after  375 bytes  ->  108 bytes
  after  390 bytes  ->  108 bytes
  after  405 bytes  ->  108 bytes
  after  420 bytes  ->  114 bytes
  after  435 bytes  ->  115 bytes
  after  450 bytes  ->  117 bytes
  after  465 bytes  ->  117 bytes
  after  480 bytes  ->  119 bytes
  after  495 bytes  ->  119 bytes
  after  510 bytes  ->  119 bytes
  after  525 bytes  ->  123 bytes
  after  540 bytes  ->  123 bytes
  after  555 bytes  ->  125 bytes
  after  570 bytes  ->  126 bytes
  after  585 bytes  ->  128 bytes
  after  600 bytes  ->  127 bytes
  after  615 bytes  ->  127 bytes
  after  630 bytes  ->  131 bytes
  after  645 bytes  ->  132 bytes
  after  660 bytes  ->  132 bytes
  after  675 bytes  ->  135 bytes
  after  690 bytes  ->  135 bytes
  after  705 bytes  ->  137 bytes
  after  720 bytes  ->  141 bytes
  after  735 bytes  ->  145 bytes
  after  750 bytes  ->  146 bytes
  after  765 bytes  ->  146 bytes
  after  780 bytes  ->  148 bytes
  after  795 bytes  ->  148 bytes
  after  810 bytes  ->  148 bytes
  after  825 bytes  ->  153 bytes
  after  840 bytes  ->  158 bytes
  after  855 bytes  ->  160 bytes
  after  870 bytes  ->  160 bytes
  after  885 bytes  ->  163 bytes
  after  900 bytes  ->  162 bytes
  after  915 bytes  ->  165 bytes
  after  930 bytes  ->  163 bytes
  after  945 bytes  ->  167 bytes
  after  960 bytes  ->  169 bytes
  after  975 bytes  ->  169 bytes
  after  990 bytes  ->  172 bytes
  after 1005 bytes  ->  172 bytes
  after 1020 bytes  ->  172 bytes
  after 1035 bytes  ->  174 bytes
  after 1040 bytes  ->  175 bytes
tue.log
  after    0 bytes  ->    2 bytes
  after   15 bytes  ->   17 bytes
  after   30 bytes  ->   32 bytes
  after   45 bytes  ->   47 bytes
  after   60 bytes  ->   57 bytes
  after   75 bytes  ->   57 bytes
  after   90 bytes  ->   59 bytes
  after  105 bytes  ->   67 bytes
  after  120 bytes  ->   67 bytes
  after  135 bytes  ->   75 bytes
  after  150 bytes  ->   84 bytes
  after  165 bytes  ->   90 bytes
  after  180 bytes  ->   90 bytes
  after  195 bytes  ->   95 bytes
  after  210 bytes  ->  100 bytes
  after  225 bytes  ->  100 bytes
  after  240 bytes  ->  108 bytes
  after  255 bytes  ->  113 bytes
  after  270 bytes  ->  117 bytes
  after  285 bytes  ->  119 bytes
  after  300 bytes  ->  119 bytes
  after  315 bytes  ->  119 bytes
  after  330 bytes  ->  119 bytes
  after  345 bytes  ->  123 bytes
  after  360 bytes  ->  128 bytes
  after  375 bytes  ->  131 bytes
  after  390 bytes  ->  130 bytes
  after  405 bytes  ->  133 bytes
  after  420 bytes  ->  135 bytes
  after  435 bytes  ->  136 bytes
  after  450 bytes  ->  137 bytes
  after  465 bytes  ->  138 bytes
  after  480 bytes  ->  139 bytes
  after  495 bytes  ->  140 bytes
  after  510 bytes  ->  142 bytes
  after  525 bytes  ->  144 bytes
  after  540 bytes  ->  145 bytes
  after  555 bytes  ->  147 bytes
  after  570 bytes  ->  148 bytes
  after  585 bytes  ->  149 bytes
  after  600 bytes  ->  151 bytes
  after  615 bytes  ->  153 bytes
  after  630 bytes  ->  159 bytes
  after  645 bytes  ->  161 bytes
  after  660 bytes  ->  161 bytes
  after  675 bytes  ->  165 bytes
  after  690 bytes  ->  164 bytes
  after  705 bytes  ->  164 bytes
  after  720 bytes  ->  167 bytes
  after  735 bytes  ->  169 bytes
  after  750 bytes  ->  172 bytes
  after  765 bytes  ->  172 bytes
  after  780 bytes  ->  174 bytes
  after  795 bytes  ->  174 bytes
  after  810 bytes  ->  176 bytes
  after  825 bytes  ->  176 bytes
  after  840 bytes  ->  179 bytes
  after  855 bytes  ->  181 bytes
  after  870 bytes  ->  182 bytes
  after  885 bytes  ->  183 bytes
  after  900 bytes  ->  183 bytes
  after  915 bytes  ->  186 bytes
  after  930 bytes  ->  185 bytes
  after  945 bytes  ->  188 bytes
  after  960 bytes  ->  190 bytes
  after  975 bytes  ->  190 bytes
  after  990 bytes  ->  193 bytes
  after 1005 bytes  ->  193 bytes
  after 1020 bytes  ->  192 bytes
  after 1035 bytes  ->  193 bytes
  after 1040 bytes  ->  195 bytes
```
