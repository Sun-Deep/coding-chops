# Sources

The mechanism was checked against documentation and papers rather than recalled.
Every number in the cut is measured locally and recorded in `measurements.md`;
these are what the measurements were interpreted with.

- Vaswani et al., "Attention Is All You Need", for the block structure the
  measured `n_layer` counts.
  https://arxiv.org/abs/1706.03762
- Ainslie et al., "GQA: Training Generalized Multi-Query Transformer Models",
  for why `n_head_kv` is 2 against `n_head` 16, and why the cache is eight times
  smaller than the obvious guess.
  https://arxiv.org/abs/2305.13245
- Qwen2.5 Technical Report, for the model family the run measures.
  https://arxiv.org/abs/2412.15115
- Qwen2.5-3B-Instruct model card, including the chat template that turns six
  tokens into twenty-five.
  https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- llama.cpp, the runtime every figure came out of.
  https://github.com/ggml-org/llama.cpp
- llama.cpp server documentation, for `n_probs`, `completion_probabilities` and
  the `timings` block the prefill and decode figures are read from.
  https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
- GGUF format specification, for the metadata keys the shape is read from.
  https://github.com/ggml-org/ggml/blob/master/docs/gguf.md

## What the sources settled

That an index into the vocabulary is not a word. The tokenizer is BPE and the
pieces carry their leading spaces, which is why the run shows `' is'` and
`' the'` rather than `is` and `the`. Drawing tokens as words would have been the
easy error and it would have made the 6 to 25 jump inexplicable.

That only the final position's hidden state is multiplied by the output matrix
during generation. Every token in the prompt goes up the stack, and twenty-four
of the twenty-five produce nothing that is used for the next token. This is what
shot 2's middle line is for and it is the part people are most often surprised
by.

That the KV cache means earlier tokens are never recomputed. Attention for a new
token reads every stored position, and that is the sense in which the model
"looks at" the whole conversation, but the compute is one token wide. The first
version of this cut's plan had this wrong and it would have been drawn wrong.

That grouped-query attention is why `n_embd_k_gqa` is 256 and not 2,048. Sixteen
query heads share two key and value heads, so the cache stores two heads' worth
per layer rather than sixteen. Without it, 36 KB a token would be 288 KB.
