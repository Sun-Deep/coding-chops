# Understanding check

The creator gate. Answer each without looking at the notes, the run output or
the composition. Tick only what you can actually do.

- [ ] Say what the chat template adds to a six token question, and why the
      result is twenty-five rather than seven or eight.
- [ ] Explain why `' is'` has a leading space and what that says about what a
      token is.
- [ ] Say how many of the twenty-five prompt tokens produce a number that is
      used to choose the next token, and why.
- [ ] Explain what 151,936 is, and what is done to that many numbers to get one
      token out.
- [ ] State the difference between "attention looks at every previous token" and
      "the model reprocesses the conversation", and say which one is true.
- [ ] Say what is stored in the KV cache, per what, and derive 36,864 bytes per
      token from the model's shape without looking it up.
- [ ] Explain why `n_embd_k_gqa` is 256 when `n_embd` is 2,048, and what the
      cache would cost without that.
- [ ] Say why prefill is about four times cheaper per token than decode.
- [ ] Describe why the cut uses step 5 rather than step 1, and what step 1
      returned.
- [ ] Explain why the end card leads with megabytes rather than with the 1.3
      times slowdown that was also measured.
