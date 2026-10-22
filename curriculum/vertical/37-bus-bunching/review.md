# Review

Built for review on 2026-10-15. Not marked publish-ready.

## Passed

- The seeded measurement repeats exactly. The script checks forward motion,
  the common speed limit, bus clearance and an equal-spacing control.
- The model used by the composition matches the recorded result.
- Typecheck, lint and curriculum validation pass.
- New source files and episode notes pass Prettier.
- The export has 420 video frames, 1080 × 1920 at 30 fps. AAC padding makes
  the container 14.059 seconds; the video itself is fourteen seconds.
- Start, midpoint and end frames for every subtitle were inspected.
- The opening was inspected at quarter size. The headline, buses and
  different queue sizes remain identifiable.
- Safe-area overlays were inspected at frames 15, 190, 280 and 390. No required
  text crosses the lower action rail or bottom reserve.
- Square and 3:4 cover crops were rendered and inspected.
- The longest run below the playbook's frame-difference threshold in v2 was
  seven frames, or about 0.23 seconds.
- The complete export played to the end in the local browser muted and with
  sound enabled. Screenshots and caption contact sheets supplement playback.
- The final audio peak is -5.4 dBFS, measured from the encoded export. This
  signal check does not replace listening with headphones.

## Before publication

- [ ] Creator passes the understanding check.
- [ ] Creator watches the complete export on a phone, muted and with headphones.
- [x] Repeat the measurement at least an hour after the first recorded run.
      `measurement-hour-repeat.txt` was recorded 3608.509 seconds later and
      has the same trace hash.

The full repository formatting check reports twelve existing files in the
password-hash episode and its measurement script. The new bus files pass the
scoped formatting check. Those other files were left as they were.

The model's initial conditions, arrival rate and boarding assumptions remain
visible in the source and measurement notes. No real bus-service timing is
claimed. Generated renders and frame grabs stay under ignored `out/`.

## Revised entrance and blockage

The following bus starts outside the opening camera view. The camera widens
as it approaches. It then stops behind the orange bus from frames 240 to 325,
about 2.8 seconds on screen, while passengers keep boarding the first bus.
The road constraint is explicit: one lane, no overtaking. The labels become
"Blocked" and "Still boarding", with an arrow pointing to the obstruction.

The movement run is unchanged. `measurement-blockage.txt` records the exact
22.75-second interval and the measurement script checks that the following
bus stays still throughout it. The final readout rounds that to about 23
seconds and appears only after the first bus leaves.

V2 is `out/vertical/vr37-bus-bunching-v2.mp4`. The original render is preserved
as `out/vertical/vr37-bus-bunching-v1.mp4`. The unversioned export points to v2.
Subtitle interval checks and safe-area overlays were repeated for this cut.
The new label fades in only once it has room inside the left safe margin.

## V3: arrival within two seconds and passenger pickup

The following bus reaches its passenger stop at frame 54, or 1.8 seconds.
The camera widens during frames 10 to 40 to show its approach. Its door opens,
passengers walk aboard and the label becomes "Picking up". Both buses have
visible queues and boarding actions. The following bus picks up thirteen
passengers at this stop, then continues and later gets blocked as before.

`measurement-pickup.txt` records the same trace hash and checks the two-second
arrival requirement. It also checks that the following bus is boarding at
frames 70 and 110 and that the boarded count increases between them. The
script checks that the waiting beat still matches the measured blockage.

The start, midpoint and end of each new subtitle interval were inspected,
as were safe-area overlays of frames 15, 54, 90 and 280. The longest low-change
stretch is seven frames, about 0.23 seconds. The encoded audio peak remains
-5.4 dBFS. The full export was played muted and with sound enabled.

V3 is `out/vertical/vr37-bus-bunching-v3.mp4`. The unversioned export and the
review player now use v3. V1 and v2 remain available for comparison.

## V4: the blocked bus signals

The following bus gives two 0.2-second horn taps at frames 252 and 261,
or 8.4 and 8.7 seconds. Each tap starts with a six-frame headlight flash.
The white beam stays between the buses. The blockage arrow dims during each
flash. Only the following bus signals, while it is blocked.

The new `bus-horn.wav` is synthesized by `scripts/build-sfx.sh bus-horn`.
The encoded export peaks at -5.4 dBFS overall. The first horn window peaks
at -14.3 dBFS. Frames 251, 254, 259, 263 and 268 were inspected to check
both flashes and the dark interval between them. Typecheck, lint, curriculum
validation and the scoped formatting check pass.
The full v4 export played to the end in the browser both muted and with sound
enabled. The creator's phone and headphone review remains open.

The export still has 420 frames at 1080 × 1920 and 30 fps. The bus model,
passenger pickup and blocked interval are unchanged. V4 is
`out/vertical/vr37-bus-bunching-v4.mp4`. The unversioned export and review
player now use v4. Earlier versions remain available for comparison.

## V5: early horn and vehicle lamps

The camera now widens during frames 0 to 30. The following bus signals as
it enters, at frames 23 and 35, about 0.77 and 1.17 seconds. It still reaches
the passenger stop at frame 54 and picks up thirteen passengers. There are
no horn or high-beam cues during the later blockage.

The headlight wedge is gone. Two lamp segments brighten with a soft bloom,
a short horizontal streak and a small road reflection. Each ten-frame pulse
has a two-frame rise and a five-frame fade. The red rear lamps brighten
before stops, stay on during boarding or blockage, then fade as the buses
leave. `signals.ts` derives those intervals from the recorded run. The
storyboard records red brake lamps as a creator-requested exception for VR37.

Frames 23, 26, 34 and 38 were inspected for the pulses and dark interval.
Frames 48 and 54 show the following bus's brake lamp turning on as it stops.
Frame 240 shows both brake lamps lit during the blockage; frame 330 shows
them released as both buses move. The audio peak remains -5.4 dBFS.
Typecheck, lint, curriculum validation, scoped formatting and the measurement
checks pass. The model and measured blockage are unchanged.
The full export played to the end in the browser with sound enabled. The
brake lamps were also inspected at feed size during muted playback. The
creator's complete phone and headphone review remains open.

V5 is `out/vertical/vr37-bus-bunching-v5.mp4`. The unversioned export and
review player now use v5. Earlier exports remain available for comparison.

## V6: repeated signals and no arrow

The horn and high beams now repeat in pairs every 54 frames, or 1.8 seconds,
from the following bus's entrance through the end. Both use `PASS_FRAMES`
as their timing source. There are sixteen taps, from frame 23 to frame 413.
The blockage arrow has been removed.

Frames 244 and 270 were inspected to confirm the arrow is gone during the
blockage. Frames 405 and 416 show the final pair of headlight pulses. The
encoded audio still peaks at -5.4 dBFS. Typecheck, lint, curriculum validation,
scoped formatting and whitespace checks pass. The export remains fourteen
seconds, 420 frames at 1080 × 1920 and 30 fps. The bus model and brake lamps
are unchanged.

The complete v6 export played to the end in the browser with sound enabled.

V6 is `out/vertical/vr37-bus-bunching-v6.mp4`. The unversioned export and
review player now use v6. Earlier exports remain available for comparison.

## Cover with passengers and vehicle lights

The cover now has larger buses, a passenger queue, a person boarding and a
bus-stop sign. Both rear brake lamps glow. The following bus's high beams
are lit, with a soft bloom and road reflection. Its lamp and passenger
shapes match the reel. The headline is unchanged.

The 1080 × 1920 export and its square and 3:4 crops were rendered and
inspected. The headline, queue, buses, lights and lockup survive both crops
at feed size. Typecheck, lint, curriculum validation and scoped formatting
pass. The reel remains v6.

The new cover is `out/vertical/vr37-bus-bunching-cover-v2.png`. The unversioned
cover and its two crop files now use this revision. The earlier cover is
preserved as `out/vertical/vr37-bus-bunching-cover-v1.png`.
