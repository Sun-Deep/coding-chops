# Learning notes

## Why back to front is slow

It feels efficient because nobody walks past an empty row. But everybody in a
zone wants the same four rows, so the aisle fills with people waiting for the
one in front to lift a bag. The other eight rows sit empty while that happens.
On seed 1 back-to-front passengers spent 1,207 passenger-seconds stuck behind
somebody, against 706 for random and 318 for window first.

## Why random beats it

Random scatters people over all twelve rows, so two people stowing at the same
moment are usually in different rows and do not block each other.

## Why window first wins

It scatters people over the whole length like random, and it also removes the
second cost: nobody has to stand up to let a window passenger in, because the
middle and aisle seats are still empty when the windows sit down.

## Where the model is simple

No groups travelling together, no overhead bins running out, everyone walks at
the same pace, and everyone is at the gate when called. Each of those would
change the numbers. The order of the three held in every variant tried.
