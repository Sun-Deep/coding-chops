# Learning notes

## The unit decides the answer, so pick it before running anything

Counting comparisons would have been the obvious unit and it quietly flatters
Rabin-Karp, which compares hashes rather than characters and would come out
looking as though it barely touched a page it touches all of. Counting reads
fixes that.

Then a second unit turned out to matter more. The reel draws which characters a
matcher looked at, so the only figure it can honestly print is the count of
distinct positions touched. Printing reads next to a picture of distinct
positions is two units in one frame, which is the mistake VR10 made with steps
and cost and which cost it reach.

So: `reads` is measured and lives in the notes, `looked at` is what a frame may
say, and the picture is the same fact.

## Why Boyer-Moore can skip

It lines the pattern up and compares from the right. On a mismatch it has two
reasons to jump more than one place. The bad-character rule says the text
character it just saw does not appear in the pattern at that offset, so every
alignment that would put it there is dead. The good-suffix rule says the part
that did match cannot reappear until further along.

Both are proofs about ground it has not read, which is the thing worth
understanding: it is not guessing, and it is not sampling. It knows the phrase
cannot start there.

## The catch is Horspool

Boyer-Moore looks at 371 characters. Horspool, which throws away the good-suffix
table entirely and keeps only the bad-character rule, looks at 389. Eighteen
characters, under five per cent, for a table that is the fiddliest code in this
whole cut and the one thing here that is genuinely easy to get subtly wrong.

That is why almost every real implementation is Horspool or a cousin of it.

## Rabin-Karp is the one that looks clever and is not

On this page it reads 4,822 characters, more than the straight scan. Its appeal
was never single-pattern search on short strings; it is that a hash is cheap to
compare when you are hunting many patterns at once, or when the pattern is long.
The cut does not say any of that, because it is a second idea and this reel has
one.

## A clock that counts work would have broken the cut

Boyer-Moore is finished after eight per cent of the total reads. A shared clock
counting work would stop three of the six panels inside the first two seconds
and hold them there for nine, which is the pacing problem VR09 nearly had and
VR10 had to design around.

Position on the page fixes it. All six sweep the text together, all six finish
together, and what separates them is how much of the page they lit up on the
way. The race becomes a coverage picture, which is a better fit for this claim
than a race would have been.
