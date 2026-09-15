# Vertical cut playbook

How to build one, start to finish. [The vertical format
standard](vertical-format-standard.md) says what the rules are and why. This
says what order to do things in, and it carries the mistakes already made so
they do not get made again.

VR01, the database index cut, is the worked example. Read
`src/vertical/01-database-index/` alongside this.

## Using this file

Given a topic, work through the nine steps below in order. Do not start writing
shot code before step 2 has produced real numbers, and do not write publishing
copy before the render exists.

Apply `/unslop` to everything with words in it. The narration, the caption, the
title, the curriculum files, all of it.

Two of these steps are the creator's and cannot be done for them. Step 1 needs
their judgement on what the channel has already covered, and step 9 needs them
to pass the understanding check. Everything between is buildable alone.

## 1. Pick the topic

Two shapes carry a technical feed. A large search space collapsing, and a
reference somebody wants to keep. A cut that is neither will be watched by the
people who already follow and nobody else.

The topic must also be something with a mechanism. "Ten Docker commands" is a
reference and works. "Why microservices are hard" is an opinion and does not,
because there is no measurement at the end of it.

Check it has not been covered. Ask the creator for the back catalogue if there
is no list to hand.

Length is 13 to 15 seconds and it is not a choice the material makes. Section 2
of the standard has the ninety days of view data behind that. If the material
needs longer, it is two cuts.

## 2. Measure it

Every number on screen comes off a real machine. This is the step that takes the
longest and it is the one that makes the cut worth publishing, because the
figures are the whole claim.

Write a script that reproduces the run and commit it as
`scripts/measure-<topic>.sh`. It should build its own fixture, take the
measurement several times, print the raw tool output, and clean up after itself.
`scripts/measure-database-index.sh` is the pattern.

Run it twice, at least an hour apart. Anything that moves between the two runs
does not go on screen as an absolute figure. VR01's insert timings moved by half
and its page counts did not move at all, so the cut shows a ratio for the write
cost and exact counts for everything else.

Put the raw output in `curriculum/vertical/<episode>/measurements.md` with the
machine it ran on. Put the figures the shots use in
`src/vertical/<episode>/measurements.ts`, one module, exported as constants. No
shot hardcodes a number, so correcting a measurement corrects the frame.

Prefer counts over times. A row count or a page count is a property of the
mechanism. A millisecond is a property of the laptop.

## 3. Write the narration

Five or six lines, about two words a second, roughly 28 words for 14 seconds.
Section 7 of the standard has the rules. Write it before the shots, because the
word count is what sets the length.

Twenty-eight words is the hard part of this format. The first draft always runs
double. The fat is always in the sentence re-explaining what the frame is
already showing.

Say what is happening while it happens. Each shot ends on a payoff line, set
large, and that line is the point of the shot.

Read it aloud at the pace a stranger scrolling past would read it. If you run
out of breath, it is too long for the frame it sits on.

## 4. Map the shots

Three shots at this length. The slow mechanism, the fast one, the verdict with
the number on it. The end card folds into the last shot rather than taking a
fourth. No hook card in front of any of it, for the reasons in section 10 of the
standard.

Frame zero carries the headline and the mechanism together. The headline names
the topic in the largest type in the frame and the mechanism is already running
underneath it. Dropping the headline is what made VR01 through VR06 unreadable
at feed size, and section 10 has the comparison.

Something has to travel across the frame. This is the rule that took VR03 four
scenes to learn. A bar filling, a grid of squares, a tank draining and two piles
growing either side of a barrier were all accurate and all static, and none of
them gave anybody a reason to stop scrolling. The channel's best cuts move
something through space: a route racing across a real map, plates being
delivered, a crane lifting a weight. Find the version of the idea where the
subject crosses the frame and meets the mechanism.

Build objects, not readouts. This channel's back catalogue is physical: weight
plates, plates of food, glasses filling, routes across a real map. A fill bar, a
grid of squares and a labelled rectangle can carry exactly the same information
and still give somebody no reason to stop scrolling. `WeightPlate.tsx` in
`02-tower-of-hanoi` is the reference for how: layered ellipses for round forms, a
gradient across each face, a cast shadow under anything with weight, one
specular sweep.

Two things that mean different things get drawn as different objects. VR03
first drew requests and tokens as the same disc, lifted whole from the tower of
hanoi weight plate, and the token bucket shot then could not show a request
spending a permit, which is the only thing that shot is about. Reusing a
material treatment is good. Reusing the form without asking whether it is the
right form is how a representational error gets in, and it also makes two
consecutive reels look like the same video.

Put the numbers on the objects they describe. A strip of counts under a diagram
turns the bottom of the frame into a dashboard reporting on the picture above
it.

Give each shot a hero: one visual event that carries its idea, and a different
one per shot. VR01's are the sweep crossing the whole table and the candidate
count collapsing. VR03's are a counter going backwards, a log that fills and
never empties, and a tank running dry.

Two shots may share a layout only when the comparison is the point and the
behaviour visibly differs, the way VR03's fixed and sliding window shots share a
clock so the rollover can happen to one and not the other. Three shots sharing
one never works.

Write `beats.ts` with the frame ranges and `narration.tsx` with the line
timings, then check they agree. Both use absolute frames and nothing enforces
that they match.

Then `storyboard.md` in the curriculum folder, with the shot map, the reasoning
per shot, the cue map and the colour note.

## 5. Build it

Files, in the order they are easiest to write.

```text
curriculum/vertical/<episode>/
  README.md              what it claims, why this topic, what is out of scope
  learning-notes.md      what had to be understood before drawing anything
  sources.md             the documentation the mechanism was checked against
  understanding-check.md the creator gate, left unticked
  measurements.md        the full run and the machine
  script.md              the narration and the on-screen copy, Status: blocked
  storyboard.md          the shot plan

src/vertical/<episode>/
  measurements.ts        the figures, one place
  beats.ts               the shot map in frames
  narration.tsx          the subtitle track
  shots.tsx              one component per shot
  Reel.tsx               the shots, the narration layer, the sound cues
  Cover.tsx              the 9:16 still
  <diagram>.tsx          whatever the mechanism needs drawing
```

Register the compositions in `src/vertical/compositions.tsx`. Ids are
`VR<NN>-<Name>` and they stay stable after publication.

Shared pieces already exist and should not be rebuilt per cut.
`VerticalShell` carries the canvas, the mark and the grade. `Narration` is the
subtitle track. `type.tsx` is the scale. `geometry.ts` is the safe areas.
`palette.ts` holds the accent, and a comparison cut takes its lane hues from
`theme.colors` under the rule in section 6 of the standard.

## 6. Sound

No music. Effects only, cut to the animation, roughly one cue every one and a
half seconds. Section 11 of the standard has the levels.

Gains run between 5 and 13 because the effect set is levelled to sit under
narration and there is none here. Set them against the finished render, not by
reasoning from the source file levels, and aim for the heaviest cues peaking
near -5 dBFS.

If a cut needs a sound the set does not have, add it to `scripts/build-sfx.sh`
and generate it. Do not download one, and do not substitute a sound that means
something else because it is already there. `reject` was added for VR03 because
the audio contract had always listed a reject sound for a blocked path and the
set never had one.

## 7. Render and review

```bash
npm run check
npx remotion render src/index.ts VR<NN>-<Name> out/vertical/<slug>.mp4
```

Watch it end to end. A contact sheet catches pacing problems a scrub does not:

```bash
ffmpeg -i out/vertical/<slug>.mp4 -vf "fps=1,scale=250:-1,tile=6x5" -frames:v 1 sheet.png
```

Then the safe areas. Render `Vertical-Safe-Area`, lay it over one frame from
every shot at about 35 percent, and check nothing a viewer has to read crosses
a reserve.

Then the cover, cropped to 1:1 and to 3:4, because those are the profile grids
that will cut it.

```bash
scripts/crop-cover.sh out/vertical/<slug>-cover.png
```

It derives both crops from the input rather than hardcoding the offsets, so a
change to the canvas cannot leave it behind. Look at them. The square is the
tighter of the two and it is the one that catches a cover laid out against the
full 1920 instead of against `SQUARE_TOP` and `SQUARE_BOTTOM`.

Then check for frozen stretches, which are the thing a viewer reads as the video
stalling and the thing a scrub through the timeline hides:

```bash
ffmpeg -i out/vertical/<slug>.mp4 \
  -vf "tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=diff.txt" \
  -f null -
```

Any run where `YAVG` stays under about 0.06 is a frame that only the film grain
is changing. Nothing should hold longer than about a second and a half, and the
one that does should be the end card. VR03 had two and a half seconds of a
frozen frame starting five seconds in, because its first shot was given 236
frames and finished animating at 158.

A shot's length is its animation plus the time somebody needs to read the payoff.
It is not a slot to fill.

Then muted, at feed size, on a phone. If it does not make sense muted, the
narration is not carrying its share.

## 8. Write the copy

Apply `/unslop` to every line of it. The two rules that get broken most often
are no em dashes and no marketing register.

Open the cut's `measurements.ts` and its `narration.tsx` first. The caption is
built out of numbers that were measured, and the narration is already the
shortest true version of the argument. Never invent a figure to make a line
land.

If the reel is not rendered, stop. Copy written against a storyboard describes a
video that does not exist.

### Facebook caption

Three parts, in this order.

The finding, with its number. This is the only line most people read, because
Facebook cuts the caption at about 100 characters and hides the rest behind
"more". Put the surprise in front of that cut.

The mechanism, in one or two sentences. What actually happens, not what it feels
like.

The catch. Every good technical finding has a cost, and naming it is what
separates this from an engagement post. A cut with no catch is an incomplete
cut, not an incomplete caption.

Then the repository, on its own line. Every cut is built in the open and the
measurement run that produced the numbers is in there, so the line is evidence
rather than promotion. It also means anybody who wants to argue with a figure
can go and check it.

```text
Code and measurements: github.com/Sun-Deep/coding-chops
```

Then a blank line and the hashtags. Keep the whole thing under about 450
characters, because a reel caption is competing with a video that is already
playing.

No call to action. No "follow for more", no "which one do you use", no question
the poster does not want answered. The work is the pitch.

### Hashtags

Five, lowercase, in this order.

1. The exact technology. `#postgres`, `#docker`, `#kubernetes`
2. The subject area. `#database`, `#networking`, `#algorithms`
3. The language or query surface, if there is one. `#sql`, `#javascript`,
   `#python`. If there is none, use a second subject tag.
4. The role who searches for it. `#backend`, `#devops`, `#frontend`
5. One broad tag. `#softwareengineering`, `#coding`, `#programming`

Never `#viral`, `#fyp`, `#reels`, `#trending`, or the channel's own name.

### YouTube Shorts title

One line, under 60 characters. A phone truncates a Short's title around 40, so
the hook has to be inside the first 40.

State the surprising fact. No question, no colon as a connector, no
"| Coding Chops" and no series name. A Short has no room for furniture.

```text
good   Without an index, Postgres reads all 10,000,000 rows
good   One packet is lost. TCP waits, UDP does not.
bad    Database Indexes Explained: What You Need To Know
bad    Ever wondered how a database index works?
```

Leave `#Shorts` out of the title. YouTube detects a Short from the aspect ratio
and the length, and has done for years.

### Instagram and TikTok

Same caption, same hashtags. Both allow more than five tags and neither rewards
them, so do not expand the list per platform. One caption, four places, no
drift.

### Where it goes

`curriculum/vertical/<episode>/publishing.md`, along with the runtime, the
resolution and the cover file, so everything the upload form asks for is in one
place. Print the caption and the title in the reply too, so they can be copied
without opening the file.

### Check before handing it over

- Do the first 100 characters carry the surprise on their own?
- Is every number in the caption in `measurements.ts`?
- Is the catch named?
- Five hashtags, none of them the channel name?
- Title under 60 characters with the hook inside the first 40?
- No em dashes, no call to action, no question mark?
- Is the repository line there?

## 9. Ship it

The understanding check is the creator's and is the last gate. `script.md` stays
`Status: blocked` until every box is ticked, and `npm run check` fails if the two
disagree.

## Mistakes already made

Each of these cost a render cycle on VR01.

A shot's opening ramps start at frame 0, so the first frame of every shot is
empty. That reads as dead air at four different points in a thirty second cut.
Start the ramps negative and let the shot open with something already on screen.

Easing a counter that is already being fed an eased value eases it twice. The
number lands on its target while the thing it counts is still a row and a half
short, which is the one detail that tells a viewer the figures are decoration.

`prettier` rewrites what you are about to match against. It realigns markdown
tables and it collapses a multi-line destructure onto one line, so an exact
match written against the pre-format text fails silently and the script reports
success. This cost two full render cycles on VR03, where an audio gain looked
changed and was not. Assert that the replacement happened, or match with a
regex, and read the value back out of the file before rendering.

A render can pick up a file you did not mean to change, and the only way to know
is to measure the output rather than trust the code. A twenty decibel audio
error survived a full render and a level check because the level check was run
on the wrong assumption.

Absolute figures that move between two runs of the same measurement script are
not measurements. Show the ratio.

A logo at 40 percent in a neutral colour reads as a failed render, not as a
quiet watermark.

Three lanes of a comparison must not share a hero. The rate limiting cut first
shipped with the same band, counter and label in all three algorithm shots, and
the differences between them were real while the pictures were nearly identical.
It read as one frame shown three times. Give each lane its own event: a counter
going backwards, a log that fills and stays full, a tank running dry.

A shot that opens on a zero has a dead frame at every cut. Start counters on the
second frame of their shot, not the eighth. A third of a second times four cuts
is most of a second of nothing in a twenty-five second cut.

Narration and the shot map are on separate clocks and nothing checks them
against each other. Every line has to open at least four frames after its shot
starts and close at least six before it ends, or a payoff fades over the top of
the next shot's opening.

Draw the event, not its result. The first rate limiting cut showed a band
filling all the way across and never showed the counter resetting, which is the
bug the whole cut is about. If a cut has one moment, that moment is a shot.

A full-frame flare reads as a render fault at any opacity worth seeing. Name the
event in a word instead.

No title card. A card stating the topic buys two seconds of a still frame at the
exact moment somebody decides whether to keep scrolling. Open on the
demonstration with the rule already visible in the frame, as a label or as a
denominator.

A number moving on screen with nothing under it feels broken. Give a counter
its own cue, one per ten units rather than one per unit, with the gain rising
into whatever marks the top. That is a meter, and it is tied to the picture.

Never lay a sustained sound under a shot because the shot feels quiet. `scan`
went under four shots of the rate limiting cut, which put filtered noise across
most of the reel and had nothing to do with rate limiting. It marks a duration
and belongs only under a shot that is about how long something takes. If a shot
feels quiet, find the event in it. Silence during a climb is what makes the
sound at the top of it land.
