# Learning notes

## Why both got the seat

Each buyer's transaction reads seats_left, spends 50 ms on the payment,
then writes. If the second read happens before the first write is
committed, both reads see 1 and both go on to sell the seat. That is a
race condition: the answer depends on who gets there when.

## What FOR UPDATE changes

SELECT ... FOR UPDATE locks the row it reads. The second buyer's read on
the same row waits until the first transaction commits, then sees the new
value, 0, and does not sell. The cost is that the second buyer waits for
the first one's payment.

## Other fixes

Do the check and the write in one statement: UPDATE shows SET seats_left
= seats_left - 1 WHERE id = 2 AND seats_left > 0, and only sell if it
changed a row. Or a unique constraint on (show, seat) so a second ticket
for F12 fails to insert.

## The 1 in 3

It comes from the test's conditions: taps within 0.2 s, 50 ms between
read and write. Taps closer than about 55 ms sold twice. Spread the traffic
out and it happens less; it never happened with the lock.
