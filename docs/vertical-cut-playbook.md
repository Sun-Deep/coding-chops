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

Pick the length from the material, inside the 20 to 30 second band. One
comparison is 20 seconds. A mechanism and its cost is 30.

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

Nine or ten lines, about two words a second, roughly 55 words for 27 seconds.
Section 7 of the standard has the rules. Write it before the shots, because it
decides how long each shot has to be.

Say what is happening while it happens. Each shot ends on a payoff line, set
large, and that line is the point of the shot.

Read it aloud at the pace a stranger scrolling past would read it. If you run
out of breath, it is too long for the frame it sits on.

## 4. Map the shots

Four shots is the default. The slow mechanism, the fast one, the verdict, the
end card. No hook card in front of any of it, for the reasons in section 10 of
the standard.

Give each shot a hero: one visual event that carries its idea. VR01's are the
sweep crossing the whole table and the candidate count collapsing.

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
`palette.ts` holds the one accent.

## 6. Sound

No music. Effects only, cut to the animation, roughly one cue every one and a
half seconds. Section 11 of the standard has the levels.

Gains run between 5 and 13 because the effect set is levelled to sit under
narration and there is none here. Set them against the finished render, not by
reasoning from the source file levels, and aim for the heaviest cues peaking
near -5 dBFS.

If a cut needs a sound the set does not have, add it to `scripts/build-sfx.sh`
and generate it. Do not download one. The repository owns every effect in it and
that is worth more than a better whoosh.

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

Then a blank line and the hashtags. Keep the whole thing under about 400
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

`prettier` realigns markdown tables, so an exact-match edit written against the
unformatted version fails silently in a multi-part script. Check what actually
changed before rendering.

A render can pick up a file you did not mean to change, and the only way to know
is to measure the output rather than trust the code. A twenty decibel audio
error survived a full render and a level check because the level check was run
on the wrong assumption.

Absolute figures that move between two runs of the same measurement script are
not measurements. Show the ratio.

A logo at 40 percent in a neutral colour reads as a failed render, not as a
quiet watermark.
