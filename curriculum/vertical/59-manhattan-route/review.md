# Review

Production checks on `out/vertical/vr59-manhattan-route.mp4`, 3 November 2026.
The understanding check and the creator's phone review, muted and with
sound, are still open.

- Length 14.06 s, 1080 x 1920, 30 fps.
- Every third frame looked at on two 10 x 7 contact sheets. Both counters
  read the same number while both run; A\* locks at 1,062 on frame 48,
  Dijkstra at 21,559 on frame 270.
- One still per section at full size (frames 36, 170, 380). The conditions
  line sat on blue streets in the first render; it now has its own dark
  ground and the top band is darker.
- Opening frame at a quarter size: headline and island both readable.
- Motion over the first four seconds (tblend difference, mean YAVG): 2.703.
  SQL's was 1.467.
- No freezes (freezedetect n=0.001, d=1): the camera drifts to the last frame.
- Peak -6.0 dB, mean -32.8 dB.
- Cover at 9:16, 1:1 and 3:4: headline, both pins and the orange thread
  inside the blue survive every crop. The first cover drew the city over the
  headline; the city now goes down first.
- Readable elements inside y 190 to 1500; below y 1000 nothing crosses x 930
  (the WALL ST label ends near x 600).
- Every number traced to `runs/route.json`; the export refuses to run if
  `measurements.ts` drifts from it.
