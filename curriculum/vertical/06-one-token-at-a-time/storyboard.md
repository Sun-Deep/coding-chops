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

## Shot 2. Up the stack, and one token out

The twenty-five tiles turn on their side and become columns. They rise together
through a stack of thirty-six blocks, which is the measured `n_layer` and not a
decorative number.

At the top, twenty-four of the columns go dark and one stays lit. That is the
shot's first event and it is the one people do not expect.

The lit column then fans out into the vocabulary: a dense field of marks
standing for 151,936, collapsing to five labelled candidates and then to one.
The five are the measured top five at step 5, with their real percentages.

The hero is that collapse. It is the same shape as VR01's ten million rows going
to one, which is the shape this page rewards, and it is why the reel exists.

Nothing inside a block is drawn. No normalisation, no feed-forward, no
residuals. A block is a block. The moment shot 2 starts teaching what is inside
one, the cut has become a tour.

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

Deferred to step 6. Effects only, no music, roughly one cue every one and a half
seconds, levels per section 11 of the standard. The three events that must land
are the shatter in shot 1, the twenty-four columns going dark in shot 2, and the
cache lighting across its full width in shot 3.

No sustained texture. `scan` marks elapsed time and nothing here is about how
long something takes.

## Safe areas

Every shot puts a counter and a payoff line in the narration band, so
`Vertical-Safe-Area` has to be overlaid on a frame from all four before this is
believed. The chat frame runs the full width and stands between 190 and 1500,
with no message bubble crossing either reserve.
