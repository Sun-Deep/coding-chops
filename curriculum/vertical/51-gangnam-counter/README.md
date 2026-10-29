# Vertical 51: Gangnam Style vs a 32-bit counter

Status: published 27 Oct 2026 at 8:53 PM.

## What it claims

A 32-bit signed integer holds at most 2,147,483,647. Add one and every
bit flips: 0 then 31 ones becomes 1 then 31 zeros, and the top bit is the
sign, so the count reads -2,147,483,648. YouTube said in December 2014
that Gangnam Style had been watched more than 2,147,483,647 times and
that it had moved the view counter to a 64-bit integer. In 64 bits the
same carry lands on bit 31, which is just a number there, and the count
reads 2,147,483,648. The video passed 6 billion views on 17 July 2026; in
a 32-bit int, 6,000,000,000 reads 1,705,032,704.

Every number is printed by the reel's own Java lines, compiled and run by
`scripts/measure-gangnam-counter.mjs`.

## Why this topic

A famous video everyone knows, and an overflow every programmer can
reproduce in one line. It is the plan's odd-fact slot for 27 October.

## A new look

The video's page, as everyone has seen it: a player, the title and the
view count, large. The count is the hero. Under it, the counter's 32 bits,
then the Java that prints the same numbers. The first cut was a macro of
binary counter wheels; the creator found it vague ("doesn't know what's
going on") and asked for a video-page look, so the viewer recognises the
view count before reading anything.

The player shows a dancer in a blue suit and round sunglasses doing the
horse-riding dance, rendered in Blender from a CC0 Quaternius character.
It is not a frame of the music video: that footage is PSY's, and two of
the page's reels already carry ownership flags. No platform logo either;
the title and the count say what it is.

## Scope and honesty

- Google told The Verge its engineers updated the counter a couple of
  months before the video got there. The reel says YouTube moved to 64
  bits; it does not say the counter broke or showed a negative number.
- YouTube's post gave the 64-bit ceiling as 9,223,372,036,854,775,808,
  one more than the real Long.MAX_VALUE. The reel shows the measured
  9,223,372,036,854,775,807.
- The code is Java, where int overflow is defined to wrap. YouTube's own
  code is not public, and the reel does not claim it was Java.
- During the race to 6 billion the count and the bits run between the
  two measured values; they are the counter running, not measurements.
- The page imitates no platform's branding; the dancer is not PSY's
  footage and does not claim to be.
