# Learning notes

## Why keeping the bench wastes it

A workout here is 3 to 5 sets of about 40 seconds with about 2 minutes of
rest between them. Someone who keeps the bench holds it for the whole
workout and lifts on it for about a third of that time. The rest of the
time it is taken and idle, and the line grows.

## Taking turns

While one lifter rests, the next one lifts. The bench is used for most of
the time instead of a third, so the line moves several times faster. The
lifters who had the bench to themselves pay for it: when their rest is over
someone else may be mid-set, so their workout takes a little longer.

## Multitasking and context switches

A program often waits on something slow: a disk, the network, a user. A
processor that ran one program until it finished would sit idle through
every wait. Operating systems run another program during the wait instead.
Switching costs time, because the processor has to save one program's
state and load the other's. That is a context switch, and it is the plate
change. If switches cost more than the waits they fill, switching loses: in
the model, taking turns stops winning when a plate change takes about two
minutes.
