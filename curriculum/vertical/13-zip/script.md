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
card        server.log                        1,035 bytes   (live: it falls to 177)
sheet       20 lines of log, 51 characters wide, 23 point mono
bands       every matched stretch, under its characters
arcs        from a match back to the text it is a copy of
readout     939 of 1,035 bytes already said   ->   5.85x smaller
provenance  zlib deflate, level 9 · 1,035 bytes in, 177 out
```

The size lives in the file's own header rather than in a strip under the
diagram. A byte count below the picture is a dashboard reporting on it; a byte
count in the header is the file saying how big it is, and watching it fall is
the verdict rather than a caption about the verdict.

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
collapse, falling in pitch, and a `land` when the file comes to rest at its new
size.

Peak -5.1 dBFS. One silence gap, which is the closing hold.

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
