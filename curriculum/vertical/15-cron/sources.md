# Sources

- POSIX.1-2017, `crontab`, for the five fields, their ranges, and the rule that
  day-of-month and day-of-week are ORed when both are restricted. That last one
  is the caption's catch and the one case the hand-written matcher refuses.
- `man 5 crontab` on this machine, for the `*/step` form and for Sunday being
  both 0 and 7.

The counts come from two implementations: a matcher written for the measurement
script that walks every minute of 2026, and `cron-parser` 5.10.1, which steps
from one fire to the next. The script throws if they disagree. A third
implementation in `src/vertical/15-cron/fields.ts` walks the year again at
render time and asserts against the published figures.
