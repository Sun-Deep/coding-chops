# Learning notes

A longer gap ahead of a bus lets more passengers accumulate. More boardings
extend its stop. The following bus sees fewer passengers and needs less time
at that stop. The spacing can shrink even when driving speeds are identical.
This is positive feedback: the effects of a delay reinforce the delay.

The simulation advances in quarter-second ticks. Arrivals follow a seeded
Poisson process at each stop. A bus boards passengers individually, including
new arrivals while its doors are open. It leaves when the queue is empty.
Buses cannot overtake or pass through each other. A fixed door allowance
applies even at an empty stop.

The opening queues use explicit previous-clearance times. They are initial
conditions, not an equilibrium timetable. There is no capacity limit,
alighting, signal control, holding policy, overtaking or driver variation.
The selected seed illustrates the mechanism; it is not a frequency estimate.

The no-passenger, no-delay control retains the initial spacing. This checks
that a hidden speed advantage is not responsible for the pictured catch-up.
Preventing bunching is outside this cut.
