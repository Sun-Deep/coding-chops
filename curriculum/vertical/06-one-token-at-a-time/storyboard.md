# Storyboard

Twenty-six seconds, 780 frames at 30 fps, four shots, no hook card. The copy is
in `script.md` and the figures are in
`src/vertical/06-one-token-at-a-time/measurements.ts`.

## The spine

The chat frame is on screen at the start and at the end, and the middle is what
happens between them. The viewer sends a message in shot 1 and watches the
answer type itself in shot 3, so the interior is not an abstraction sitting
beside the interface, it is inside it.

```text
shot 1   the message comes apart          0 to 140   140f   4.7s
shot 2   every token reads every token  140 to 380   240f   8.0s
shot 3   the loop, and the cache        380 to 640   260f   8.7s
shot 4   end card                       640 to 780   140f   4.7s
```

## Shot 1. The message becomes tokens

Opens on the chat frame with the line already typed, and send is pressed inside
the first half second. No card in front of it.

Rebuilt on 2026-09-11. The first version faded the chat frame out and faded a
wall of twenty-five chips in. Every fact was on screen and nothing crossed the
frame, which is the readout-instead-of-object failure the playbook names.

Now the six tokens the viewer typed lift out of the bubble and fly to their
slots, staggered so the sentence comes apart left to right rather than all at
once, and the nineteen the template added fill in around them from the middle
outwards so the six stay legible longest.

The row ends at exactly the positions shot 2 opens on. The cut walks out of the
interface and into the network without the object cutting.

Text rides the flight and drops away on landing. Twenty-five labels do not fit
at a 35 pixel pitch and `<|im_start|>` does not fit at any pitch, so the row
ends as marks and a receipt underneath names three of them with their ids.
Shrinking the type until it technically fitted would have been a chart nobody
can read instead of an object anybody can.

The hero is six becoming twenty-five while the six stay visible inside the
twenty-five. The surprise is not that text becomes numbers, it is that four
times as much of it arrives as was typed.

### What rendering caught

The flight used `EASE_OUT`, which is heavily front loaded, so the six had landed
by frame 62 of a window running to 92. Two thirds of the travel happened in the
first third of its time and the words were never readable. It uses the
symmetric curve now.

The labels also faded from 55 percent of the travel, which made them anonymous
bars before they were halfway down. They now hold to 82 percent.

And the counter sat on a zero for the opening second, the same dead frame shot 2
had. It arrives with the first token.

## Shot 2. The network, and the one token that comes out of it

This shot was rebuilt on 2026-09-11. The first version drew thirty-six layers as
a grid of squares with a list of percentages under it, which carried the same
information and gave nobody a reason to stop scrolling. The playbook says to
build objects rather than readouts and that version broke its own rule inside
its own storyboard.

Twenty-five nodes on a line, one per token, and an arc from every token back to
every token before it. The triangle those arcs make is the causal mask: position
i reaches everything up to itself and nothing after. No arc is ever drawn
forwards, because there is nothing there to draw.

**Every arc is a measured attention weight.** `scripts/measure-attention.sh`
pulls the head-averaged matrices out of the same model at four depths, and
`src/vertical/06-one-token-at-a-time/attention.ts` is generated from that run.
An arc's brightness is its weight normalised against the strongest weight in its
own row. Raw weights would draw almost nothing, since a row of twenty-five sums
to one and averages 0.04; normalising per row shows where each token actually
looks. That is a contrast choice and it does not change a number.

Three beats, each under its own narration line.

The field fills as the front crosses the layers, and the readout counts the
layer rather than sitting on a zero. The first version held a 0 under the stack
for four seconds before the vocabulary arrived.

Then everything fades except the arcs into the token that speaks next, under
"only the last one produces anything". That is the shot's first real surprise
and it is the part people are least likely to know.

Then that token fires into the vocabulary, which collapses to five labelled
candidates and then to one. The survivors grow and brighten; leaving them the
same size as the 890 marks around them made the collapse register as a few dots
getting slightly oranger.

The receipt carries the number the shot is really about: 325 weights per head,
sixteen heads, thirty-six layers, 187,200 attention weights for one six-word
question.

Nothing inside a block is drawn. No normalisation, no feed-forward, no
residuals. The moment this shot teaches what is inside a layer it is a tour
rather than a claim.

## Shot 3. The loop, and the cache

Rebuilt on 2026-09-11 with shot 2. The first version drew the idea three times
over: a single column standing for the stack, a cache strip beside it, and a
chat card on top of both. All three of its faults came from that.

The column used `rise > 0 ? 1 : 0`, and during the fast passes the sub-pass
progress alternated 0 and 0.5 every frame, so it switched fully dark every
other frame. A 15 Hz strobe, not a style.

The cache strip capped at 51 slots when it needed 65, so the one object whose
entire job is to grow visibly stopped growing at 17.7 seconds and contradicted
the shot's own claim.

The chat card with a two line answer ran 62 pixels into the column.

### What it is now

One object. The row of nodes is the cache: it starts at the prompt's
twenty-five and gains one per generated token, and the pitch compresses to keep
it in frame, so the context visibly densifies as the answer gets longer. Each
pass fans an arc from the newest token back across every position before it.

That pairing is the claim the cut turns on. The compute is one token wide and
the reading is the whole context, and drawing it the other way round is the
error the original plan made in words before this shot made it in pixels.

Every arc is a measured weight. `scripts/measure-attention.sh` captures the
final position's attention row at each of the forty generation steps, so row g
has `25 + g` entries and grows by one a step. The generated text matches
llama.cpp's output on the same prompt token for token, which is the check that
the two runtimes are doing the same thing.

Earlier fans persist at a decaying alpha for seven steps so the picture
accumulates rather than blinking, computed from how many steps ago each fired
rather than remembered between frames.

The chat card is reply-only here: no header, no question bubble. Shot 1
established those and repeating them cost three hundred pixels and the overlap.

### Verified

On the finished render the maximum frame-to-frame difference fell from 8.59 to
3.09, and shot 3 has one frame in two hundred and twenty that jumps more than
1.5 against its predecessor. The strobe is gone rather than reduced.

## Shot 4. End card

The cost, following VR01 and VR05. The model has no memory, it has a cache, and
the cache is 36 KB a token for both sides of the conversation.

The 1.3 times slowdown is not on the card. It was measured and it is real, but
it is modest and it would land as nothing next to the megabytes.

## Colour note

One accent, from `palette.ts`. It belongs to the token being chosen: the winning
candidate in shot 2, and the token dropping into the answer in shot 3. The
stack, the tiles and the cache are neutral.

The cache does not take the accent even in shot 4, because it is the cost rather
than the answer, and the accent has meant "where the answer is" since VR01.

## Cue map

Rebuilt on 2026-09-11 against the rebuilt animation. The previous map had
survived two rebuilds still pointing at events that no longer existed: `process`
cues for a layer climb that had been deleted, a `dissolve` for columns that no
longer went dark.

**Cue times are derived, not typed in.** The six landings and the forty passes
are found by sampling the same interpolation the shots use, in `Reel.tsx`, so a
cue cannot drift from the thing it marks. Change the animation and the cues move
with it.

```text
shot 1   f2     appear       the window
         f8     send         the message leaves it
         f57-79 settle x6    each typed token landing in its slot, on the
                             flight's own stagger
         f98    fill x5      the nineteen the template adds
         f146   tick         6 became 25, named

shot 2   f206   fill x6      rows of arcs arriving as the front crosses layers
         f292   dissolve     the arcs going out, leaving one
         f334   appear       the vocabulary
         f350   settle       it collapses
         f353   tick x5      five candidates
         f368   name         one kept. the heaviest cue in the cut

shot 3   f445+  code-step    one per forward pass, 27 of them
         f560   tick         one pass per token, named

shot 4   f642   settle       the cost is placed
         f684   name         the mark
         f716   land         the closing line
```

Sixty cues, of which twenty-seven are the pass run. Counting that run as the one
event stream it is, there are thirty-three discrete cues in twenty-six seconds.

### Why the passes are thinned

All forty passes land between frames 25 and 126 of shot 3, and the easing puts
some of them a single frame apart. Thirty cues a second do not read as thirty
events, they fuse into a tone, and a rasp under this shot would be exactly the
sustained texture the sound set's own notes warn about. The cues are floored at
three frames apart, about ten a second, which is the fastest a listener still
hears as separate. That leaves twenty-seven.

The passes that lose a cue are not passes the cut pretends did not happen. The
counter shows forty and the row grows forty times. The run marks the stream, the
way the standard already treats a counting run.

Gain scales with the gap to the previous pass, so the dense middle sits back and
the slow ends step forward. The sound accelerates and slows with the picture
instead of keeping its own time against it.

`code-step` is the right cue for it: the set lists it for execution advancing to
the next line, and a forward pass is the machine taking one step. It is also the
quietest file in the set at -36.6 dBFS, which is why its gains run higher than
anything else in the cut.

Your six tokens and the template's nineteen still get different cues. `settle`
is an object being placed and `fill` is data arriving one piece at a time, and
the difference between those two groups is the whole of shot 1.

No `scan` anywhere. It marks elapsed time and nothing here is about how long
something takes.

### Measured levels

The standard asks for the heaviest cues near -5 dBFS and the quiet ones between
-14 and -19. On the finished render:

```text
name, one kept          -5.0     peak of the whole track
name, the mark          -6.1
land, closing line      -8.0
appear, the vocabulary  -8.9
settle, sixth landing   -9.7
appear, the window     -11.1
tick                   -12.1
settle, the collapse   -12.6
settle, first landing  -13.6
send / dissolve        -14.0
code-step, sparse      -15.5
code-step, dense       -17.4
fill, first of a run   -19.1
```

Peak level -5.02 dBFS with no clipped samples.

Two cues were re-set after the first measurement. The fourth candidate tick
landed on the same frame as the name and the two summed to -3.2, over the target
for the loudest thing in the cut. And the pass cues were first set from the
gains the old map used, which put them at -21 because `code-step` is fifteen
decibels quieter than the files those gains were written for.

Still owed: hearing it on a phone, at feed size, with the platform's own audio
laid over the top.

## Safe areas

Every shot puts a counter and a payoff line in the narration band, so
`Vertical-Safe-Area` has to be overlaid on a frame from all four before this is
believed. The chat frame runs the full width and stands between 190 and 1500,
with no message bubble crossing either reserve.

## The quiet tail in shot 2

The frozen-frame check reports 1.80 seconds under threshold from frame 318. That
is the payoff line being read, not the video stalling, and the two are not
distinguishable to a luminance difference: five lines of 30 pixel text fading in
on a 1080 by 1920 frame do not move the average enough to register, however they
are staggered.

The playbook's own rule is that a shot's length is its animation plus the time
somebody needs to read the payoff. "151,936 scored. One kept." is up from 310 to
372, which is 2.07 seconds at 1.9 words a second. It is deliberate. Chasing the
metric here would mean cutting the shot before its payoff can be read.
