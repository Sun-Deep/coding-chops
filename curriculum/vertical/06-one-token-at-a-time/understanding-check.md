# Understanding check

The creator gate. Answer each without looking at the notes, the run output or
the composition. Tick only what you can actually do.

- [x] Say what the chat template adds to a six token question, and why the
      result is twenty-five rather than seven or eight.
- [x] Explain why `' is'` has a leading space and what that says about what a
      token is.
- [x] Say how many of the twenty-five prompt tokens produce a number that is
      used to choose the next token, and why.
- [x] Explain what 151,936 is, and what is done to that many numbers to get one
      token out.
- [x] State the difference between "attention looks at every previous token" and
      "the model reprocesses the conversation", and say which one is true.
- [x] Say what is stored in the KV cache, per what, and derive 36,864 bytes per
      token from the model's shape without looking it up.
- [x] Explain why `n_embd_k_gqa` is 256 when `n_embd` is 2,048, and what the
      cache would cost without that.
- [x] Say why prefill is about four times cheaper per token than decode.
- [x] Describe why the cut uses step 5 rather than step 1, and what step 1
      returned.
- [x] Explain why the end card leads with megabytes rather than with the 1.3
      times slowdown that was also measured.
