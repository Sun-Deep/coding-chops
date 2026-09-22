# Measurements

From `scripts/measure-password-hashing.mjs`. Two runs, byte identical, which is
a property of the design rather than luck: the fixture is literals and a seeded
generator, there is no timing anywhere in it, and nothing it touches can drift.

Every digest printed here was produced twice, by `node:crypto` and by the
`shasum -a 256` binary, and the script throws if they disagree on a single one.

## Machine

```text
macOS 26.5.1, arm64
node v22.14.0
shasum from /usr/bin/shasum
```

## Run

```text
# What one changed character does

  hunter2   f52fbd32b2b3b86ff88ef6c490628285f482af15ddcb29541f94bcf526a3f6c7
  hunter3   fb8c2e2b85ca81eb4350199faddd983cb26af3064614e737ea9f479621cfa57a

  bits changed        146 of 256
  characters kept     3 of 64
  characters changed  61 of 64

# The same edit 5,000 times

  bits changed, mean  128.0 of 256
  bits changed, range 96 to 156
  characters kept     4.0 of 64 on average, 12 at most

  the hero pair's 146 sits inside that range, so it is ordinary

# Any length in, the same length out

       1 characters in   64 hex out   ca978112ca1bbdca...
       7 characters in   64 hex out   e46240714b5db3a2...
      20 characters in   64 hex out   42492da06234ad0a...
     100 characters in   64 hex out   2816597888e4a0d3...
   10000 characters in   64 hex out   27dd1f61b867b6a0...

# 1,000 accounts, all with the password 123456

  distinct stored values, no salt   1
  distinct stored values, salted    1000
  distinct salts drawn              1000

# Logging in, without the password being stored

  typed hunter2   matches stored   true
  typed hunter3   matches stored   false

```

## What may go on screen

The avalanche figures are exact and hold on any machine: SHA-256 is a
specification, not an implementation, and the digests here are the same digests
anywhere. So is the collision count, which is arithmetic about a set.

Nothing in this cut is a property of this laptop, and there are no timings, so
unlike VR01 and VR07 there is no figure that has to go on screen as a ratio.

## The number to be careful with

`hunter2` to `hunter3` moves 146 bits of 256. That is not the headline, because
one pair is an anecdote. The headline is the sweep: 5,000 one-character edits
move a mean of 128.0 bits, which is exactly half of 256, with a range of 96 to
156. The script asserts the hero pair sits inside that range, so the frame can
show one pair while the claim rests on five thousand.

The character figure is the one the viewer can check, and it is the weaker of
the two statistically: 3 of 64 characters survive in the hero pair against a
mean of 4.0 and a maximum of 12. The reel shows the pair and says 61 changed,
which is true of the pair on screen. It does not say "61 always change", because
that is false.
