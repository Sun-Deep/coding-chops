# Vertical 14: most of a QR code isn't the link

Status: blocked

Built, rendered and reviewed. The creator understanding check is still open.

## What it claims

A QR code carries far less of your link than it looks like it does. The level H
symbol in this cut is 29 by 29, 841 squares. 274 of them are the patterns a
scanner needs in order to find and read it at all. The rest carry 70 pieces, and
only 26 of those are the link. The other 44 exist to rebuild it.

That is why you can blank 121 squares out of the middle and it still scans.

## Why this topic

Everybody has scanned a QR code, and almost everybody has seen one with a logo
punched through the middle and never asked how that works. The mechanism is
sitting in plain sight on restaurant tables.

It is also both shapes the page rewards at once: a surprise with a number on it,
and a reference somebody keeps. The four error correction levels are the
reference, and the correlation is the proof. Every step up buys more backup and
every step up survives a bigger hole.

## Why the hole rather than "30 per cent"

The version of this cut that nearly got built said you can destroy about 30 per
cent of a QR code. That is false as stated and the measurement caught it. See
`measurements.md`; the short form is that the 30 per cent is a share of
codewords, random damage fails at a few per cent because it takes out the
corners, and where the damage falls matters more than how much of it there is.

What survived the check is better anyway, because it is a thing people have
already seen with their own eyes.

## What is out of scope

How Reed-Solomon actually reconstructs the missing codewords. The reel shows
that 44 of 70 pieces are there for the purpose and that the hole heals; it does
not open up the algebra, and fourteen seconds could not.

Also out of scope: masking, why a symbol grows a version to hold more
redundancy, and why the reel's numbers are an upper bound for a clean digital
decode rather than a promise about a phone camera. The last of those is on
screen as the decoder name and in `measurements.md` in full.

## Files

| File                                 | What it is                                 |
| ------------------------------------ | ------------------------------------------ |
| `scripts/measure-qr.mjs`             | the measurement, and the source of figures |
| `src/vertical/14-qr/measurements.ts` | the figures and the symbol, one module     |
| `src/vertical/14-qr/grid.ts`         | the grid re-derived and asserted           |
| `src/vertical/14-qr/Symbol.tsx`      | the code, the hole and the heal            |
| `src/vertical/14-qr/Band.tsx`        | the count, the 70 pieces, the four levels  |
