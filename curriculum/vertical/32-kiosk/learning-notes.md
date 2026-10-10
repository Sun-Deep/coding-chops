# Learning notes

## A pipeline

Ordering, cooking and collecting happen one after another for each
customer, and different customers are in different stages at once. How
many customers an hour the restaurant can serve is set by its slowest
stage.

## What the kiosks change

Six screens take orders about four times as fast as one till, even though
each customer spends longer on a screen. If the till was the slowest
stage, the kitchen now is. Orders pile up in front of it instead of
customers piling up in front of the till, and people stand at the pickup
counter instead of in line.

## Amdahl's law

Gene Amdahl, 1967: if only part of a job can be sped up, the whole job can
never be faster than the part that cannot. Adding processor cores speeds up
the parallel part of a program; the serial part sets the limit. Here the
ordering is the part that got six screens, and the kitchen is the part
that did not.

## What would help

A faster kitchen. In the sweep, a kitchen at 30 s an order instead of 42
makes kiosks 49% faster instead of 21%. Past the kitchen's pace more screens
do nothing: three kiosks and ten give the same times.
