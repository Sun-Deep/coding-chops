# Script

Status: published

The understanding check is not ticked and no render exists. This file is the
narration and the on-screen copy. The shot map is in `storyboard.md` and the
frame timings are in `src/vertical/06-one-token-at-a-time/narration.tsx`.

There is no voiceover and no music. The narration is burned into the frame as a
subtitle track, so this is the copy in the order it appears rather than a
recording script.

Every figure below is in `measurements.ts` and came off the run in
`measurements.md`. Nothing here was rounded to make a line land.

## The shape

Twenty-six seconds, four shots, no hook card.

Nine things happen between the send button and the first character of the
answer. They group into four shots because nine would be a hundred frames and
seven words each. Embedding does not get a beat of its own; it is shown as the
tokens entering the stack.

The chat frame is Coding Chops' own rather than a Claude or ChatGPT interface.
The numbers come from a model that can be measured, and no commercial model
publishes its vocabulary size, block count or logits. The mechanism is identical
across transformers, so only the badge would have differed, and the badge is the
part that would have been false.

## Narration

Ten lines, 49 words, twenty-six seconds. Payoff lines are marked, one per shot.
1.9 words a second, no line above 2.9.

```text
SHOT 1  the message comes apart                          0 to 140

f4      You typed 6 tokens.
f86     The model got 25.                                [payoff]

SHOT 2  every token reads every token before it        140 to 380

f144    All 25 go up through 36 layers.
f230    Only the last one produces anything.
f310    151,936 scored. One kept.                        [payoff]

SHOT 3  the loop, and the cache                        380 to 640

f384    It appends and runs again.
f452    Only the new token climbs.
f564    One pass per token.                              [payoff]

SHOT 4  end card                                       640 to 780

f644    Every token adds 36 KB.
f716    8,192 tokens is 288 MB.                          [payoff]
```

### The opening

Retimed on 2026-09-11 after the creator's verdict that the first two or three
seconds gave nobody a reason to stay.

Section 10 of the standard says frame zero should have something in motion and
something changing. The previous version spent its first thirty-four frames on
a static chat card, so nothing moved until 1.1 seconds and the shot's surprise
did not land until 4.9. "No hook card" had been read as licence for a slow open
rather than as the reason not to have one.

The first token now lifts on frame zero and the counter is climbing from frame
zero. The payoff lands at 2.9 seconds.

Shot 1 lost a line to get there. "The template wraps it first" was narrating
something the frame shows plainly. The two that remain read against the picture
on purpose: the first says six while the counter climbs past six, and the label
above it promises the reveal rather than describing the step.

## Shot 1. The message comes apart, 0:00 to 4:20

```text
YOUR MESSAGE · TOKENIZED

[the chat frame, a line typed into it, send]

"Why is the sky blue?"
[10234, 374, 279, 12884, 6303, 30]

[the template wraps it: system, role markers, then the whole
 thing shatters into 25 tiles carrying their ids]

TOKENS
6 -> 25

Your question is 6 tokens.
The template wraps it first.

6 became 25.

qwen2.5-3b · prompt_n confirms 25
```

## Shot 2. Every token reads every token before it, 4:20 to 12:20

```text
ONE FORWARD PASS · 36 LAYERS

[25 columns rise together through 36 blocks. at the top, 24 of
 them go dim and the last one stays lit]

[it fans into the vocabulary: 151,936 marks, collapsing to five,
 then to one]

  47.9%  ' due'          <- kept
  26.3%  ' to'
  13.5%  ' primarily'
  10.6%  ' because'
   1.4%  ' mainly'

All 25 go up through 36 layers.
Only the last one produces anything.

151,936 scored.
One kept.

step 5 · temperature 0 · top 5 of 151,936
```

## Shot 3. The loop, and the cache, 12:20 to 21:10

```text
AND AGAIN · ONCE PER TOKEN

[the chosen token drops into the line. one narrow column climbs
 the stack. beside it a cache block widens by one slot per step
 and lights across its whole width each time]

[the answer types itself in the chat frame]

FORWARD PASSES
1 -> 40

It appends and runs again.
Only the new token climbs.

One pass per token.

the earlier tokens are not recomputed · they are read
```

## Shot 4. End card, 21:10 to 26:00

```text
The model has no memory.
It has a cache.

36 KB per token, every token, both sides of the conversation
8,192 tokens is 288 MB, and every new token reads all of it

Every token adds 36 KB.
8,192 tokens is 288 MB.

[Coding Chops lockup]

measured, not estimated · full run in the repo
```

## Copy notes

No hook card, per section 10 of the standard. The cut opens on a message being
sent, because the surprise is what happens to it, and a card saying "how an LLM
works" spends two seconds of a still frame at the exact moment somebody decides
whether to keep scrolling.

"Only the new token climbs" rather than "it reads the whole conversation again".
The first version of this plan said the latter. It is true of attention and
false of compute: the KV cache means earlier tokens are never recomputed. The
receipt on shot 3 says so in as many words, because it is the misreading the
whole shot exists to prevent.

The end card leads with memory rather than milliseconds. Per-token time does
grow with the conversation, monotonically across both measurement sessions, but
only about 1.3 times over a 90 times longer chat, because at these lengths the
weights dominate and attention does not. Putting 1.3x on the card would be
technically true and would land as nothing. 36 KB a token lands.

Shot 2 uses step 5 and not step 1. Step 1 returned 'The' at 100 percent, and a
cut built on it would be showing a search space that never had a contest in it.
Step 5 has four live candidates, which is what collapsing actually looks like.

The vocabulary is 151,936 rather than "about 152,000" everywhere on screen. The
exact figure is the one that can be checked.

No em dashes, per the channel writing rules.
