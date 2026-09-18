# Script

Status: blocked

No voiceover and no music. The narration is burned into the frame. Twenty-five
words across 14 seconds.

| Frames  | Line                                 |
| ------- | ------------------------------------ |
| 6-70    | A log file. 1,035 bytes.             |
| 82-150  | Zip reads it once.                   |
| 162-240 | Every repeat becomes a pointer back. |
| 252-322 | 939 of them are copies.              |
| 334-412 | **1,035 bytes out as 177.**          |

One unit the whole way down. Line one sets the file in bytes, line four counts
copies in bytes, line five reports the output in bytes, so nothing on screen
asks the viewer to convert between two things. That is the mistake VR10 shipped
with steps against cost, and the one VR11 nearly shipped with reads against
distinct positions.

## On screen

```text
eyebrow     FILE COMPRESSION
headline    Zip finds what you / already said.
card        server.log                        1,035 bytes   (does not change)
sheet       20 lines of log, 51 characters wide, 23 point mono
bands       every matched stretch, under its characters
arcs        from a match back to the text it is a copy of
bar one     server.log       filling to the head        1,035 bytes
bar two     server.log.zip   filling to the real output   177 bytes
note        5.85x smaller, written inside the empty end of bar two
provenance  zlib deflate, level 9 · 1,035 bytes in, 177 out
```

The two bars are what make this a zip being made rather than a log being marked
up, and the first cut of it did not have them. Everything else was already
there: the head, the matches, the arcs and the collapse were all on screen and
nothing said what they were for.

They are drawn to the same scale, so the lower bar stopping a sixth of the way
along is the claim. Its length at every point is a real `deflateRaw` of the file
up to there rather than a line between the two ends, which buys the moment where
the source grows thirty bytes and the zip does not move at all.

The source keeps its size the whole way through. Zipping a file does not shrink
it, it writes a second file, and an earlier version counted the card's header
down from 1,035 to 177 as though the log itself had got smaller. The number that
falls belongs on the zip.

The ratio sits inside the empty end of the zip's track, so it is written in the
space it is describing.

## Sound

Two voices, and which one is playing is the claim.

A `tick` fires as the head spells out a character it has never seen. A `probe`
note fires when it finds a stretch it has seen before, pitched by how far back
the match was: a repeat from the line above rings high, one reaching back most
of the file sits at the bottom of the scale. The first line of the file has
nothing before it to match, so it is all ticking; after that the ticking nearly
stops and the track becomes notes.

A match sounds for as long as it is being copied rather than only on its first
byte. The first render went silent for 0.70 seconds at 1.1 seconds because the
head was inside the longest copy in the file, which is the most important moment
in the cut and was also the quietest one.

Then thirty-nine `swap` hits inside a second and a half as the stretches
collapse, falling in pitch. Then the drain: two cues a line, a `return` as it
leaves the sheet and a `tick` as it lands in the zip, rising in pitch where the
crush fell, because one is the file being compacted and the other is the result
being filed.

Peak -5.4 dBFS. No silence gaps.

## Copy

### Facebook, Instagram, TikTok

276 characters including the hashtags.

```text
A 1,035 byte log zips to 177, because 939 of those bytes were already on the page.

Try it on a photo and nothing happens: a JPEG has no repeats left to find.

Code and measurements: github.com/Sun-Deep/coding-chops

#zip #compression #algorithms #backend #softwareengineering
```

### YouTube Shorts title

```text
A 1,035 byte log file zips down to 177 bytes
```

### YouTube Shorts description

The same two lines as the caption.
