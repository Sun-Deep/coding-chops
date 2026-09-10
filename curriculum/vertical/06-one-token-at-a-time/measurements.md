# Measurement run

Every number the cut may put on screen. Run twice on 2026-09-10 by
`scripts/measure-token-generation.sh`. The figures live in
`src/vertical/06-one-token-at-a-time/measurements.ts` and no shot hardcodes one.

## Machine

```text
Apple M5 Pro, macOS 26.5.1 (25F80)
llama.cpp (homebrew), Metal backend
qwen2.5-3b-instruct-q4_k_m.gguf, server context 16384
```

An open model, deliberately. The cut needs figures somebody can check, and no
commercial model publishes its vocabulary size, block count or logits. The
mechanism is the same across transformers, so only the badge would differ, and
the badge is the part that would have been false.

## The model's shape

```text
arch          qwen2
model params  3.40 B
n_vocab       151,936
n_layer       36
n_head        16
n_head_kv     2          grouped-query attention
n_embd        2,048
n_ff          11,008
n_ctx_train   32,768
```

## Step 1: what the chat template does

The message as typed is six tokens.

```text
"Why is the sky blue?"
[10234, 374, 279, 12884, 6303, 30]
'Why' ' is' ' the' ' sky' ' blue' '?'
```

What the model actually receives is twenty-five, because the template wraps it
in a system message and role markers.

```text
151644 '<|im_start|>'   8948 'system'      198 '\n'
  2610 'You'             525 ' are'        264 ' a'
 10950 ' helpful'      17847 ' assistant'   13 '.'
151645 '<|im_end|>'      198 '\n'
151644 '<|im_start|>'    872 'user'         198 '\n'
 10234 'Why'             374 ' is'          279 ' the'
 12884 ' sky'           6303 ' blue'         30 '?'
151645 '<|im_end|>'      198 '\n'
151644 '<|im_start|>'  77091 'assistant'    198 '\n'
```

Six to twenty-five. The server confirms it independently as `prompt_n: 25`.

Most people have never been told their raw message is not what gets sent, which
is why this is shot 1 rather than a footnote.

## Step 2: generating, at temperature 0

Forty tokens requested, forty produced, so forty forward passes after the
prompt's one.

```text
The sky appears blue due to a phenomenon called Rayleigh scattering. Here's a
brief explanation:

1. **Sunlight Composition**: The sunlight we see from the sun is a mix of all
colors of
```

### The step worth drawing

Most steps are not close. Step 5 is, and it is the one that shows a search space
actually collapsing rather than rubber-stamping:

```text
step 5, after "The sky appears blue"
  47.9%  ' due'          id 4152     <- chosen
  26.3%  ' to'           id 311
  13.5%  ' primarily'    id 15503
  10.6%  ' because'      id 1576
   1.4%  ' mainly'       id 14576
```

Step 9 is a clean two-way split and is the backup if shot 2 needs a shorter one:

```text
step 9, after "...due to a phenomenon"
  88.1%  ' called'       id 2598     <- chosen
  11.8%  ' known'        id 3881
   0.1%  ' in'           id 304
```

And step 1 is the opposite case, which is worth knowing before claiming every
step is a real contest:

```text
step 1
 100.0%  'The'           id 785
   0.0%  'You'  'Why'  'That'  'It'
```

Every one of those is a score over all 151,936 entries. The five shown are the
top five of that many.

## Step 3: prefill against decode

```text
                    run 1     run 2
prompt_n              25        25
prompt_per_token      2.07 ms   2.09 ms
predicted_n           40        40
predicted_per_token   9.28 ms   9.21 ms
```

Prefill is about 4.5 times cheaper per token than decode, because the prompt's
tokens go through the stack together and generated tokens cannot: each one has
to exist before the next can be computed.

## Step 4: the catch, as a count

The cache is the honest version of the catch. A millisecond is a property of
this laptop; bytes per token are a property of the model.

```text
n_layer 36, n_embd_k_gqa 256, n_embd_v_gqa 256, f16
per token: 36 x (256 + 256) x 2 = 36,864 bytes (36 KB)

  1,000 tokens of conversation      35 MB
  8,192 tokens                     288 MB
 32,768 tokens                   1,152 MB
```

The arithmetic checks against the server's own allocation exactly. At the 16,384
context this run used, 36,864 x 16,384 is 576 MiB, and the log reports
`MTL0 KV buffer size = 576.00 MiB`.

`n_embd_k_gqa` is 256 rather than 2,048 because of grouped-query attention:
sixteen query heads share two key/value heads. Without it the cache would be
eight times larger.

## Step 5: the catch, as a time

Three runs at each context length, both sessions. The trend is real and the
absolute numbers are not.

```text
prompt_n     run 1 (3x)             mean     run 2 (3x)             mean
   130       8.91  8.76  8.69       8.79     8.70  8.78  8.85       8.78
   858       8.84  8.80  8.83       8.82     8.96  8.85  8.97       8.93
 2,522       9.37  9.28  9.25       9.30     9.28  9.51  9.47       9.42
 5,850      10.22 10.16 10.14      10.17    10.49 10.19 10.68      10.45
11,674      11.63 11.65 11.64      11.64    11.98 11.69 11.69      11.79
```

Monotonic in both sessions, and tight within a length. About 1.3 times slower
per token across a 90 times longer conversation.

That ratio is what goes on screen, not the milliseconds. It is also worth being
honest that 1.3x is modest: at these lengths the weights dominate and attention
does not. The dramatic figure is the memory, not the clock.

An earlier version of this sweep ran once per length and produced 9.2, 9.5, 16.2
and 11.2 ms, which looked like no trend at all and nearly got the catch thrown
out. One run per point was the bug.

## What is stable and what is not

Three runs. Two on 2026-09-10 at 22:59 and 23:00, and a third on 2026-09-11 at
01:32, two and a half hours later, which is the separation the playbook asks
for.

Identical in all three:

```text
raw tokens                       6
templated tokens                25
tokens generated                40
n_vocab                    151,936
n_layer                         36
n_head / n_head_kv           16 / 2
n_embd                       2,048
n_ff                        11,008
KV cache per token      36,864 bytes
every top-5 probability, to the decimal
the generated text, character for character
```

At temperature 0 the sampling is deterministic, which is why the probabilities
and the answer reproduce exactly across ten hours and three server starts. That
is a property of the setting, not luck, and any other temperature would break
it.

Moved between runs:

```text
prompt_per_token       2.07 / 2.09 / 1.92 ms
predicted_per_token    9.28 / 9.21 / 9.27 ms
```

Decode is tight. Prefill moved 8 percent, wider than the 1 to 3 percent the
first two runs suggested, which pulls the prefill-to-decode ratio between 4.4
and 4.8. "About 4.5 times" still holds, and it is a ratio rather than an
absolute for exactly this reason.

The decode sweep held a third time and is monotonic in every session:

```text
prompt_n     run 1     run 2     run 3
   130        8.79      8.78      8.76
   858        8.82      8.93      8.87
 2,522        9.30      9.42      9.46
 5,850       10.17     10.45     10.21
11,674       11.64     11.79     11.68
```

1.33 times across a 90 times longer conversation, from 1.32 and 1.34. The trend
is real and the modest size of it is real too.

### What the third run changed

Nothing that reaches a frame. The cut puts only counts on screen, and every
count was already identical. The recorded millisecond figures moved to the means
of three sessions, 2.03 and 9.25, and the render is byte for byte the file it
was before the edit.

That is the useful outcome of a third run on a cut like this: it confirms that
the figures which are drawn are the figures that do not move.
