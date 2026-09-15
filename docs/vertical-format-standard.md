# Vertical format standard

The production rules for 9:16 cuts, meaning reels, shorts and anything else
uploaded portrait. It extends [the video production standard](video-production-standard.md)
and [the visual language](visual-language.md), and holds only what is different
because the frame is portrait and the viewer is scrolling.

Where this document is silent, the channel standards apply.

This file is the contract. [The playbook](vertical-cut-playbook.md) is the
order to do things in, and it is the one to read when starting a new cut.

## 1. What a vertical cut is

A cut is either original, written for the format, or lifted out of an episode.
Both obey this document. Neither is a crop of a horizontal master: a 16:9 frame
cropped to 9:16 loses two thirds of its width, and every composition in this
repository puts its hero object in that width.

Vertical cuts live in `src/vertical/`. It sits beside the tracks rather than
inside one, because the format is orthogonal to the subject. A cut about a
b-tree and a cut about a load balancer share a geometry, not a curriculum.

## 2. Format contract

| Field          | Value                             |
| -------------- | --------------------------------- |
| Resolution     | 1080 x 1920                       |
| Frame rate     | 30 fps                            |
| Length         | 13 to 15 seconds                  |
| Composition id | `VR<NN>-<Name>`                   |
| Cover          | a `Still` at the same 1080 x 1920 |

Length comes from the measured band, not from the material. Ninety days of this
channel's own numbers put every reel above 275,000 views at 14.1 seconds or
shorter, and every reel of 20 seconds or longer under 208,000 across nine
attempts, two of them posted at the peak of the page's distribution. Mean view
duration across 8.0 million views is 5.8 seconds, and 68 percent of viewers
leave before the third second. A fourteen second cut is 41 percent watched by
the average viewer. A thirty second cut is 19 percent watched by the same person
behaving identically, and the platform reads the difference as the worse video.

This replaces the previous rule of 20, 25 or 30 seconds. That rule came from
section 3.2 of `business/CHANNEL_CONTEXT.md` in the videos repository, which was
optimising earnings per thousand qualified views, where 24 to 30 seconds paid
two to three times the rate of 13 seconds. It also claimed there was no observed
reach penalty for length. The reach data since contradicts that claim, and the
objective was wrong anyway: a page earning about eighteen dollars from a 1.1
million view reel gains nothing from a better rate on a tenth of the reach.

Fifteen seconds is a ceiling, not a target. A cut that cannot make its point in
fourteen has more than one point in it. Round the last shot's trailing hold to a
whole second so the length is a decision and not a remainder.

Going longer needs evidence rather than a reason. A cut may run past fifteen
seconds only once a cut at this length has cleared 275,000 views and the longer
version is being posted as a deliberate comparison against it.

Ids stay stable once a cut is published, the same rule the episode compositions
follow.

## 3. Safe areas

The numbers live in `src/shared/vertical/geometry.ts` and are the union of the
worst case across Facebook Reels, Instagram Reels, YouTube Shorts and TikTok,
measured off screenshots at 1080 wide in September 2026.

| Reserve              | Pixels                  | What covers it                                           |
| -------------------- | ----------------------- | -------------------------------------------------------- |
| Header               | top 190                 | Follow button, sound name, back arrow, Shorts search bar |
| Caption and controls | bottom 420              | Caption, handle, audio ticker, progress bar              |
| Sides                | 96 each                 | Nothing. Optical margin.                                 |
| Action rail          | right 150, below y 1000 | Like, comment, share, profile                            |

Composing to the union rather than per platform means one master uploads
everywhere. Cutting a version per platform is how a channel ends up with four
files that have quietly drifted apart.

### The rule

No element a viewer has to read may sit outside `y 190` to `y 1500`, and
nothing below `y 1000` may cross `x 930`. Background may run the full frame.

Blocks below `y 1000` narrow symmetrically rather than shifting left. A column
shoved left to dodge the buttons reads as a layout mistake, and the eye finds an
off-centre column faster than it finds the buttons.

`Vertical-Safe-Area` renders the whole set as a still. Put it over a frame grab
before calling a layout finished.

## 4. The canvas is dark

Vertical cuts run on the near-black ground, whatever track the material comes
from, including System Design.

This is the second application of the argument in section 25 of
[the problem solving visual language](problem-solving-visual-language.md): the
material is code and numbers, and a reel is read on a phone, one-handed, usually
at night. It is not a fresh decision and does not reopen the canvas question for
horizontal work. System Design horizontal masters stay on paper.

## 5. The mark is in every frame

### Which rule changes

Item 8 of section 5 of the production standard: _do not keep the channel logo
visible throughout the lesson. It appears once, locked up with the wordmark in
the outro._

For vertical cuts, the mark is in every frame.

### What problem it solves

That rule is written for a ten-minute horizontal episode, where the viewer
arrived through a thumbnail that already carried the channel name and stays long
enough to reach the end card. A reel has neither. It arrives mid-scroll with no
title attached, most of the people who see it never reach the last second, and
reposts of this channel's work already circulate with no name on them.

The rule's real intent is that nothing on screen may be decorative. A mark that
is the only thing identifying the work is not decorative.

### How it is applied

Through the body of the cut the mark runs as `Watermark`: the lockup at size 30,
top left, at 88 percent, in the brand colours.

It ran in chalk first, on the argument that orange is the teaching accent in this
format and a permanent mark carrying it would be the one orange thing on screen
that means nothing. That was too careful. The mark is 30 pixels tall, in the
header band, above the content area, in the same corner of every frame, while
the accent inside the frame is a full width bar or a number at 172. Nothing is
competing. What the chalk version achieved was a logo that reads as a failed
render.

Do not take it below about 70 percent. The burnt tone goes muddy against the
near black ground before it goes quiet.

The end card shows the full stacked lockup and the corner mark hands over as it
arrives, so two lockups are never on screen together.

### How it gets tested

Watched at feed size on a phone. The mark is legible enough to read as a name
and quiet enough that it is not the second thing you look at.

### Scope

All vertical cuts, permanent. Horizontal episodes are untouched.

## 6. The accent is the brand orange

### Which rule changes

The accent section of [the visual language](visual-language.md): _orange never
appears inside a teaching frame_, and cobalt is the only accent allowed in one.

For vertical cuts, the orange is the teaching accent and cobalt is not used.

### What problem it solves

The horizontal rule exists so that colour inside a lesson always means
something. A viewer arriving at a ten minute episode has already seen the
channel name on the thumbnail, in the title and in the description, so the
brand does not need to be the colour of anything on screen, and letting it be
would put the loudest colour in the frame on the one element carrying no
information.

A reel has none of that. It arrives mid-scroll with no title attached, and the
scroll is fast enough that recognition happens before reading does. A cut whose
only colour is the channel's own is recognisable at that speed. Cobalt is also
the colour every other technical feed is already using, which is the opposite of
what an accent is for.

The rule's real intent survives intact: colour in a teaching frame still means
something, and everything that means nothing is still neutral. What changed is
which hue carries the signal, not whether the signal has to earn its place.

### How it is applied

`src/shared/vertical/palette.ts` exports the accent and every shot reads it, so
a cut cannot quietly drift to a second orange.

It is the bright tone, `#FF7A33`, not the burnt `#E4571B`, because the vertical
canvas is near black and the burnt tone goes muddy on it. That is the same value
the lockup uses on a dark ground, so the accent inside the frame and the accent
on the mark are one colour rather than two oranges a viewer has to reconcile.

The persistent corner mark is the exception that proves the rule holds. It wears
the accent and means nothing by it, and that is fine, because it lives in the
header band rather than in a teaching frame. Section 5 has the argument. Inside
the content area, from `y 380` down, the accent still means one thing.

### When a cut compares things

One accent is the right rule for a cut teaching one mechanism. It is the wrong
rule for a cut comparing several, and applying it there cost real reach.

A comparison only works if its lanes can be told apart at a glance, and colour
is the fastest way anybody does that. The REST against GraphQL against gRPC cut
gave each of the three its own hue and did 717,000 views, and its opening frame
is still readable shrunk to a thumbnail. The comparison cuts that followed drew
their lanes in one accent over grey, and at the same size they are grey mush.

So a cut comparing N things may give each lane its own hue, taken from the
semantic colours already in `src/shared/brand/theme.ts`: `blueBright`, `sell`,
`gain`, `loss`. No new hues, and at most four lanes, because a fifth is a table
rather than a comparison.

The constraint that survives is the one that mattered. A lane hue identifies
that lane and nothing else, it stays on that lane for the whole cut, and
anything neutral stays neutral. The orange still marks the thing being looked
for, so it is not spent on a lane unless the cut has exactly one lane that
matters.

### How it gets tested

Watched at feed size beside the rest of the feed. The question is whether the
cut is identifiable as this channel's before any word on it is read.

Contrast is checked against the near-black ground. `#FF7A33` on the canvas is
about 6.2 to 1, which clears the text threshold with the same margin cobalt had.

### Scope

All vertical cuts, permanent. Horizontal episodes are untouched and keep cobalt.
The two formats now differ in canvas, in mark handling and in accent, which is
three differences held together by the same typography, the same restraint and
the same motion language.

## 7. Narration

A vertical cut has no voiceover and does carry narration. The commentary is
burned into the frame as a subtitle track.

### Why it is written, not spoken

Most people watch a reel muted. A cut that only makes sense with sound is a cut
most of its audience never understands, and the platform's own auto-captions
cannot help because there is no speech to transcribe. So write the sentence a
narrator would say and put it on the screen.

It also survives the audio being replaced. Section 11 ships these cuts with no
music so somebody can lay a track over them at upload; if the explanation lived
in the audio, that would destroy it.

### Where it goes

`src/shared/vertical/Narration.tsx`. One line at a time, at most two visual
lines, on a baseline at `y 1460`.

Bottom anchored rather than top anchored. A payoff line runs half again the size
of an ordinary one, and anchoring the top would shift the whole block down the
frame every time the size changed.

Nothing else may use the band from `y 1300` down. Receipts move up under the
number they belong to.

### Two sizes

Ordinary lines are Inter 600 at 36. Payoff lines, one per shot, are Inter 800 at
54 and may carry the accent on the half that matters.

The payoff lines used to be separate cards in the middle of the frame. Folding
them into the same track gives the cut one voice instead of a caption and a card
competing for the same corner.

### Pace

About two words a second, and no more than three. Subtitles stay readable to
roughly three words a second when they are the only thing on screen, and in a
cut like this the picture is asking for attention too.

Fourteen seconds takes about 28 words. Count them before a shot is built. The
constraint on a cut's length is words, not frames, so the word count is what
sets the length rather than the other way round.

### Breaks

Break long lines by hand. Left to wrap, a line whose second row is one word
reads as a mistake for the beat it takes to understand, and that beat is a fifth
of the time the line is up.

### Writing

The same rules as everything else with words in it, in `AGENTS.md`. Plain words,
active voice, one idea per line, the concrete number over the adjective.

Say what is happening while it happens. "No index on user_id" and "So Postgres
reads every row in the table" tell the viewer what they are looking at. A line
that could sit unchanged over a different diagram is a line saying nothing.

## 8. Type scale

`src/shared/vertical/type.tsx`. A 1080 wide frame is about 380 points on a
phone, so everything is larger relative to the frame than its horizontal
equivalent.

| Role       |     Size | Face                    |
| ---------- | -------: | ----------------------- |
| Eyebrow    |       21 | Mono, uppercase, 0.26em |
| Label      |       23 | Mono, uppercase, 0.18em |
| Headline   | 84 to 96 | Inter 800, -0.05em      |
| Punch      | 54 to 62 | Inter 800, -0.045em     |
| Readout    | 30 to 84 | Mono, tabular figures   |
| Provenance |       19 | Mono, gray              |

Two hierarchies per frame, as the horizontal standard asks. A headline and a
readout, or a readout and a label. Never three.

The headline is not optional. Section 10 requires one in frame zero, and it is
the only role in this table that survives being shrunk to the size a scrolling
thumb resolves.

Break headlines by hand. At these sizes a second sentence is two lines whatever
happens, and choosing where it breaks is the difference between a headline and a
paragraph.

## 9. Numbers

Every number on screen is measured, on a machine, and the run is committed with
the cut. The production standard requires illustrative numbers to be labelled;
this format does not have any, and says where the measurement came from instead.

Numbers live in one module per cut and nothing hardcodes a figure in a shot, so
correcting a measurement corrects the frame.

The last line of a cut carries the conditions: the version, the size of the
data, the state of the cache. It is the first thing a comment thread asks for.

## 10. Shape

The four shots below are the default, not a requirement. A cut with a better
shape for its material should use it and say why in its own notes.

```text
mechanism  the slow way, watched taking too long
mechanism  the fast way, watched being fast
verdict    the two side by side, and the one number
end card   the cost, then the mark
```

### No hook card

There is no shot in front of that, and there should not be. A card stating the
claim is what the cover already says, so anybody who arrived through the cover
reads it twice, and it is two or three seconds of a frame with nothing moving in
it at the exact moment a scroll is decided.

Open on the first mechanism, already running. Frame zero should have something
in motion and something changing, and the claim the hook would have made is
stronger as the payoff at the end of that shot than as a promise in front of it.

The framing a hook was carrying still has to survive somewhere. Fold it into the
opening shot: the label says what is being watched, the query or input stays on
screen while it runs, and the counter says how far along it is.

### The headline is not a hook card

Banning the hook card does not ban the headline, and reading it that way is the
single most expensive mistake in this format so far.

Every cut this channel has published above 275,000 views opens with its topic
set in the largest type in the frame, over content that is already running.
"10 GIT COMMANDS" sits over a live terminal. "REST vs GraphQL vs gRPC" sits over
three lanes already drawn. The headline and the mechanism share frame zero.

VR01 through VR06 read this section as a ban on the headline and opened on the
mechanism alone. Shrink those openings to the size a scrolling thumb actually
resolves and they say nothing: VR03 is a toll booth, VR04 is two fields of grey.
Do the same to the four cuts that opened with a headline and all four are still
readable.

So frame zero carries both. A headline at the top naming what is being watched,
at the Headline size in section 8 and never below it, with the mechanism running
underneath from the first frame. What is banned is a still card that holds the
whole frame and delays the content. A headline over running content delays
nothing.

### Ending

Ending on the cost rather than the win is deliberate. A cut that stops at the
speedup teaches people to reach for the thing, which is usually the wrong lesson
and the one they will be undoing later.

### Anchors

Hold the vertical anchors across every shot. Label at 300, the thing being
taught from about 400 to 930, the number it produces at 965, the receipt under
it at 1150, and the narration on its baseline at 1460. Holding those is what
stops half a minute reading as four unrelated cards.

The line each shot has been building to is not a card in the middle of the
frame. It is that shot's payoff line in the narration track, at section 7.

## 11. Sound

No narration, and no music bed. The sound effects are the entire track.

### Why no bed

A reel's reach usually comes from the audio somebody lays on it at upload, out
of the platform's own library, and a bed underneath that fights it and loses.
Shipping clear means the cut works silent, works with its own effects, and works
under borrowed audio, without a second export for each case.

It also means the silence between cues is part of the design rather than a gap.
Each cue has to earn the space around it, and the space has to be the right
length.

### What gets a cue

One thing arriving, one thing leaving, or one thing being decided. Nothing plays
because a property moved. A counter climbing through ten million rows gets no
sound of its own if a sustained cue is already saying that for as long as it is
true.

Roughly one cue every one and a half seconds is the working density. That is denser than an episode, because an episode has a
voice and a bed holding the space and a reel has neither. It is still one cue per
event, not a rhythm track.

### Levels

The set in `public/sfx` was levelled to sit under narration. With neither
narration nor music there is nothing to sit under, so per-use gains in a vertical
cut run well above one. That is expected. Do not regenerate the files to fix it,
because the same files still have to sit under a voice in the episodes.

Aim for the heaviest cues peaking around -5 dBFS and the quiet ones between -14
and -19. A sustained texture sits lower again.

Integrated loudness is not a useful target for a track that is mostly silence.
The meter's gate throws the silence away and reports something misleadingly
close to the level of the cues themselves. Check peaks, and check it on a phone.

### Effects

Generated by `scripts/build-sfx.sh` rather than licensed, so the repository owns
them and there is no third-party term to track. A cut that needs a sound the set
does not have adds it to the script.

## 12. Covers

A cover is uploaded at 9:16 and then cropped by everything that shows it: 1:1
for the TikTok profile grid, 3:4 for the Instagram one, 9:16 only in the feed.

The square is the tightest, so every element sits between `SQUARE_TOP` (420) and
`SQUARE_BOTTOM` (1500), and the strips above and below carry nothing but ground.
A cover laid out against the full 1920 loses its headline the moment somebody
opens the profile it is on.

It states the result rather than teasing it. On a feed the promise that works is
the number, not a question about the number.

The cover is a brand asset, so the accent is allowed on it.

## 13. Checks before a cut is finished

1. The opening frame shrunk to a quarter and looked at again. The topic has to
   be readable there, because that is roughly what a scrolling thumb resolves
   before it decides. This check is first because it predicts more than the
   rest of the list put together.

   ```bash
   ffmpeg -i out/vertical/<slug>.mp4 -vf "select=eq(n\,15),scale=iw/4:ih/4,scale=iw*4:ih*4:flags=neighbor" -frames:v 1 glance.png
   ```

2. `Vertical-Safe-Area` over a frame from every shot.
3. The cover checked at 1:1 and at 3:4, not only at 9:16.
4. Every number traced to the committed measurement run.
5. The mark legible, and not the second thing you look at.
6. Colour means something in every teaching frame: one accent, or one hue per
   lane and nothing spare.
7. Every narration line read at its own length, out loud, on the frame it sits
   over. No line orphaning a word onto a second row.
8. Watched end to end at feed size on a phone, muted. If it does not make sense
   muted, the narration is not carrying its share.
9. Watched again with sound.
10. Typecheck, lint, formatting, curriculum validation, composition discovery.
