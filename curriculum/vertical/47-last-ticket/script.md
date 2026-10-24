# Script

Status: blocked

No voiceover and no music. The narration is burned into the frame.

| Frames  | Line                                                |
| ------- | --------------------------------------------------- |
| 4-54    | Two taps, 19 ms apart.                              |
| 60-130  | Both read 1 left. / Both get seat F12.              |
| 136-198 | One seat, sold twice.                               |
| 210-258 | FOR UPDATE locks the row. / The second buyer waits. |
| 264-342 | Then reads 0 left: / sold out, not sold twice.      |
| 350-414 | **No lock: 1 in 3 sold twice. / FOR UPDATE: 0.**    |

## On screen

```text
headline   1 seat left. / 2 people tap Buy.
code       each buyer's transaction: BEGIN; SELECT seats_left ...;
           -- 50 ms: take the payment; UPDATE ...; INSERT ...; COMMIT;
           the running line lit; in take 2, FOR UPDATE appears in orange
scene      eye level at the front of a dark cinema, rendered in Blender;
           two people with phones in front of the first row, one lit
           empty seat, F12. Take 1: both celebrate, both walk to F12, one
           sits, the other arrives with a ticket for a taken seat. Take
           2: an orange padlock drops on F12, the second waits, it lifts,
           the second reads 0 and is told sold out; the first sits.
bubbles    what each transaction sees: taps Buy, reads: 1 left, ticket:
           F12, waiting for the lock, reads: 0 left, sold out
chips      TAKE 1 plain SELECT / TAKE 2 FOR UPDATE; SEATS_LEFT 1, 0, -1;
           at the end SOLD TWICE 327-342 / 1,000
orange     the lock: FOR UPDATE and the padlock
```
