# Vertical 15: five fields, five units of time

Status: blocked

Built, rendered and reviewed. The creator understanding check is still open.

## What it claims

A cron line is five fields, and the five fields are five units of time. Pin one
and you drop to the next.

`* * * * *` fires 525,600 times in 2026, which is every minute of the year. Pin
the minute and it is 8,760, the hours. Pin the hour and it is 365, the days. Pin
the weekday and it is 52, the weeks.

## Why this topic

It is the same shape as VR12, which is the best performing cut on this page at
134K. chmod does not explain permissions, it hands over a key: after fourteen
seconds you can read any mode. This hands over the same kind of key for a line
everybody has copied off Stack Overflow without being sure which position was
which.

That was the lesson VR14 ignored. QR codes were more household and produced a
better surprise, and gave the viewer nothing they could use the next day. It did
12K in 36 hours against a run averaging 80K and up. Household is not the
variable that pays; usable is.

## Why these four expressions

Chosen after the measurement rather than before. Pinning the fields in order
walks down the units of time and lands on four numbers everybody already knows:
525,600, 8,760, 365, 52. See `measurements.md`.

## What is out of scope

Seconds fields, `@reboot` and friends, `L` and `W`, and the difference between
crontab flavours. Each is a second idea.

The day-of-month and day-of-week OR rule is out of the reel and in the caption,
where it is the catch. It is a real and surprising gotcha, and it is also the
one case the hand-written matcher refuses to count rather than getting wrong.

## Files

| File                                   | What it is                                 |
| -------------------------------------- | ------------------------------------------ |
| `scripts/measure-cron.mjs`             | the measurement, and the source of figures |
| `src/vertical/15-cron/measurements.ts` | the figures, one module                    |
| `src/vertical/15-cron/fields.ts`       | the fields re-implemented and asserted     |
| `src/vertical/15-cron/Schedule.tsx`    | the expression, the week and the count     |
| `src/vertical/15-cron/Reference.tsx`   | the four lines, kept                       |
