# Measurements

Run with `node scripts/measure-qr.mjs`.

Machine: MacBook Pro, Darwin 25.5.0 arm64, Node v22.14.0, qrcode 1.5.4, jsqr 1.4.0, 2026-09-19.

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
square is 49 modules, less than half the 121 the middle survives, and blanking it
kills the scan outright. That is the caption's catch.

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
payload               "https://codingchops.dev"
decoder               jsqr, on a clean 8x render with a 4 module quiet zone

# What a symbol is made of
level L: version 2, 25x25 = 625 modules
  structure            266  finders, timing, alignment, format
  carrying data        359  = 44 codewords x 8 bits + 7 unused
  codewords             44  = 34 your link + 10 error correction  (23% backup)
level M: version 2, 25x25 = 625 modules
  structure            266  finders, timing, alignment, format
  carrying data        359  = 44 codewords x 8 bits + 7 unused
  codewords             44  = 28 your link + 16 error correction  (36% backup)
level Q: version 3, 29x29 = 841 modules
  structure            274  finders, timing, alignment, format
  carrying data        567  = 70 codewords x 8 bits + 7 unused
  codewords             70  = 34 your link + 36 error correction  (51% backup)
level H: version 3, 29x29 = 841 modules
  structure            274  finders, timing, alignment, format
  carrying data        567  = 70 codewords x 8 bits + 7 unused
  codewords             70  = 26 your link + 44 error correction  (63% backup)

# The largest centred hole that still scans
level L: 4x4 =  16 modules blanked  (2.6% of the symbol)  backup 23%
level M: 7x7 =  49 modules blanked  (7.8% of the symbol)  backup 36%
level Q: 10x10 = 100 modules blanked  (11.9% of the symbol)  backup 51%
level H: 11x11 = 121 modules blanked  (14.4% of the symbol)  backup 63%

# Random damage, for comparison
level L: random blackout survives  median 2.6%  (min 0.8%, max 4.0%)
level M: random blackout survives  median 2.4%  (min 0.0%, max 7.8%)
level Q: random blackout survives  median 4.8%  (min 0.2%, max 7.7%)
level H: random blackout survives  median 4.2%  (min 0.0%, max 8.2%)

# One finder square
level H, top-left finder blanked (49 of 841 modules, 5.8%): scans = false

# Level H symbol, module by module (1 = dark)
  11111110010001011011101111111
  10000010110100000001101000001
  10111010011010000101101011101
  10111010000001110010001011101
  10111010001001011110001011101
  10000010100000110101001000001
  11111110101010101010101111111
  00000000111111100001100000000
  00001111000111001000001100010
  10001000111100001010011110111
  10110010010011101010110101101
  00001100001011011110110101011
  11110010100110010101100101001
  01110000001111011100001010101
  11001010101101100000111010001
  11010101111100010011000101010
  11001111110000000111100100011
  10001101111100000110001111101
  00010111010110011000000011101
  00101001101011100100100011000
  11111010001100110111111111010
  00000000110010110001100010101
  11111110100110100001101010001
  10000010101001001101100011001
  10111010111000100101111110001
  10111010010011001000000101010
  10111010010000001011110000011
  10000010011000100000100101011
  11111110001101100010101011010

# Level H structure map (1 = finder, timing, alignment or format)
  11111111100000000000011111111
  11111111100000000000011111111
  11111111100000000000011111111
  11111111100000000000011111111
  11111111100000000000011111111
  11111111100000000000011111111
  11111111111111111111111111111
  11111111100000000000011111111
  11111111100000000000011111111
  00000010000000000000000000000
  00000010000000000000000000000
  00000010000000000000000000000
  00000010000000000000000000000
  00000010000000000000000000000
  00000010000000000000000000000
  00000010000000000000000000000
  00000010000000000000000000000
  00000010000000000000000000000
  00000010000000000000000000000
  00000010000000000000000000000
  00000010000000000000111110000
  11111111100000000000111110000
  11111111100000000000111110000
  11111111100000000000111110000
  11111111100000000000111110000
  11111111100000000000000000000
  11111111100000000000000000000
  11111111100000000000000000000
  11111111100000000000000000000
```
