# Problem Solving visual language

PS01 production delta for LeetCode 121, Best Time to Buy and Sell Stock.

## Status

This document extends:

- `docs/video-production-standard.md`
- `docs/visual-language.md`
- `AGENTS.md`
- `src/shared/video/motion.ts`
- the existing shared page and video primitives
- the existing narration, transcription, caption, duration and curriculum pipeline

Where this document is silent, the channel standards apply. It holds only the
conventions specific to the Problem Solving track or to PS01.

## 1. Teaching progression

PS01 runs in this order:

```text
one trade
-> possible buy and sell pairs
-> brute force
-> repeated work
-> cheapest-so-far insight
-> one-pass walkthrough
-> code
-> complexity
-> transferable pattern
```

The concrete thing comes before the abstraction that names it:

```text
cheapest price I've seen
        |
        v
     minPrice
```

not:

```text
minPrice
   |
   v
definition afterward
```

The same order applies to `maxProfit`, loops, Big O, code, state, and any
optimisation terminology.

## 2. Semantic motion vocabulary

Problem Solving scenes use eight motion meanings. These are semantic presets
over the existing shared motion and ink systems, not a second motion engine.

Every frame count assumes the current 30 fps composition.

### Opacity states

Every ordinary instructional element sits at one of three opacities:

```text
active   1.0
resting  0.55
faded    0.30
```

Interpolate between them during a transition. Do not come to rest anywhere
else.

### Canonical semantic motions

| Motion      | Meaning                                     | Treatment                                                                                                                                           | Allowed properties                      |
| ----------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `draw`      | Reasoning or structure is being constructed | Typeset paths draw at 30px per frame of path length, floor 10 frames, ceiling 45. Recorded ink replays proportionally, scaled into the same bounds. | Stroke or replay progress only          |
| `slide`     | Movement through an ordered sequence        | `travel()` at 18, 22 or 26 frames by distance band, with the overshoot pinned below.                                                                | Translation along the intended path     |
| `circle`    | Current selection or important candidate    | Ink replay over 12 frames, then held. It never re-animates.                                                                                         | Annotation stroke only                  |
| `strike`    | Invalid or eliminated                       | Strike replays over 6 frames. From strike frame 3, the struck target moves to `faded` over 8 frames.                                                | Annotation stroke, then target opacity  |
| `lift`      | Existing information becomes active         | 8 frames, opacity `resting` to `active`, `translateY` 0 to -6px, approved ease-out.                                                                 | translateY and opacity                  |
| `store`     | New information enters persistent state     | `arrive()` over 12 frames, `translateY` -14 to 0. Opacity 0 to `active` over the first 8 frames.                                                    | translateY and opacity                  |
| `morph`     | Two representations are the same concept    | 16 frames in place. 20 frames for a full-frame representation change. A group morph is staggered single morphs, starts 12 to 16 frames apart.       | Translation, required geometry, opacity |
| `fade-back` | Present, but not the current priority       | 8 frames from the current state to `faded`.                                                                                                         | Opacity only                            |

### Slide distance bands

```text
short   <= 280px    -> 18 frames
medium  281-700px   -> 22 frames
long    > 700px     -> 26 frames
```

Distance is the visible movement of the primary object.

### Slide overshoot

`travel()` takes `back` and `past` as fractions of distance, so the defaults
grow the overshoot as the journey gets longer. A 1400px slide on the defaults
overshoots by 63px, which reads as a bounce. Hold the overshoot constant
instead:

```text
back = min(0.035, 10 / distance)
past = min(0.045, 13 / distance)
```

Short slides keep the helper's defaults. Everything longer overshoots by 10px
on the wind-up and 13px past the target, whatever the distance. The overshoot
then looks the same everywhere, which is the point of having a vocabulary.

### Draw rate

```text
durationFrames = pathLength / 30
10 <= durationFrames <= 45
```

Worked through:

```text
60px underline     60 / 30 = 2     clamped to 10 frames
600px graph path   600 / 30 = 20   20 frames
1800px path        1800 / 30 = 60  clamped to 45 frames
```

A fixed duration would make a short mark crawl and a long path snap.

### Multi-element morphs

A group transformation is not one long morph. Scene01's array becoming the
chart is six morphs:

```text
7 -> chart point
1 -> chart point
5 -> chart point
3 -> chart point
6 -> chart point
4 -> chart point
```

Each runs at its normal 16 or 20 frames. Their starts are staggered. The whole
transition can then take several seconds while every individual movement stays
inside the vocabulary.

### Lift

No scale, glow, shadow or rotation. Position and opacity carry the activation.

### Store

No scale. A value entering persistent state must arrive at the place it will
stay:

```text
$5
 |
 v  store
BEST PROFIT
$5
```

### Strike follow-through

A strike is not finished when the graphite mark is:

```text
frame 0    strike begins
frame 3    target begins fading
frame 6    strike completes
frame 11   target reaches faded
```

The overlap is what makes the target's loss of priority read as a consequence
of the mark rather than a separate event.

### Where the circle and strike durations come from

Both are measured, not chosen. Fourteen captured marks average 0.42s for a
circle and 0.18s for a strike, which at 30 fps is 12.6 and 5.4 frames.

The earlier values of 10 and 8 were guesses, and both were wrong in the same
way. They would have slowed a strike by 65% and hurried a circle by 26%. A
decisive slash replayed at two thirds speed stops reading as decisive.

Refit these if the drawing hand or the capture setup changes.

### The numbers live in code

Section 2 and the implementation cannot be allowed to drift, so the values
exist once:

```ts
export const problemSolvingMotion = {
  opacity: {
    active: 1,
    resting: 0.55,
    faded: 0.3,
  },
  draw: {
    pixelsPerFrame: 30,
    minFrames: 10,
    maxFrames: 45,
  },
  slide: {
    short: 18,
    medium: 22,
    long: 26,
    shortMaxPx: 280,
    mediumMaxPx: 700,
    backPx: 10,
    pastPx: 13,
    maxBack: 0.035,
    maxPast: 0.045,
  },
  circle: {
    duration: 12,
  },
  strike: {
    duration: 6,
    fadeStart: 3,
    fadeDuration: 8,
  },
  lift: {
    duration: 8,
    translateY: -6,
  },
  store: {
    duration: 12,
    opacityDuration: 8,
    translateY: -14,
  },
  morph: {
    inPlace: 16,
    fullFrame: 20,
    staggerMin: 12,
    staggerMax: 16,
  },
  fadeBack: {
    duration: 8,
  },
};
```

Placement and naming follow the existing shared video structure. No scene
redefines these locally.

### Adding a ninth

Scene implementation may not invent a semantic motion. A genuinely new meaning
goes into this section first, mapped to an approved shared helper.

## 3. Narration and visuals

While explaining, the narration and the picture carry different halves of the
thought.

Narration:

> "Day one, a share costs seven dollars."

Visual:

```text
Day 1
 * $7
```

Do not put the narrated sentence on screen while it is being spoken.

### Reinforcement exception

They may match when the repetition itself teaches. Approved cases:

Prediction prompts.

> "What's the most profit you can make?"

```text
MAXIMUM PROFIT = ?
```

Rule lock-ins.

> "Buy first. Sell after."

```text
BUY -> SELL
```

Titles and chapter holds, where short matching language is allowed.

The rule: complement while explaining, reinforce deliberately while prompting,
labelling or locking in.

## 4. Canonical representation

Every Problem Solving episode declares one canonical explanatory representation
before its storyboard is approved. It may also name secondary ones. The
canonical representation is the form the episode returns to when explaining the
problem itself.

### PS01

```text
canonical  plotted stock-price chart
secondary  array and cells
```

The chart is primary because vertical position makes a price difference
visible, horizontal position carries chronology, valleys are buying
opportunities and peaks are selling ones, and buy-before-sell becomes a spatial
fact rather than a remembered rule.

The array matters when introducing the LeetCode input, moving into code, and
discussing indices or iteration.

Scene01 opens on the array and morphs it into the chart. After that the chart
is home.

This decision covers PS01. Later episodes make their own.

## 5. Temporal grammar

```text
LEFT  ->  RIGHT
PAST      FUTURE
```

For PS01 that also means:

```text
BUY  ->  SELL
```

A valid transaction always moves forward in space.

### Callbacks

Scene01 fails the backwards `$1 -> $7` trade and locks in `BUY -> SELL`.

Scene02 moves every brute-force candidate left to right.

Scene03 puts every legal buying candidate to the left of the `$6` sell price.

Scene05 advances the current-day marker only rightward.

Chronological validity should become something the viewer reads off the screen
rather than something the narrator keeps repeating.

## 6. Focus budget

Every explanatory beat answers one question:

> Where should the viewer's eyes be right now?

One dominant target by default. Two when the beat compares them. If a still
frame does not answer it immediately, the composition is too busy.

### Scene01

> "Seven dollars leaves your pocket."

Focus: `$7`.

> "Three dollars comes back."

Focus: `$3`.

> "You're down four."

Focus: `-$4`.

> "Except the seven came first."

Focus moves off the arithmetic and onto chronological position.

The question belongs to storyboard review and render review.

## 7. Hero moment per scene

Each scene gets one planned visual event carrying its central idea. This is a
planning constraint, not permission to add spectacle.

| Scene     | Hero moment                                                                |
| --------- | -------------------------------------------------------------------------- |
| `Scene01` | The backwards transaction fails, then `BUY -> SELL` locks in               |
| `Scene02` | A manageable number of candidate pairs scales into obviously wasteful work |
| `Scene03` | Every previous buying candidate collapses to `$1`                          |
| `Scene04` | `[7,1,5,3]` compresses into `cheapest so far = $1`                         |
| `Scene05` | The viewer predicts `$5`, then `$5` stores into best profit                |
| `Scene06` | Human-language state morphs into `minPrice`, `maxProfit`, then code        |
| `Scene07` | Prices keep falling while best profit stays at `0`                         |
| `Scene08` | The many-pair model collapses into one linear traversal                    |
| `Scene09` | The visible past compresses into only what the future still needs          |

## 8. Caption-safe geometry

PS01 uses the canonical 1920 by 1080 composition.

`Captions.tsx` places subtitles at:

```text
bottom      42px
left        280px
right       280px
fontSize    28px
lineHeight  1.3
```

Two lines occupy 72.8px, so the caption block's top edge lands at `y = 965`.
The instructional floor is therefore:

```text
y = 940
```

### Frame regions

```text
y 120 to 700    hero        the chart, diagrams, the thing being taught
y 700 to 940    working     equations, rule strip, ledger
y 940 to 1038   caption     subtitles, do not enter
```

### Hard rule

No primary instructional element extends below `y = 940`. That covers
equations, state boxes, meaningful labels, important markers, instructional
ink, rule strips, and any value needed to follow the current beat.

Decorative background may run the full height where it cannot hurt caption
legibility.

"Put the equation under the chart" means put it in the working region. A
caption collision is a geometry error, not a finishing note.

## 9. Canonical ink vocabulary

This list is the source of truth for Problem Solving ink. `storyboard.md` and
the scene implementations point here rather than keeping their own budgets.

### The rule the list comes from

Inside the lesson, the hand only ever comments. It never carries.

A whiteboard is where handwriting carries the content: the words, the working,
the numbers, all in one hand at one weight, accumulating until the frame is
full. Marginalia is where the hand comments on content something else carries.
Nobody looks at a circled word in a book and thinks whiteboard.

So typeset carries every value, every equation and every sentence. Ink circles,
strikes and points at them. The only handwriting that carries its own content is
the title scrawl, and that sits outside the teaching.

### The four roles

Circle means selected, current, or important. Circle `$1` when it becomes the
buying candidate that matters.

Strike-out means invalid or eliminated. Use it for impossible transactions,
eliminated candidates and rejected reasoning.

Pointer arrow means a relationship or a direction. `BUY -> SELL`, or an
annotation tying a note to its target.

Title scrawl carries track identity, in the creator's own hand, at the outro and
possibly at the open. Nowhere else.

### What is typeset instead

An equation is mono, assembled term by term. `$3` lands, then the minus, then
`$7`, then the result, each term arriving on its own beat with `store` and the
stagger from section 2. That gives the same sense of reasoning being built, and
the terms are then the same material as the code in Scene06.

A stored value is mono. Act 5's ledger holds mono numbers that `store` into
place, so Scene06 morphs mono values into mono variable names with no change of
material.

Handwritten prose never appears. One cursive sentence measures 77 strokes,
which is more than the whole episode's ink budget, and thin graphite hairlines
are close to the worst case for video compression.

## 10. Ink technical contract

Meaning belongs here. Serialisation and replay belong in `docs/ink-format.md`,
which must define coordinate representation, normalised against absolute
coordinates, point ordering, timing, optional pressure, pressure-to-width
mapping, line cap, line join, replay progress, frame binding, deterministic
rendering, scaling behaviour, and how a stroke anchors to the narration
timeline.

Illustrative only:

```ts
type InkStroke = {
  points: Array<{
    x: number;
    y: number;
    pressure?: number;
    t?: number;
  }>;
};
```

This is not the schema until `docs/ink-format.md` says it is.

## 11. Prediction holds

A prediction hold is an authored teaching event, not a gap between narration
segments.

During one, every piece of evidence needed to answer stays visible, the answer
stays hidden, primary motion stops, the captions do not give it away, the music
bed stays pinned at the canonical duck level, and the length is tuned against
the recorded narration.

### Scene01 prediction shot

Before "How much did you make?" the viewer is already watching the trade run
from `$1` to `$6`. The frame freezes on it.

Visible: the day 2 buy point at `$1`, the day 5 sell point at `$6`, and the
trade path and token as they already stand.

Not visible: `$5`, a `Profit: ?` label, an information card, or any panel built
for the hold.

Nothing new enters. The viewer answers from the picture they were already
looking at, which is what makes the freeze land.

Planning length is about 2.0 seconds. The recording decides the real one.

## 12. Prediction holds and MusicBed

Caption absence is not silence. `MusicBed` builds its duck envelope from
caption timings, so a hold with no caption lets the bed recover over its 1.1
second release, and the quietest moment in the scene becomes the loudest.

Pass holds explicitly. During one the bed pins to the existing `duck` level and
does not release until the reveal starts. Two seconds of true silence after
music has been playing is a hard edge that draws attention to itself. Dropping
and staying reads as the room going still.

After the caption logic in `volume()`:

```ts
for (const hold of holds) {
  if (frame >= hold.startFrame && frame <= hold.endFrame) {
    level = Math.min(level, duck);
  }
}
```

The clamp runs last so a caption release cannot lift the bed inside the
thinking window. An episode that passes no holds behaves exactly as before, so
SD01 is untouched.

## 13. Scene architecture

Acts map onto the existing numbered pipeline:

```text
Act 1 -> Scene01
Act 2 -> Scene02
Act 3 -> Scene03
Act 4 -> Scene04
Act 5 -> Scene05
Act 6 -> Scene06
Act 7 -> Scene07
Act 8 -> Scene08
Act 9 -> Scene09
```

The numbering is infrastructure. `narration-durations.mjs`,
`transcribe-narration.mjs`, the narration stems and the caption data all key on
scene numbers. Recorded narration stays the timing authority.

## 14. Shared motion implementation

The semantic presets sit on top of the shared motion layer and use its
helpers, chiefly `travel()` and `arrive()` and the approved easing.

`store` is named to stay clear of the existing `settle()` export, which does an
unrelated job: it reports how far a full-frame editorial slide has pushed into
place, for `EditorialShot`. No semantic motion uses it.

```text
semantic layer      what does this movement mean?
shared motion layer how is the interpolation done?
```

The numbers in section 2 live in shared code, not in scenes.

## 15. Resolution

PS01 uses the current canonical channel resolution and does not change it on
its own. A move to 4K is a channel-level production-standard decision, and the
proposal has to answer four things: the new canonical resolution, how the
shared fixed-pixel primitives scale, what happens to SD01, and whether existing
episodes are grandfathered or re-rendered.

## 16. Monospace role

The Problem Solving monospace face is JetBrains Mono, loaded through the
existing Remotion font system. It carries `[7, 1, 5, 3, 6, 4]`, `$6 - $1 = $5`,
`minPrice`, `maxProfit`, and source code.

The face and its weights belong in the theme contract, not in a PS01 scene. The
channel typography scale is unchanged.

## 17. Scene01 contract

Scene01 is done when a beginner can explain what each array value represents,
what buying and selling mean, how profit is calculated, why buying has to come
before selling, why zero is a valid answer when no profitable trade exists, and
what the problem is actually asking for.

Scene01 does not introduce brute force, Big O, `minPrice`, `maxProfit`, loops,
or code.

### Progression

```text
array
-> chart
-> losing trade
-> winning trade
-> profit rule
-> tempting lowest and highest mistake
-> backwards trade fails
-> BUY -> SELL
-> whole problem
-> MAXIMUM PROFIT = ?
```

### Hero moment

The attempted trade buys at `$1` and sells at `$7`, travelling backwards
through time, and fails. The path takes the canonical strike, and the target
fades on the strike's follow-through timing. The frame simplifies to
`BUY -> SELL` under "Buy first. Sell after. Always." Then the original chart
returns.

That is the temporal callback every later scene borrows.

### Final hold

The chart is up, `BUY?` and `SELL?` are unresolved, the narration asks "Six
prices. What's the most profit you can make?" and the screen reads
`MAXIMUM PROFIT = ?`. Deliberate reinforcement under section 3.

## 18. Runtime budget

Preferred total is 10:30 to 12:00. The ceiling without script review is 12:00.

| Scene     | Target |
| --------- | -----: |
| `Scene01` |   1:30 |
| `Scene02` |   1:10 |
| `Scene03` |   1:20 |
| `Scene04` |   0:50 |
| `Scene05` |   2:20 |
| `Scene06` |   1:50 |
| `Scene07` |   0:50 |
| `Scene08` |   0:50 |
| `Scene09` |   1:00 |
| Total     |  11:45 |

These are planning bands, not target lengths for the narration to hit. Scene05
and Scene06 get more because they carry the most interaction and the most
explanation.

Scene09 moved from 0:40 to 1:00 once it was drafted. At 0:40 it could state the
transferable idea but not practise it, and a move the viewer has seen applied
exactly once is not a move they can reuse. The extra twenty seconds buys two
worked examples.

Review the whole budget after the first complete narration pass. If it has to
come down, cut repetition before cutting prediction time or conceptual setup.

## 19. Full-episode planting review

Scene01 can be produced first. Its narration does not lock until Scenes 02
through 09 exist at script level, because a later scene may turn out to need
Scene01 to plant terminology, a visual callback, a rule, an edge case, or a
contrast.

```text
understand the full problem
-> draft the full episode
-> review planting and callbacks
-> lock Scene01 narration
-> record and build Scene01
```

Building sequentially is fine. Writing blind is not.

## 20. Affiliate slot

PS01 carries no affiliate slot, so the scene map is Scene01 through Scene09
with no seam.

Adding one later needs a scene-map and narration-seam review before narration
locks. It cannot be dropped in after timing and transcription are final without
redoing both.

## 21. Episode prerequisites

`Scene01.tsx` starts after these gates pass.

Learning gate.

1. Complete the learning notes.
2. Add the sources.
3. Tick every item in `understanding-check.md`.
4. Pass the repository's understanding and status validation.

Writing gate.

5. Create `script.md`.
6. Draft narration for Scenes 01 through 09.
7. Run the full-episode planting and callback review.
8. Approve the Scene01 recording script.
9. Synchronise `storyboard.md` with the approved narration.
10. Point `storyboard.md`'s ink budget at section 9 instead of keeping its own.

Track and repository gate.

11. Register the Problem Solving track in the root composition system.
12. Add the track `compositions.tsx` on the existing pattern.
13. Add JetBrains Mono to the theme contract.
14. Teach `validate-curriculum.mjs` about the Problem Solving path.
15. Check that `SceneNN` naming is visible to the narration and transcription
    tooling.

Shared tooling gate.

16. Add the section 2 constants to the shared motion configuration.
17. Add semantic wrappers without replacing the existing helpers.
18. Write and approve `docs/ink-format.md`.
19. Implement authored hold support in `MusicBed`.
20. Check the `y = 940` floor against a real caption render.

Production gate.

21. Record the approved Scene01 narration.
22. Generate the caption data through the existing pipeline.
23. Generate the canonical Scene01 duration.
24. Retime the storyboard against the recording.
25. Implement `Scene01.tsx`.
26. Render review stills and the full scene.
27. Run the section 23 checks.

## 22. Thumbnail and packaging

The thumbnail communicates one idea. Source code is not the primary visual. It
follows the Problem Solving identity, and it gets read at feed size, not only
at full size. A frame lifted out of the episode is not a finished thumbnail.

Choose the direction after Scenes 01 through 03 are designed, once the
episode's strongest image is known. It does not block Scene01.

## 23. Scene review checks

Understanding. Does every abstraction have a concrete predecessor?

Canonical representation. Is the episode's house representation used
consistently, and does any switch to a secondary one have a teaching reason?

Focus. Where should the viewer's eyes be, and can a still frame answer it?

Motion semantics. Does every meaningful movement map to `draw`, `slide`,
`circle`, `strike`, `lift`, `store`, `morph` or `fade-back`?

Motion numbers. Does the implementation read the shared constants from
section 2?

Opacity. Does every settled element rest at `active`, `resting` or `faded`?

Narration and visuals. Complementary while explaining, and where they match, is
the repetition serving a prompt, a rule lock, a title or a hold?

Captions. Does all primary instructional material stay above `y = 940`?

Prediction. Does the viewer get the intended thinking time, and does the visual
hold still enough to reason from?

Music. Does the bed stay at `duck` for the whole hold, releasing only when the
reveal starts?

Temporal grammar. Does chronological motion run left to right?

Ink. Does every stroke use one of the four roles in section 9, and does the
hand comment rather than carry?

Architecture. Does the scene use the `SceneNN` pipeline and the shared tooling?

Hero moment. Which single visual event carries this scene's central idea? If
that is unclear, go back to the storyboard.

## 24. Comprehension check on the finished video

Section 23 checks a scene. This checks the episode, and it is the last gate
before publish.

The understanding gate asks whether the creator knows the concept. The
production gate asks whether the render is clean. Neither asks whether the video
taught anybody anything, and that is the only question the audience will answer.

After the full render is watched end to end, show it to one person who does not
already know the problem. Then ask them, without prompting:

```text
1  What is the problem asking for?
2  Why can't you just take the highest price minus the lowest?
3  Here is [2, 4, 1]. What's the answer?
4  You're standing on day four. What do you actually need to remember?
```

Someone who followed the episode answers all four. Question 3 is the one that
matters most, because it is the only one they cannot answer by repeating a
sentence they heard.

Record what they could not do, not just whether they passed. Each question maps
to a scene, so a failure names the scene that failed:

```text
1  ->  Scene01
2  ->  Scene01, the backwards trade
3  ->  Scene05, the walk
4  ->  Scene03 and Scene04
```

A viewer who cannot answer 3 watched eleven minutes and cannot solve the
problem. That is a failed episode however good the animation looks, and the fix
is in the scene the question points at rather than in the edit.

One viewer is enough to find a real gap. It is not enough to prove there isn't
one.

## 25. Rule change: the Problem Solving canvas is dark

Filed under section 14 of the production standard, which requires four answers
before a production rule changes.

### Which rule changes

The canvas rule in section 5 of `docs/video-production-standard.md`, and the
scene-language paragraph in `docs/visual-language.md`, both of which make warm
paper the default for Problem Solving.

Problem Solving now defaults to the near-black canvas that `Canvas` already
provides. System Design is untouched and stays on paper. DSA inherits this
decision when it starts, so the channel has two canvases split by track rather
than a fresh argument per episode.

### What problem it solves

The track's material is code, arithmetic and state. Its viewers read that
material on dark screens all day, and the mono type carries more weight against
a dark ground than a light one.

The honest counter-argument is that `visual-language.md` asks new tracks to feel
like chapters from the same publication rather than separate brands, and two
canvases weaken that. What holds the two tracks together instead is everything
except the ground: Inter, the same restraint, the same motion language, the
same typographic hierarchy. The accent is the one thing that did not carry
over, because the brand changed at this episode. See the brand cutover section
of `visual-language.md`. Cobalt and the semantic colours still own every
teaching frame; orange owns the end card and nothing else. A viewer arriving from the
system design episode should recognise the hand, not the paper.

### How it gets tested

The first full render of PS01 gets watched at feed size and on a phone, since
thin light strokes on dark suffer more from compression than dark on light.
Caption legibility is checked against section 8's geometry, because white
subtitles on a dark ground compete harder than near-black on paper.

The retention experiment template records the first frame either way, so the
canvas is one of the fields already being logged.

### Scope

Track-wide, permanent, from PS01 forward. Not an interstitial, not a per-episode
choice.

### What it changed in practice

The dark ground is not flat black. `Canvas` lifts the centre toward `#151B27`,
which is what stops it reading as a board.

Ink is `#E9E4D8` rather than white. Warm and slightly off, so a stroke reads as
a light pencil on dark paper rather than chalk on slate. That distinction
matters because section 9 already rejects the whiteboard reading, and inverting
the canvas without inverting it carefully would have reintroduced it.

Stroke widths drop by about a tenth against the paper values, because light on
dark blooms and the same width reads heavier. Provisional until reviewed at feed
size.

`Grade` screens a faint centre lift on dark instead of multiplying a vignette,
which on a dark ground only makes mud.
