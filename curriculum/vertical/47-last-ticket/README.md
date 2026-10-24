# Vertical 47: two people buy the last ticket

Status: built, not posted

## What it claims

One seat left, two people tap Buy at nearly the same moment. If the app
reads seats_left with a plain SELECT, takes the payment, then writes,
both buyers can read 1 and both get the seat. Raced 1,000 times on real
Postgres with taps up to 0.2 s apart and 50 ms of payment, it sold the
seat twice in 327 to 342 races per run, about 1 in 3, over five runs.
With SELECT ... FOR UPDATE the first buyer locks the row, the second
waits, then reads 0 and is told sold out: 0 double sales in every run.

## Why this topic

A coding reel the page's audience can feel without knowing SQL: everyone
has bought concert tickets. It is the race condition every booking,
checkout and wallet has to handle.

## A new look

The four reels before this one shared one Blender template (a glowing
grid on a dark floor, the same tilted camera). This one is built from its
story: eye level at the front of a cinema, two people with phones, one
lit seat, played twice as two takes. The creator asked for each reel to
look like its own topic.

## Scope and honesty

The 1 in 3 depends on the conditions, which are on screen and in the
script: taps within 0.2 s and 50 ms between the read and the write. Taps
closer than about 55 ms sold twice; further apart than about 65 ms they
did not. Real shops see far more spread-out traffic, so the rate on a
real site is lower; what does not change is that without a lock it can
happen, and with FOR UPDATE it did not.

The race the reel plays is the first one the plain SELECT sold twice:
taps 19 ms apart. The code on screen is simplified from the session the
script runs, which uses psql's \gset and \if to act on the read.

## Files

- `scripts/measure-last-ticket.mjs`: the races
- `src/vertical/47-last-ticket/`: the overlays and the reel
- `scripts/blender/ticket/`: the cinema and the render
