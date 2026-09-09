# Understanding check

The creator gate. Answer each without the notes, the script output or the
composition. Tick only what you can actually do.

- [x] Explain why a fixed window counter lets twice the limit through, without
      using the word "boundary".
- [x] Draw the two second attack and mark where the counter resets.
- [x] Say what a sliding window log stores and why that makes it exact.
- [x] Give the measured memory for a sliding window log and a token bucket per
      user, and explain where the difference comes from.
- [x] Explain why the token bucket let 103 through and why that is not the same
      kind of miss as the fixed window's 200.
- [x] Describe the sliding window counter and say what it trades away to get
      from 1,208 bytes down to 56.
- [x] Say which of the four you would put in front of a public API, and what you
      would need to know first.
- [x] Name what changes about all of this when the limiter runs on four servers
      instead of one.
