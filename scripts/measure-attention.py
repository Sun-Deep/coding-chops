"""Extract the full attention matrices for the prompt the reel uses.

Run through `scripts/measure-attention.sh`, which builds the environment. The
header of that script explains why this does not come out of llama.cpp.
"""

import json
import os

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL = os.environ.get("MODEL", "Qwen/Qwen2.5-3B-Instruct")
QUESTION = os.environ.get("QUESTION", "Will AI replace programmers?")
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

# ---------------------------------------------------------------------------
# Generation. Shot 3 draws an arc from each generated token back across the
# whole context, so those weights have to be measured too or they are
# decoration. Only the final position's row matters there: it is the one doing
# the attending, and it is what the shot draws.
# ---------------------------------------------------------------------------
GEN_STEPS = int(os.environ.get("GEN_STEPS", "40"))
GEN_LAYER = layers - 1

cur = ids
gen_rows = []
gen_pieces = []
for _ in range(GEN_STEPS):
    with torch.no_grad():
        step = model(cur, output_attentions=True, use_cache=False)
    row = step.attentions[GEN_LAYER][0].mean(0)[-1]      # head-averaged last row
    gen_rows.append([round(float(v), 5) for v in row])
    nxt = int(step.logits[0, -1].argmax())               # greedy, temperature 0
    gen_pieces.append(tok.decode([nxt]))
    cur = torch.cat([cur, torch.tensor([[nxt]])], dim=1)
    if nxt == tok.eos_token_id:
        break

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
    "generation": {
        "layer": GEN_LAYER,
        "steps": len(gen_rows),
        "pieces": gen_pieces,
        "text": "".join(gen_pieces),
        # row g has n + g entries: the prompt plus everything generated so far.
        "last_row_by_step": gen_rows,
    },
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
print(f"generated        {len(gen_rows)} tokens, last-row attention at layer {GEN_LAYER}")
print(f"                 {''.join(gen_pieces)[:64]!r}")
print(f"written to       {OUT}")
