# Vertical 40: caught in the rain, walk or run

Status: posted 2026-10-19

## What it claims

Caught in heavy rain 14 m from a bus shelter, running there gets 29% fewer
raindrops on you than walking: 2,590 against 3,665. The drops in your path
are the same either way, 2,172, because every drop in the strip of air
between you and the shelter gets walked or run into once, however fast you
go. What speed changes is the rain landing on your head and shoulders,
which falls at the same rate for as long as you are out in it: 10.2 s
walking, 2.9 s running, so 1,492 drops against 418, 3.6 times as many.

## Why this topic

The last four reels (bus bunching, holding the lift, the gym bench, the
Tesla Roadster) stayed on the floor, and every reel that escaped since the
elevator was a fight people already have about their own behaviour. Walk
or run in the rain is one of the oldest of those fights; MythBusters
tested it twice and got opposite answers. Everyone has stood under an
awning deciding, and both camps have a reason: runners say less time in
the rain, walkers say you run into more drops. The reel shows both reasons
being true at once, on two counters.

## Scope and honesty

You are a box 1.7 by 0.45 by 0.25 m, the rain 20 mm/h of 2 mm drops
falling straight down at 6.54 m/s (the Gunn and Kinzer fall speed), the
walk 1.4 m/s and the run 5 m/s. None of these is known for a particular
shower, so the script sweeps each: running is 21% to 39% better across
rain rate, drop size, distance, both speeds and three body sizes, and the
front count never changes with speed. The counts on screen are the
formula; 1,000 simulated showers, with every drop tested against the
moving box, agree to within 0.1%.

The model is still air. With the wind behind you at about your walking
speed, walking can come out ahead (the script's 1.5 m/s tailwind: 18%
fewer drops walking); into the wind, running wins by more (46% at
1.5 m/s). That is Bocci's result too, and it is in the replies, not the
reel. A runner leaning forward catches less on top than the upright box
does, so the box is the cautious case for running. Splashes from your own
feet are not counted.

The person is a Quaternius CC0 character; the street, the shops and the
shelter are built for this reel. The wet patches on the clothes follow the
counts (head and shoulders by the top count, chest and legs by the front
count); they are drawn, not simulated.

## Files

- `src/vertical/40-rain-run/`: the model, the counters and the reel
- `scripts/measure-rain-run.mjs`: the committed run
- `scripts/blender/rain/`: the street, the rain and the render
