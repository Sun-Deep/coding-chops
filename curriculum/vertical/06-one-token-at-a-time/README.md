# Vertical 06: One token at a time

Status: planned. No measurement run, no script, no render.

This file is the plan of record. The playbook's step 1 is the creator's call and
it has been made; step 2, the measurement, is next and gates everything after it.

## What it claims

A model does not write an answer. It writes one token, then reads the entire
conversation again including the token it just wrote, and picks one more. The
answer appears a token at a time because that is literally how it is made.

Each of those steps is a search space collapsing: about 152,000 vocabulary
entries scored, one chosen, and then the whole thing runs again.

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

It re-reads the whole conversation on every single token. Nothing is remembered
between passes in the way people assume. That is why a long chat gets slower and
costs more as it goes, and it is measurable as prefill against decode.

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

## Shape

Twenty seconds, 600 frames, four shots, about 38 words of narration.

```text
1  the prompt shatters      0 to 150   a typed line breaks into tokens with real ids
2  one forward pass       150 to 330   tokens through the stack, out comes a
                                       distribution over the vocabulary,
                                       collapsing to one
3  the loop               330 to 490   the token is appended, it all runs again,
                                       the answer types itself while the
                                       forward-pass counter climbs
4  end card               490 to 600   the catch
```

One hero per shot: the sentence shattering into tokens, the vocabulary column
collapsing to a single row, and the pass counter climbing while the answer
appears. No hook card, per section 10 of the standard.

## What step 2 has to produce

Tooling is present and the path is proven. `llama-tokenize` already returns
exact ids for a real prompt, `llama-server` returns per-token top-k
probabilities, and Qwen2.5-3B, Qwen3-1.7B and Qwen2.5-0.5B are on disk.

- the exact tokenization of the prompt the cut uses, with ids
- block count, attention heads, embedding length and vocabulary size from the
  GGUF metadata
- the top five candidate tokens with probabilities at two steps worth showing
- forward passes for the whole answer, which is the output token count
- prefill against decode, in tokens and in ms per token, for the catch
- two runs at least an hour apart, per the playbook, with anything that moves
  between them shown as a ratio rather than an absolute

Everything goes in `measurements.md` with the machine, and in
`src/vertical/06-one-token-at-a-time/measurements.ts` as the one place any shot
reads a figure from.

## Out of scope

Training, attention head internals, sampling parameters beyond naming that one
was chosen, KV cache mechanics, quantisation effects, and anything about a
specific commercial model's architecture.
