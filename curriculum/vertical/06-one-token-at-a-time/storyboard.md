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
shot 1   the message becomes tokens      0 to 200   200f   6.7s
shot 2   up the stack, one token out   200 to 420   220f   7.3s
shot 3   the loop, and the cache       420 to 640   220f   7.3s
shot 4   end card                      640 to 780   140f   4.7s
```

## Shot 1. The message becomes tokens

Opens on the chat frame with the line already typed, and send is pressed inside
the first half second. No card in front of it.

The template arrives around it: the system message and the role markers fade in
above and below the question, visibly wrapping it rather than replacing it. Then
the whole block shatters into twenty-five tiles, each carrying its id.

The hero is the count going 6 to 25 while the six original tiles stay visible
inside the twenty-five. The surprise is not that text becomes numbers, it is
that four times as much of it arrives as was typed.

Tokens are drawn with their leading spaces shown, because `' is'` is the thing
that makes a token not a word.

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

The chosen token drops into the answer line in the chat frame.

Then the layout changes in exactly one way: instead of twenty-five columns
rising, one narrow column rises. Beside the stack, a cache block grows by one
slot per step and lights across its full width every time the column climbs.

That pairing is the whole shot. One token wide going up, the entire cache being
read across. It is the difference between "attention looks at everything" and
"the model reprocesses everything", and drawing it wrong is the error this shot
exists to prevent.

The answer types itself in the chat frame while a forward-pass counter climbs to
forty.

The hero is the cache widening while the stack stays one column narrow.

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

Thirty-one cues in twenty-six seconds. No music, no sustained texture. Gains are
in `Reel.tsx` and were set against the finished render rather than reasoned from
the source file levels.

```text
shot 1   f2    appear     the window
         f8    send       the message leaves it
         f34   settle     your six land, as one thing being placed
         f76   fill x5    the template's nineteen arrive, as data
         f146  tick       6 became 25, named

shot 2   f216  process x4 the front crossing thirty-six layers
         f276  dissolve   twenty-four columns going dark
         f304  appear     the vocabulary arriving
         f338  settle     it collapses
         f350  name       one kept. the heaviest cue in the cut
         f360  tick       151,936, named

shot 3   f430  process    pass one
         f448  process    pass two
         f466  process    pass three
         f484  fill x6    thirty-seven more, accelerating
         f560  tick       one pass per token, named

shot 4   f642  settle     the cost is placed
         f668  name       the mark
         f716  land       the closing line
```

Your six tokens and the template's nineteen get different cues on purpose.
`settle` is an object being placed and `fill` is data arriving one piece at a
time, and the difference between those two groups is the entire shot. Giving
them the same sound would flatten the thing shot 1 exists to show.

The three slow passes in shot 3 are cued individually and the thirty-seven fast
ones are a run of six that accelerates with the picture. Forty cues would be a
rhythm track, and one cue for forty passes would say the loop happened once.

No `scan`, the same as VR05. It marks elapsed time and nothing here is about how
long something takes. The layer climb is a machine doing four named pieces of
work, not a duration, which is why it is `process` and not a texture laid under
the shot.

### Measured levels

The standard asks for the heaviest cues near -5 dBFS and the quiet ones between
-14 and -19. On the finished render:

```text
name, one kept          -5.0     peak of the whole track
name, the mark          -6.1
land, closing line      -8.0
appear, vocabulary      -9.4
appear, the window     -11.1
fill, late in a run    -12.0
tick                   -12.1
settle, your six       -12.3
process                -12.3
dissolve               -14.2
settle, the card       -14.0
send                   -14.2
fill, first of a run   -19.1
```

Peak level -4.95 dBFS with no clipped samples.

Two cues were re-set after the first measurement. `dissolve` came in at -17.9,
the bottom of the range, for the moment twenty-four of twenty-five columns go
dark, which is the shot's first real event and the thing the cut wants people to
notice. `settle` on your six tokens was at -14.0 for a beat the whole first shot
turns on. Both went up.

Still owed: hearing it on a phone, at feed size, with the platform's own audio
laid over the top.

## Safe areas

Every shot puts a counter and a payoff line in the narration band, so
`Vertical-Safe-Area` has to be overlaid on a frame from all four before this is
believed. The chat frame runs the full width and stands between 190 and 1500,
with no message bubble crossing either reserve.
