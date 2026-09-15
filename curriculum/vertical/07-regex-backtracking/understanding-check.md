# Understanding check

The creator gate. Answer each without looking at the notes, the measurement
output or the composition. Tick only what you can actually do.

- [x] Explain, without using the word "slow", what `^(a+)+$` does on a string
      that cannot match that `^a+$` does not.
- [x] Say why both patterns are fast on a string that does match, and why that
      is the reason this bug reaches production.
- [x] Derive 2^(n-1) for yourself: count the ways five a's split between
      iterations of the outer quantifier, before checking the note.
- [x] Predict the time at n=31 from the n=30 figure, then say what measurement
      would falsify the prediction.
- [x] Explain what the trailing `X` is doing, and what happens to the whole
      demonstration if it is removed.
- [x] Say why Node and Python are both on screen, and what would be claimed
      wrongly if only one were.
- [x] Explain why the Python figures being roughly five times the Node figures
      carries no lesson.
- [x] State what Go's `regexp` gives up in exchange for its linear time
      guarantee, and say why those two things are one decision and not two.
- [x] Describe a pattern that looks nested but cannot blow up, and say why.
- [x] Say why the Cloudflare and Stack Overflow outages are in the pinned
      comment rather than on a frame.
