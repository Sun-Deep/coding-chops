# Learning notes

What had to be understood before anything was drawn.

## The digest is a fixed size and that is the whole trick

Any length of input, 64 hex characters out. One character, ten thousand
characters, the empty string: all 256 bits. That is what lets a database column
exist at all, and it is also why the mapping cannot be reversed by construction
rather than by difficulty. There are more possible passwords than there are
digests, so a digest cannot name one password. It is not encryption with a lost
key; there is nothing to lose.

The reel shows this by hashing the empty field before the first keystroke. A row
that started blank would quietly suggest a digest grows with its input.

## Avalanche is not "a lot changes"

The property has a name and a number. A good hash flips each output bit with
probability about a half for any input change, so a one-character edit should
move about 128 of 256 bits. The sweep measures 128.0 across five thousand edits,
range 96 to 156.

This matters for what the frame is allowed to say. 146 bits for `hunter2` to
`hunter3` is one sample of that distribution, not the rule, and the script
asserts it sits inside the measured range rather than letting one pair carry a
claim about the function.

## Characters and bits are different units and only one is checkable

Sixty-one of the sixty-four printed characters change. That is a fact about the
hex rendering, not about the digest: a hex character is four bits, and it looks
unchanged only when all four of its bits survive. With bits flipping at about a
half, a character survives about one time in sixteen, which is where the mean of
4.0 comes from.

So there are two true numbers about the same event, 146 bits and 3 characters,
and the frame may only use one of them. It uses characters, because that is the
one the viewer can see. VR10 put steps beside cost and VR11 nearly put reads
beside distinct positions, and both times the frame ended up arguing with itself.

## Survivors, not casualties

"61 of 64 change" is the more quotable sentence and it is the wrong one, because
the picture cannot show it. Sixty-one cells going dim is an absence. Three cells
staying lit is a thing you can point at and count. The count on screen, the
narration and the caption all say three.

## Verification does not need the password

The part people assume is broken. The site stores the digest, you send the
password, the site hashes what arrived and compares digests. It never has to
hold the password for longer than the request, and it never has to be able to
produce it again. Both halves are checked in the script rather than asserted:
the right password matches the stored value, the one-character variant does not.

## Why the right password reproducing the row is not luck

The third pass lands on 64 of 64 because SHA-256 is a function. Same input, same
output, every time, on every machine. That is worth stating because a viewer who
has just watched sixty-four characters scramble on one keystroke has good reason
to wonder why they came back at all.

## What a real store does that this one does not

Two users with the same password get the same digest, so one guess opens both,
and a leaked table of unsalted hashes is cracked once for everybody rather than
once per account. A per-account salt fixes it: the script hashes `123456` for a
thousand accounts and gets one distinct value without salt and a thousand with.

And SHA-256 is fast, which is a virtue everywhere except here, because fast
means cheap to guess against. The functions built for this are slow on purpose.
Neither point is on screen; the salt is the caption's catch.
