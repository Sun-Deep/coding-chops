# Understanding check

The creator gate. Answer each without the notes, the script or the render.

- [ ] Explain why both buyers read 1 left in take 1.
- [ ] Say what FOR UPDATE does to the second buyer's read, and when it returns.
- [ ] Say why the 50 ms of payment between the read and the write matters.
- [ ] Say why 1 in 3 is not the rate a real shop would see, and what does carry over.
- [ ] Name one other way to stop the double sale (for example a single UPDATE with a WHERE seats_left > 0 check).
