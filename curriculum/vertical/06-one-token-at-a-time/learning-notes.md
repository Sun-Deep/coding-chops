# Learning notes

## The question the cut answers

What actually happens between hitting send and the first character appearing?

The usual answer is "it predicts the next word", which is a description of the
output rather than the mechanism, and it does not explain why a long chat gets
expensive or why the model cannot revise what it has already said.

## Your message is not what gets sent

The first thing that happens is not tokenization. It is the chat template.

"Why is the sky blue?" is six tokens. What reaches the model is twenty-five,
because the template wraps it in a system message and role markers:
`<|im_start|>`, `system`, the assistant instruction, `<|im_end|>`, then the user
turn, then an opening `<|im_start|>assistant` that tells the model it is its go.

Those markers are single tokens with ids up in the 151,644 range, sitting above
the ordinary vocabulary. They are not text the model reads as words; they are
structure.

This is the part almost nobody has been shown, and it is why the cut opens here.

## Tokens are not words

`' is'` and `' the'` carry their leading spaces. `Rayleigh` came back as `' Ray'`
then `'leigh'`, two tokens. A token is a byte-pair index, not a word, and drawing
them as words would make the six-to-twenty-five jump look arbitrary.

## Everything goes up, one thing comes back

All twenty-five tokens go through all thirty-six blocks. That part is parallel.

But only the last position's vector is multiplied by the output matrix. Twenty
four of the twenty five produce nothing that is used for the next token. They
matter, because attention lets the last position read them, but they do not
produce output.

That is the detail worth having: the model is not scoring a sentence, it is
scoring the one position that is allowed to speak next.

## What "scoring 151,936" means

The output matrix turns that one vector into one number per vocabulary entry.
151,936 numbers. Softmax makes them probabilities, and sampling keeps one.

Most steps are not a contest. Step 1 of the measured answer returned `'The'` at
100.0 percent. Step 5 is the honest one:

```text
47.9%  ' due'        26.3%  ' to'      13.5%  ' primarily'
10.6%  ' because'     1.4%  ' mainly'
```

Four live candidates. Using step 1 in the shot would have been showing a
collapse that never happened.

## Then it does it again, but not the way people think

The chosen token is appended and the model runs again. This is where the first
version of this plan was wrong.

It does not re-read the conversation in the sense of recomputing it. Every
earlier token's keys and values are already in the KV cache. Only the new token
goes up the stack, one column wide, and its attention reads every stored
position.

So there are two true statements that sound the same and are not:

- attention looks at every previous token, every step. True.
- the model reprocesses the whole conversation, every step. False.

Drawing the second is the error the storyboard exists to prevent.

## The cache is the catch

Every layer stores a key and a value for every token. With grouped-query
attention that is `n_embd_k_gqa + n_embd_v_gqa`, 256 plus 256, at two bytes each
in an f16 cache, across 36 layers:

```text
36 x (256 + 256) x 2 = 36,864 bytes per token
```

36 KB a token, for both what you send and what it says back. Eight thousand
tokens of conversation is 288 MB sitting in memory, and every new token's
attention reads all of it.

The arithmetic is checkable against the runtime's own allocation: at the 16,384
context the run used, 36,864 x 16,384 is exactly the 576 MiB llama.cpp reports.

Without grouped-query attention it would be 288 KB a token, eight times worse,
because all sixteen heads would be stored instead of two.

## What was tempting and wrong

That the slowdown is the story. Per-token time does grow with the conversation,
and it is monotonic across both measurement sessions, but it is only about 1.3
times across a 90 times longer chat. At these lengths the weights dominate and
attention does not.

A cut that led with 1.3x would be technically correct and would land as nothing.
The memory is the figure that is actually dramatic, and it is a count rather
than a millisecond, which is what the format prefers anyway.

The first sweep also ran once per length and produced 9.2, 9.5, 16.2 and 11.2
ms, which looked like no trend at all. Three runs per point, twice, gave a clean
curve. One run per point was the bug, not the mechanism.
