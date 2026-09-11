#!/usr/bin/env bash
# Reproduce the measurements behind the token generation reel.
#
# Usage: scripts/measure-token-generation.sh
#        MODEL=/path/to/other.gguf scripts/measure-token-generation.sh
#
# Measures what actually happens between a chat message being sent and the first
# character of the answer appearing, on a real model on this machine:
#
#   1. what the chat template does to the message before the model sees it
#   2. the tokenization, with ids
#   3. the model's shape: blocks, heads, embedding width, vocabulary size
#   4. the top five candidates and their probabilities at every generated token
#   5. prefill against decode, in tokens and in ms per token
#   6. how per-token decode time moves as the KV cache grows, which is the catch
#
# Every number in `src/vertical/06-one-token-at-a-time/measurements.ts` comes
# from this script. Output is recorded in
# `curriculum/vertical/06-one-token-at-a-time/measurements.md` with the machine
# it ran on, because the timings are hardware dependent and the token counts,
# the probabilities and the model's shape are not.
#
# An open model, deliberately. The cut needs figures that can be checked, and no
# commercial model publishes its vocabulary size, block count or logits. The
# mechanism is the same across transformers; only the badge would differ, and
# the badge is the part that would have been false.
#
# Needs llama.cpp (llama-server, llama-tokenize), curl and jq.

set -euo pipefail

MODEL="${MODEL:-$HOME/Downloads/qwen2.5-3b-instruct-q4_k_m.gguf}"
PORT="${PORT:-8177}"
HOST=127.0.0.1
CTX=16384
QUESTION="${QUESTION:-Will AI replace programmers?}"
WORK="$(mktemp -d)"
SERVER_LOG="$WORK/server.log"

for c in llama-server llama-tokenize curl jq; do
  command -v "$c" >/dev/null || { echo "$c not on PATH" >&2; exit 1; }
done
[ -f "$MODEL" ] || { echo "no model at $MODEL" >&2; exit 1; }

cleanup() {
  [ -n "${SERVER_PID:-}" ] && kill "$SERVER_PID" 2>/dev/null || true
  rm -rf "$WORK"
}
trap cleanup EXIT

api() { curl -sS "http://$HOST:$PORT$1" "${@:2}"; }

# Written out here rather than inlined at the call site, because a python
# heredoc nested inside a loop is how the first draft of this script broke.
cat > "$WORK/cache_size.py" <<'CACHE_PY'
import re, sys

log = open(sys.argv[1], errors="ignore").read()


def val(key):
    m = re.search(rf"print_info: *{key} *= *([0-9]+)", log)
    return int(m.group(1)) if m else None


layers, k, v = val("n_layer"), val("n_embd_k_gqa"), val("n_embd_v_gqa")

if None in (layers, k, v):
    print("  could not read the shape out of the server log")
    raise SystemExit(0)

# An f16 cache stores two bytes per element, one key and one value per layer
# per token. n_embd_k_gqa is below n_embd because of grouped-query attention,
# so this is smaller than the obvious guess and it is worth showing why.
per_token = layers * (k + v) * 2

print(f"  n_layer {layers} - n_embd_k_gqa {k} - n_embd_v_gqa {v} - f16")
print(f"  per token: {layers} x ({k} + {v}) x 2 = {per_token:,} bytes ({per_token / 1024:.0f} KB)")
for n in (1_000, 8_192, 32_768):
    print(f"  {n:,} tokens of conversation: {per_token * n / 1024 / 1024:,.0f} MB")
CACHE_PY

echo "== machine =="
sysctl -n machdep.cpu.brand_string 2>/dev/null || uname -m
sw_vers 2>/dev/null | tr '\n' ' '; echo
echo "model: $(basename "$MODEL")"

# ---------------------------------------------------------------------------
# 1 and 2. The template, and the tokenization.
#
# Done with llama-tokenize rather than through the server, because it is
# deterministic and needs no model loaded into memory to be reproducible.
# ---------------------------------------------------------------------------
printf '%s' "$QUESTION" > "$WORK/raw.txt"
cat > "$WORK/templated.txt" <<TPL
<|im_start|>system
You are a helpful assistant.<|im_end|>
<|im_start|>user
$QUESTION<|im_end|>
<|im_start|>assistant
TPL

echo
echo "== the message as typed =="
echo "\"$QUESTION\""
llama-tokenize -m "$MODEL" -f "$WORK/raw.txt" --ids 2>/dev/null | tail -1
count_ids() { llama-tokenize -m "$MODEL" -f "$1" --ids 2>/dev/null | tail -1 | tr -cd ',' | wc -c | awk '{print $1+1}'; }
RAW_N=$(count_ids "$WORK/raw.txt")
echo "raw tokens: $RAW_N"

echo
echo "== what the model actually receives, after the chat template =="
llama-tokenize -m "$MODEL" -f "$WORK/templated.txt" 2>/dev/null
TPL_N=$(count_ids "$WORK/templated.txt")
echo "templated tokens: $TPL_N"

# ---------------------------------------------------------------------------
# 3. The model's shape, read off the server's own load log.
# ---------------------------------------------------------------------------
echo
echo "== starting llama-server =="
llama-server -m "$MODEL" --host "$HOST" --port "$PORT" -c "$CTX" \
  --no-warmup -lv 4 > "$SERVER_LOG" 2>&1 &
SERVER_PID=$!

for _ in $(seq 1 120); do
  if api /health 2>/dev/null | grep -q '"status"'; then break; fi
  sleep 1
done
api /health >/dev/null 2>&1 || { echo "server did not come up" >&2; tail -20 "$SERVER_LOG" >&2; exit 1; }
echo "up on port $PORT"

echo
echo "== the model's shape =="
grep -iE "print_info: *(arch|n_ctx_train|n_embd|n_layer|n_head|n_ff|n_vocab|n_expert|model params|model size|model type) " \
  "$SERVER_LOG" | sed 's/^.*print_info: *//' | head -24 || true
grep -iE "n_vocab|vocab type|vocab only" "$SERVER_LOG" | sed 's/^.*: *//' | head -4 || true

echo
echo "== the shape of the KV cache =="
# The cache is the catch, and unlike a millisecond it is exact. Every layer
# stores a key and a value for every token, sized n_embd_k_gqa and
# n_embd_v_gqa, which are smaller than n_embd because this model uses
# grouped-query attention. The server prints its own allocation, which is the
# check on the arithmetic.
grep -iE "print_info: *(n_embd_k_gqa|n_embd_v_gqa) " "$SERVER_LOG" | sed 's/^.*print_info: *//' | head -2 || true
grep -iE "KV self size|kv cache size|KV buffer" "$SERVER_LOG" | sed 's/^.*: *//' | head -4 || true

# ---------------------------------------------------------------------------
# 4 and 5. Generate, with the top five candidates at every step.
# ---------------------------------------------------------------------------
echo
echo "== generating, with the top 5 candidates at each token =="
jq -n --rawfile p "$WORK/templated.txt" \
  '{prompt:$p, n_predict:40, n_probs:5, temperature:0, cache_prompt:false}' \
  > "$WORK/req.json"

api /completion -H 'Content-Type: application/json' -d @"$WORK/req.json" > "$WORK/gen.json"

echo
echo "-- the answer --"
jq -r '.content' "$WORK/gen.json"

echo
echo "-- token by token, top 5 --"
# The server reports natural log probabilities under `top_logprobs`, so the
# percentage on screen is exp(logprob). Older builds used `probs` with a plain
# `prob`, which is what the first version of this script asked for and why it
# came back null.
jq -r '
  (.completion_probabilities // [])
  | to_entries[]
  | "step \(.key + 1)  chose \(.value.token | @json)  id \(.value.id)\n" +
    ([ .value.top_logprobs[]
       | "      \((.logprob | exp) * 1000 | round / 10)%  \(.token | @json)  id \(.id)" ]
     | join("\n"))
' "$WORK/gen.json" | head -72

echo
echo "-- prefill against decode --"
jq -r '.timings | to_entries[] | "  \(.key): \(.value)"' "$WORK/gen.json"

# ---------------------------------------------------------------------------
# 6. The catch. Per-token decode cost as the cache grows.
#
# Same 32 token generation each time, with a longer and longer conversation in
# front of it. `prompt_n` is read back from the server rather than assumed, so
# the x axis is measured too.
# ---------------------------------------------------------------------------
echo
echo "== decode cost as the KV cache grows =="
# Three runs at each length. The first version of this sweep ran once and gave
# 9.2, 9.5, 16.2 and 11.2 ms per token at increasing context, which is not a
# trend, it is a laptop. A figure that moves like that does not go on screen as
# an absolute, and printing all three runs keeps the spread in the record
# instead of hiding it behind an average.
FILLER="The engineer checked the logs again and found nothing unusual in them. "
printf '  %-10s %-6s %s\n' "prompt_n" "run" "ms_per_token"

for reps in 8 64 192 448 896; do
  BODY=$(python3 -c "import sys; sys.stdout.write(sys.argv[1] * int(sys.argv[2]))" "$FILLER" "$reps")
  {
    printf '<|im_start|>system\nYou are a helpful assistant.<|im_end|>\n<|im_start|>user\n'
    printf '%s\n%s' "$BODY" "$QUESTION"
    printf '<|im_end|>\n<|im_start|>assistant\n'
  } > "$WORK/ctx.txt"

  jq -n --rawfile p "$WORK/ctx.txt" \
    '{prompt:$p, n_predict:32, temperature:0, cache_prompt:false}' > "$WORK/creq.json"

  for run in 1 2 3; do
    api /completion -H 'Content-Type: application/json' -d @"$WORK/creq.json" > "$WORK/cres.json"
    jq -r --arg run "$run" '
      if .timings == null
      then "  (no timings: prompt likely exceeded the context)"
      else "  \((.timings.prompt_n|tostring) + "          " | .[0:10]) \($run)      \(.timings.predicted_per_token_ms * 100 | round / 100)"
      end' "$WORK/cres.json"
  done
done

echo
echo "== how much cache that is =="
# Bytes per token, from the model's own shape rather than from a stopwatch.
# This is the version of the catch that holds up: a count, not a millisecond.
python3 "$WORK/cache_size.py" "$SERVER_LOG"

echo
echo "done. stopping server."
