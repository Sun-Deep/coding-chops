# Vertical 36: should you stand up when the seatbelt sign goes off

Status: posted 2026-10-14

## What it claims

When everyone stands up the moment the seatbelt sign goes off, they get off
the plane sooner, because each row is already on its feet with its bags
down when the row in front moves. When everyone stays seated until the row
in front has left, each row starts late and the delays add up down the
cabin. The cost of standing is the wait itself, spent bent under the bins.

In the model, at the defaults, standing at once gets people off 54.9
seconds sooner on average, and every passenger is sooner, but they spend
3:51 on their feet against 0:28. A computer that checks over and over
whether it can go yet, instead of sleeping until it is woken, is busy
waiting: it starts a little sooner and spends the whole wait doing nothing
useful.

## Why this topic

Standing up early is an argument people already have on every flight, and
both camps think the other is wrong. Here both are partly right, which
gives the comments something to argue about.

## Scope and honesty

How fast people stand, step out and get their bags down, and when the door
opens, are assumptions, not data from an airline. The script sweeps the
door time, the share with bags, bag times and cabin length, and standing
wins on time at every setting. The size of the gain depends most on how
long seated people wait: if they stand when the row in front starts to
move rather than when it has left, the gain falls to about 13 seconds.

The reel shows seed 1. The followed passenger is in row 6, the row whose
time saved is closest to the 100-flight average, in its aisle seat so the
camera can see them: off at 3:28 standing, 4:22 seated.

## How it got here

A first version drawn in SVG was rejected as not looking like a plane,
cluttered and lifeless. This one is rendered in Blender
(`scripts/blender/deplane/`) with Quaternius's CC0 animated characters: a
cutaway airliner at the gate at dusk whose roof lifts away, each passenger
blending between sitting, standing up, standing, reaching into the bin and
walking, on the model's timeline. Remotion lays the headline, labels,
narration and sound over the two renders.
