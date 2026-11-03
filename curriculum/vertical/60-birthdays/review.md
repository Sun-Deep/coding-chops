# Review

Production checks on `out/vertical/vr60-birthdays.mp4`, 3 November 2026.
The understanding check and the creator's phone review, muted and with
sound, are still open.

- Length 14.06 s, 1080 x 1920, 30 fps.
- Every third frame looked at on two 10 x 7 contact sheets; one still per
  section at full size (frames 40, 150, 188, 380).
- The first render's strings that were not drawn yet showed as black lines;
  they are transparent now. The other 99 rooms were visible behind the first
  from frame 0; they now wait in the dark until the camera rises.
- The ring was wide enough that two date tags below y 1000 crossed x 930
  and one sat inside the left margin; the camera pulled back 12% and the
  rightmost tag below y 1000 now ends near x 922.
- The two counters faded through each other during the rise; one now
  leaves before the other arrives.
- The opening first measured 0.656 (tblend difference, mean YAVG over four
  seconds): one string every few frames while the class stood still. The
  strings now grow as time to the power 1.5, about 35 by the end of the
  first second. The score moved only to 0.679 because thin strings change
  little area; frame 30 shows the fan of strings clearly.
- No freezes (freezedetect n=0.001, d=1). Peak about -6 dB.
- Cover at 9:16, 1:1 and 3:4: headline, the ring and both NOV 12 tags survive.
- Every number traced to `runs/birthdays.json`; the export refuses to run if
  `measurements.ts` drifts from it.
