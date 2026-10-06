# Vertical 27: the light is green, why is it stuck

Status: posted to Facebook 2026-10-05

## What it claims

Gridlock is a deadlock. When drivers enter a junction on green with no room
past it, a car can end up standing in the junction and blocking the cross
street. Round a one-way block, four junctions held that way make a loop:
each stuck car waits for the queue in front, which waits for the next
junction, which is held by the next stuck car. Nothing in the loop can ever
move, whatever colour the lights are. Drivers who wait until there is room
past the junction never form the loop.

The reel shows the same block twice, side by side, with the same cars. On
the left drivers go on green; on the right they wait for room. The left
locks and stands still under green lights while the right keeps moving.

## Why this topic

It is the first reel built coding idea first. Deadlock is in every operating
systems course and gridlock is its textbook picture: four conditions, all of
them visible on a road. Mutual exclusion (one car per junction), hold and
wait (a car holds the junction while it waits for road), no preemption (it
cannot reverse out) and circular wait (the loop). "Wait for room" breaks hold
and wait, which is the standard fix in code too.

It also keeps what made the everyday reels escape: a question about
something everyone has sat in, with no place named, and an argument people
already have about drivers who block the box.

## Scope

A model of one block, not a city. It shows that the loop can form and that
waiting for room prevents it. It does not say how often real junctions lock:
real drivers are a mix, and in this model the loop is rare unless most of
them block (4 of 100 runs at half, 26 at three quarters). Field studies in
Atlanta found more than half of drivers block when they get the chance.
