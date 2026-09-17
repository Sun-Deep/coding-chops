# Vertical 06: One token at a time

Status: published

Built, rendered and past the creator understanding check.
`scripts/measure-token-generation.sh` and `measurements.md` carry the run, and
`src/vertical/06-one-token-at-a-time/measurements.ts` carries the figures. This
file was still describing the cut as measured but unwritten long after it had a
script, a storyboard and a render; that is corrected here.

One thing the run changed. The catch was going to be "per-token time grows as
the conversation grows", and it does, but only about 1.3 times across a 90 times
longer chat, because at these lengths the model's weights dominate and attention
does not. The figure that is actually dramatic is memory: 36 KB of cache per
token, 288 MB at eight thousand tokens. The cut should lead with the memory and
mention the clock, not the other way round.

## What it claims

A model does not write an answer. It writes one token at a time, and every one
of them is chosen by scoring roughly 152,000 vocabulary entries and keeping one.

The prompt goes through the block stack once. After that only the newest token
is ever pushed through it again. The keys and values for everything before it
sit in a cache, which is read in full on every step and grows with the
conversation.

That second paragraph is a correction to the first version of this plan, which
said the model "reads the entire conversation again". At the attention level
that is true, because every new token attends over every earlier position. At
the compute level it is false, because the KV cache means earlier tokens are
never recomputed. Drawing the whole prompt climbing the stack on every step
would be wrong and somebody would say so.

The accurate picture is the better one to draw anyway: one narrow column going
up the stack, next to a cache that widens every step and is read whole each
time.

## Why this topic

It is the shape this page rewards. Every cut above 250K views is either a large
search space collapsing or a reference somebody keeps, and a forward pass is the
first of those with a mechanism nobody has drawn here. Dijkstra against A star
did 1.4M, selection sort 596K, the database index 65K, all the same shape.

Nothing in the back catalogue touches how a model works. The one caution is that
model and tooling news did 4.2K, the worst band on the page. This is not news.
News is a fact about a release; this is a mechanism with a measurement at the
end of it, which is the difference the format is built on.

## The catch

The cache is both why generation is fast and why a long conversation gets slow.

Every new token's attention reads every position stored in it, so the per-token
cost grows with the length of the chat, and the cache itself takes memory that
grows with it too. Without the cache, decode would be far worse. With it, the
thing that degrades is the one nobody sees.

Measurable as prefill against decode, in tokens and in ms per token.

A cut that stops at "it predicts the next token" is a fact people have already
heard. The catch is what makes it land.

## Which model, and why not Claude

The chat frame is Coding Chops' own, not a Claude or ChatGPT interface.

The numbers have to come from a model that can actually be measured, which means
a local open model. Claude's vocabulary size, layer count and logits are not
public. Wrapping measured Qwen internals in Claude's interface would be claiming
those are Claude's numbers, and the whole premise of this format is that a
figure on screen came off a real machine and can be checked.

The mechanism is identical across transformers. Only the badge would have
changed, and the badge is the part that would have been false.

Decided with the creator on 2026-09-10.

## The nine steps, and how four shots carry them

What actually happens between the send button and the first character of the
answer is nine steps. Nine shots would be 100 frames and seven words each, which
is a caption rather than an explanation, and the format asks for one hero per
shot. They group without losing anything:

```text
1 template + 2 tokenize     one idea: your words become tokens, more than you think
3 embed                     the entry to the stack, not a beat of its own
4 prefill + 5 logits
        + 6 sample          one idea: it all goes up, one distribution comes out,
                            and it collapses to one token
7 decode + 8 repeat         one idea: now only the new token goes up, reading a
                            cache that keeps growing
9 detokenize + stream       this is the answer appearing, already on screen in shot 3
```

Embedding does not get a shot. "Each id looks up a row of numbers" is true and
foundational and the least visual of the nine, and its hero would be weak. It is
shown as the tokens entering the stack as columns.

Step 1 is the surprise and it is measured. The chat template turns a six token
question into twenty-five tokens before the model sees anything, and most people
have never been told their raw message is not what gets sent. An early note in
this plan said twenty-six, from counting the printed list by eye; the script
counts it two ways and the server confirms it as `prompt_n`.

## Shape

Twenty-six seconds, 780 frames, four shots, about 52 words of narration.

Not twenty, which was the first plan, because the material is nine steps and
forty words could not carry the template surprise and the cache together. Not
thirty either: VR05 was cut from thirty to twenty-two for feeling long, and the
best performing cut on the page is twenty-seven seconds.

```text
1  send, template, tokens     0 to 200   six tokens become twenty-five
2  the stack, one token out 200 to 420   ~152,000 scored, one chosen
3  the loop and the cache   420 to 640   one pass per token, cache widening
4  the catch                640 to 780
```

One hero per shot: the sentence shattering into tokens, the vocabulary column
collapsing to a single row, and the cache growing wide while the stack stays one
token narrow. No hook card, per section 10 of the standard.

The failure mode is not length, it is becoming a tour. The claim stays "one
token at a time, against a growing cache". The nine steps are how it happens,
not what it says. If shot 2 starts explaining what a residual is, the cut is
gone.

## What step 2 has to produce

Tooling is present and the path is proven. `llama-tokenize` already returns
exact ids for a real prompt, `llama-server` returns per-token top-k
probabilities, and Qwen2.5-3B, Qwen3-1.7B and Qwen2.5-0.5B are on disk.

- the exact tokenization of the prompt the cut uses, with ids, both raw and
  after the chat template, since the gap between them is shot 1
- block count, attention heads, embedding length and vocabulary size from the
  GGUF metadata
- the top five candidate tokens with probabilities at two steps worth showing
- forward passes for the whole answer, which is the output token count
- prefill against decode, in tokens and in ms per token, for the catch
- how per-token decode time moves as the cache grows, which is the catch's
  actual claim and the one figure that has to hold up
- two runs at least an hour apart, per the playbook, with anything that moves
  between them shown as a ratio rather than an absolute

Everything goes in `measurements.md` with the machine, and in
`src/vertical/06-one-token-at-a-time/measurements.ts` as the one place any shot
reads a figure from.

## Out of scope

Training, what happens inside a block (normalisation, the feed-forward, the
residuals), grouped-query attention, the embedding matrix itself, sampling
parameters beyond naming that one was chosen, quantisation effects, and anything
about a specific commercial model's architecture.

The KV cache is in scope now and was not in the first version of this plan. It
cannot be left out, because leaving it out is what made the original claim
wrong.
