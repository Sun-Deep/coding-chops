# Learning notes

## Why the roundabout stops fewer cars

At lights, the junction is given to one road at a time. Every car that
arrives on the other road stops, whether or not anything is coming. At a
roundabout, a car stops only if a car coming round is actually in the
way, so most cars slow down and keep going.

## Lock and lock-free

A light is a lock on the junction: one road holds it, the other waits for
it to be released, even when there is room. A roundabout is lock-free:
each driver checks for a gap and goes, and only retries when there is a
real conflict. Lock-free code wins the same way, by not making everyone
wait for a holder that may not need the resource.

## Where the lights win

Everyone has to slow to about 17 mph to go round. On empty roads that is
pure cost, and a green light lets you through at 30, so late at night the
lights are slightly faster. Lock-free has the same overhead: the check
costs something even when nobody else is there.

## Keeping it fair

Real lights at this traffic have left-turn lanes and detectors, so the
model has both. The first version without left-turn lanes jammed; a later
version let cars drive through each other, and that error is what made
the lights look better at rush hour.
