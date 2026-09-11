"""Extract the full attention matrices for the prompt the reel uses.

Run through `scripts/measure-attention.sh`, which builds the environment. The
header of that script explains why this does not come out of llama.cpp.
"""

import json
import os

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL = os.environ.get("MODEL", "Qwen/Qwen2.5-3B-Instruct")
QUESTION = os.environ.get("QUESTION", "Why is the sky blue?")
OUT = os.environ.get("OUT", "attention.json")

tok = AutoTokenizer.from_pretrained(MODEL)
# Eager attention is required. The fused sdpa kernel never materialises the
# matrix, so `output_attentions` comes back empty with the default.
model = AutoModelForCausalLM.from_pretrained(
    MODEL, dtype=torch.float32, attn_implementation="eager"
)
model.eval()

messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": QUESTION},
]
text = tok.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
ids = tok(text, return_tensors="pt").input_ids
pieces = [tok.decode([i]) for i in ids[0]]

with torch.no_grad():
    out = model(ids, output_attentions=True)

attn = out.attentions            # tuple(layers) of [batch, heads, q, k]
layers = len(attn)
heads = attn[0].shape[1]
n = attn[0].shape[2]

# Every row of every head is a probability distribution over the positions at or
# before it. Both of these are assertions rather than prints, because if either
# fails the tensor is not what this script thinks it is.
for li in (0, layers // 2, layers - 1):
    rows = attn[li][0].sum(-1)
    assert torch.allclose(rows, torch.ones_like(rows), atol=1e-4), f"layer {li} rows"
    upper = attn[li][0].triu(diagonal=1).abs().max()
    assert float(upper) == 0.0, f"layer {li} is not causal"

# The number the cut can put on screen: how many attention weights this one
# prompt costs. A causal 25 token matrix has 25 * 26 / 2 filled cells, per head,
# per layer.
per_head = n * (n + 1) // 2
total = per_head * heads * layers

shown = [0, layers // 3, (2 * layers) // 3, layers - 1]
matrices = {
    str(li): [
        [round(float(v), 5) for v in row]
        for row in attn[li][0].mean(0)          # head-averaged
    ]
    for li in shown
}

# Where the last position looks, per layer. This is the "converging on the token
# that speaks next" story, and it is a small enough table to read.
last_row = {
    str(li): sorted(
        (
            {"pos": i, "piece": pieces[i], "weight": round(float(w), 5)}
            for i, w in enumerate(attn[li][0].mean(0)[-1])
        ),
        key=lambda d: -d["weight"],
    )[:5]
    for li in shown
}

data = {
    "model": MODEL,
    "precision": "float32",
    "question": QUESTION,
    "tokens": n,
    "layers": layers,
    "heads": heads,
    "pieces": pieces,
    "ids": [int(i) for i in ids[0]],
    "weights_per_head_per_layer": per_head,
    "weights_total": total,
    "layers_captured": shown,
    "head_averaged": matrices,
    "last_position_top5": last_row,
}

with open(OUT, "w") as f:
    json.dump(data, f, indent=1)

print(f"model            {MODEL} (float32)")
print(f"tokens           {n}")
print(f"layers           {layers}")
print(f"heads            {heads}")
print(f"matrix per layer {n} x {n}, causal, rows sum to 1")
print(f"weights per head per layer   {per_head:,}")
print(f"weights for this one prompt  {per_head:,} x {heads} x {layers} = {total:,}")
print(f"captured layers  {shown}")
print(f"written to       {OUT}")
