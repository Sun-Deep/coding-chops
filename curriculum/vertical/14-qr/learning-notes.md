# Learning notes

What had to be understood before anything was drawn.

## The famous number about QR codes is wrong as people say it

"You can destroy 30 per cent of a QR code and it still scans" is everywhere, and
this cut was pitched on it. It does not survive contact with a decoder.

The 30 per cent is the share of _codewords_ Reed-Solomon can reconstruct at
level H. It is a property of the error correction block, not a licence to black
out a third of the picture. Measured on a real symbol with a real decoder,
randomly blacked-out modules fail at a few per cent, because random damage takes
out the three corner finders and once those are gone there is nothing to locate,
let alone correct.

Where the damage falls matters more than how much of it there is. One finder
square is 49 modules against the 121 the middle survives, and blanking it is
fatal. That is the catch, and it is run rather than described.

The wider lesson is the one that keeps repaying: a figure everyone repeats is
not a measurement, and the way to find out is to make the thing and break it.

## A symbol is mostly not your data

1,369 modules at level H. 290 of them are structure: three finders and their
separators, two timing lines, alignment squares, the format strips and the dark
module. None of that carries a byte of the link.

The remaining 1,079 carry 134 codewords and 7 bits with nowhere to go. Of those
134, 46 are the link and 88 are error correction. So the honest headline is not
that a QR code is robust; it is that most of a QR code was never the link.

## Different libraries for the two directions

`qrcode` writes the symbol and `jsqr` reads it back. A round trip through one
library proves that the library is self-consistent and almost nothing else, and
the entire claim of this cut rests on a decode actually succeeding.

The same reasoning as VR13, where the encoder was Info-ZIP and the per-member
curve came from zlib, and the script asserted the two agreed rather than
assuming it.

## The placement map was a dead end, and the simpler thing was better

The first plan was to colour the symbol's own modules by whether they carry the
link or the backup, which meant implementing the codeword placement from the
specification. It got as far as producing 567 placed modules, the right count,
and then decoding to garbage, and the bug was not worth finding.

It was the wrong thing to want. Codewords are laid out in a zigzag, so the link
and the backup interleave across the whole symbol: colouring them would have
produced noise that looked like a fault in the code rather than an explanation.
Seventy chips in a row, 26 of one colour and 44 of another, says "most of it is
backup" in one glance and needs no placement map at all.

Worth carrying. The impressive version of a visual and the clear version are not
always the same one, and the check is whether a stranger learns faster, not
whether the drawing is more faithful.

## Small things do not move the frozen-frame check

Seventy chips fading in where they belong changes almost no pixels in a 1080 by
1920 frame, and the check called a busy 1.7 seconds a still. Flying them out of
the symbol fixed it, and flying is also the truer picture.

Third cut in a row with a note in this shape, after VR12's drum spins and VR13's
drain, so it is a rule now: on a cut with few moving parts, an event has to be
given size, and "given size" means pixels travelling, not opacity changing.

## Changing the payload changed every number

Swapping the encoded link from a short domain to this repository took it from 23
characters to 40, which pushed level H from version 3 to version 5. That is not
a text change. 841 modules became 1,369, 70 codewords became 134, the hole grew
from 11 by 11 to 16 by 16, and the chip grid had to be rebuilt.

It was worth checking rather than assuming, and it made the claim stronger: 66
per cent of the payload is backup at version 5 against 63 at version 3. The
chip grid went to 23 columns because 46 is exactly two rows of them, so the link
is the top two rows and the backup is the four underneath.

The rule: a fixture is not a string, it is the thing every figure depends on.

## A claim you can check with your own phone

The finished mp4 was decoded frame by frame, and every frame outside the scan
sweep reads the URL, including the ones with the hole fully open. That turns the
central claim from something measured off screen into something a viewer can
verify by pointing a phone at the video.

Worth looking for on future cuts. The strongest version of a checkable moment is
not a number the viewer can recompute, it is an artefact they can test.
