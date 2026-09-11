#!/usr/bin/env bash
# Reproduce the attention measurements behind the token generation reel.
#
# Usage: scripts/measure-attention.sh
#        VENV=/path/to/venv scripts/measure-attention.sh   # reuse an existing one
#
# `scripts/measure-token-generation.sh` measures everything llama.cpp will
# report: tokenization, the model's shape, per-token probabilities, timings and
# the KV cache. It cannot report attention weights. llama.cpp's eval callback
# does dump the `kq_soft_max` tensor per layer, which is exactly the matrix, but
# it truncates every dimension to three elements and the key dimension is padded
# to 256, so a 25 token prompt comes back with three of its columns visible.
# Turning flash attention off and forcing the CPU backend does not change that.
#
# So attention comes from the same model through transformers instead, where the
# full matrix is returned. Same weights, same tokenizer, same 25 tokens, and the
# token count is checked against llama.cpp's `prompt_n` at the end of this
# script so the two runtimes cannot silently disagree.
#
# The one difference worth stating: llama.cpp runs the Q4_K_M quantization and
# this runs float32. Quantization moves attention weights slightly. Every figure
# that goes on screen from here is a weight, not a count, so it is labelled as
# coming from the float32 weights.
#
# Needs python3.12 or newer. It builds its own virtual environment and downloads
# about 6 GB of weights on the first run.

set -euo pipefail

MODEL="${MODEL:-Qwen/Qwen2.5-3B-Instruct}"
QUESTION="${QUESTION:-Will AI replace programmers?}"
OUT="${OUT:-curriculum/vertical/06-one-token-at-a-time/attention.json}"
VENV="${VENV:-.attention-venv}"

PY=$(command -v python3.12 || command -v python3.13 || command -v python3 || true)
[ -n "$PY" ] || { echo "no python found" >&2; exit 1; }

if [ ! -x "$VENV/bin/python" ]; then
  echo "== building $VENV =="
  "$PY" -m venv "$VENV"
  "$VENV/bin/pip" install --quiet --upgrade pip
  "$VENV/bin/pip" install --quiet torch transformers
fi

echo "== versions =="
"$VENV/bin/python" -c "import torch,transformers;print('torch',torch.__version__);print('transformers',transformers.__version__)"

MODEL="$MODEL" QUESTION="$QUESTION" OUT="$OUT" "$VENV/bin/python" scripts/measure-attention.py

echo
echo "== cross-check against llama.cpp =="
GGUF="${GGUF:-$HOME/Downloads/qwen2.5-3b-instruct-q4_k_m.gguf}"
if [ -f "$GGUF" ] && command -v llama-tokenize >/dev/null; then
  tmp=$(mktemp)
  printf '<|im_start|>system\nYou are a helpful assistant.<|im_end|>\n<|im_start|>user\n%s<|im_end|>\n<|im_start|>assistant\n' "$QUESTION" > "$tmp"
  n=$(llama-tokenize -m "$GGUF" -f "$tmp" --ids 2>/dev/null | tail -1 | tr -cd ',' | wc -c | awk '{print $1+1}')
  rm -f "$tmp"
  echo "  llama-tokenize says $n tokens"
  python3 -c "
import json,sys
d=json.load(open('$OUT'))
a,b=d['tokens'],$n
print(f'  transformers says {a} tokens')
print('  MATCH' if a==b else '  MISMATCH, do not use these figures')
sys.exit(0 if a==b else 1)"
else
  echo "  skipped: no gguf or llama-tokenize on PATH"
fi
