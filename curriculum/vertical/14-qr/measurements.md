# Measurements

Run with `node scripts/measure-qr.mjs`.

Machine: MacBook Pro, Darwin 25.5.0 arm64, Node v22.14.0, qrcode 1.5.4, jsqr 1.4.0, 2026-09-19.

## The payload is the repository

The symbol encodes `https://github.com/Sun-Deep/coding-chops`, which is the
repository the reel's own figures come out of. It is forty characters against
the twenty-three of the first fixture, and that is not a cosmetic change: a
longer payload pushes level H from version 3 to version 5, so every number in
the cut moved. 841 modules became 1,369, 70 codewords became 134, and the hole
the symbol survives grew from 11 by 11 to 16 by 16.

It made the claim stronger. At version 5 only 46 of 134 pieces are the link and
88 are error correction, so 66 per cent of the payload is backup against 63 per
cent before.

## Two kinds of figure

The structure is exact and comes out of the encoder. How many modules a symbol
has, how many of them are the patterns a scanner needs in order to find and read
it, and how the rest divide into data and error correction are all properties of
the specification at a given version and level.

The hole is measured, by decoding. A square of modules is blanked in the middle
of a real symbol and a real decoder is asked to read it, and the square grows
until the decoder fails. Nothing here reasons about how much damage should be
survivable.

The encoder and the decoder are different implementations on purpose. `qrcode`
writes the symbol and `jsqr` reads it back, because a round trip through one
library would prove much less.

## The claim this script exists to stop

It is widely repeated that you can destroy 30 per cent of a QR code and it will
still scan, and the first draft of this cut was going to say exactly that. It is
false as stated, and measuring it was what caught it.

That 30 per cent is the share of _codewords_ Reed-Solomon can reconstruct at
level H. It is not a licence to black out a third of the picture. Randomly
blacked-out modules fail at a few per cent, because random damage hits the three
corner squares a scanner needs in order to locate the symbol at all, and once
those are gone there is nothing to decode however much redundancy is inside.

Where the damage falls matters more than how much of it there is. One finder
square is 49 modules, less than a fifth of the 256 the middle survives, and
blanking it kills the scan outright. That is the caption's catch.

## The rendered reel scans

Every figure above comes from the script. The reel was then checked the other
way round, by pulling frames out of the finished mp4 and decoding those.

Frames at 2.0, 3.3, 4.3, 5.3, 6.7, 8.7, 10.0, 11.3, 12.7 and 13.8 seconds all
decode to the repository URL, including the ones where the hole is fully open.
The only frames that do not are the twenty-two during the scan sweep, where an
animated orange wash is deliberately drawn over the code.

So the claim is not merely measured, it is demonstrable by the viewer: a phone
pointed at the screen while the hole is open reads the link.

## Drift

None by construction, and checked anyway. The payload is a literal, the encoder
is deterministic, and the random-damage sampler runs off a pinned seed. Run twice
back to back, the output was byte identical.

## The decoder is a clean one

Every hole figure is jsqr reading an 8x render with a 4 module quiet zone and
perfect pixels. A phone camera in a dim restaurant does worse, so these are an
upper bound rather than a promise, and the reel names the decoder on screen.

## Raw output

```text
# The symbol
payload               "https://github.com/Sun-Deep/coding-chops"
decoder               jsqr, on a clean 8x render with a 4 module quiet zone

# What a symbol is made of
level L: version 3, 29x29 = 841 modules
  structure            274  finders, timing, alignment, format
  carrying data        567  = 70 codewords x 8 bits + 7 unused
  codewords             70  = 55 your link + 15 error correction  (21% backup)
level M: version 3, 29x29 = 841 modules
  structure            274  finders, timing, alignment, format
  carrying data        567  = 70 codewords x 8 bits + 7 unused
  codewords             70  = 44 your link + 26 error correction  (37% backup)
level Q: version 4, 33x33 = 1089 modules
  structure            282  finders, timing, alignment, format
  carrying data        807  = 100 codewords x 8 bits + 7 unused
  codewords            100  = 48 your link + 52 error correction  (52% backup)
level H: version 5, 37x37 = 1369 modules
  structure            290  finders, timing, alignment, format
  carrying data       1079  = 134 codewords x 8 bits + 7 unused
  codewords            134  = 46 your link + 88 error correction  (66% backup)

# The largest centred hole that still scans
level L: 6x6 =  36 modules blanked  (4.3% of the symbol)  backup 21%
level M: 8x8 =  64 modules blanked  (7.6% of the symbol)  backup 37%
level Q: 11x11 = 121 modules blanked  (11.1% of the symbol)  backup 52%
level H: 16x16 = 256 modules blanked  (18.7% of the symbol)  backup 66%

# Random damage, for comparison
level L: random blackout survives  median 2.5%  (min 0.4%, max 4.2%)
level M: random blackout survives  median 4.0%  (min 0.0%, max 6.8%)
level Q: random blackout survives  median 4.4%  (min 1.0%, max 6.5%)
level H: random blackout survives  median 5.1%  (min 0.1%, max 12.2%)

# One finder square
level H, top-left finder blanked (49 of 1369 modules, 3.6%): scans = false

# Level H symbol, module by module (1 = dark)
  1111111011101011100010101011101111111
  1000001011001010101000111101001000001
  1011101001111000100001000010001011101
  1011101010011101000001111010001011101
  1011101010001100101111111011001011101
  1000001010100011110111011001101000001
  1111111010101010101010101010101111111
  0000000001100001010010110100000000000
  0001001001110001000101100011100111011
  1011100000001011100111100001011000011
  0110001010111100001110100000101111101
  1011010001111101000000110100000101001
  0001111001111000011011010100111000010
  1010100010101100111001001100001101011
  0100101111001100001111101110000100101
  1100110011110100000100100110111000010
  1010101000011111110110110101011101111
  0010110001001001001001100000101111101
  1101101111000110001000111100011000111
  1101000010100100100010011010000000110
  0000111110001000001100101111101111010
  0011110101110101000000100100001000111
  0110001010110101010011000110010111011
  1101100000111110011101111100011010001
  0110111101101101000010000011011000110
  0010100110000010000100010010001100011
  1001011000100011010001110110111111101
  0111100000111001000111110111001100000
  1110001111011001011010001000111110111
  0000000011010010001001011111100010011
  1111111000001001000010100111101010111
  1000001000110000000100110011100010100
  1011101001011001110101101110111111010
  1011101010100111001101111111010110011
  1011101001101010011000111100010011001
  1000001001100001010000111111100110000
  1111111000000001111011011101110110011

# Level H structure map (1 = finder, timing, alignment or format)
  1111111110000000000000000000011111111
  1111111110000000000000000000011111111
  1111111110000000000000000000011111111
  1111111110000000000000000000011111111
  1111111110000000000000000000011111111
  1111111110000000000000000000011111111
  1111111111111111111111111111111111111
  1111111110000000000000000000011111111
  1111111110000000000000000000011111111
  0000001000000000000000000000000000000
  0000001000000000000000000000000000000
  0000001000000000000000000000000000000
  0000001000000000000000000000000000000
  0000001000000000000000000000000000000
  0000001000000000000000000000000000000
  0000001000000000000000000000000000000
  0000001000000000000000000000000000000
  0000001000000000000000000000000000000
  0000001000000000000000000000000000000
  0000001000000000000000000000000000000
  0000001000000000000000000000000000000
  0000001000000000000000000000000000000
  0000001000000000000000000000000000000
  0000001000000000000000000000000000000
  0000001000000000000000000000000000000
  0000001000000000000000000000000000000
  0000001000000000000000000000000000000
  0000001000000000000000000000000000000
  0000001000000000000000000000111110000
  1111111110000000000000000000111110000
  1111111110000000000000000000111110000
  1111111110000000000000000000111110000
  1111111110000000000000000000111110000
  1111111110000000000000000000000000000
  1111111110000000000000000000000000000
  1111111110000000000000000000000000000
  1111111110000000000000000000000000000
```
