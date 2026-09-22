# Script

Status: blocked

No voiceover and no music. The narration is burned into the frame. Thirty words
across 14 seconds.

| Frames  | Line                               |
| ------- | ---------------------------------- |
| 6-66    | A site never stores your password. |
| 76-134  | It stores this.                    |
| 146-206 | Change one letter.                 |
| 214-276 | **Three of the 64 survive.**       |
| 286-344 | Type the right one and it matches. |
| 352-416 | **So nobody can send yours back.**  |

One unit throughout, and it is survivors. The row counts the characters that
came back, the narration names the same number, and nothing asks the viewer to
subtract. "61 of the 64 change" is the same fact and the more quotable sentence,
which is exactly why it had to go: VR10 put steps next to cost and VR11 nearly
put reads next to distinct positions, and both times the frame ended up arguing
with its own caption.

The last line is the one worth keeping. Everything before it explains a
mechanism, and a mechanism is what VR14 and VR15 were built on.

## On screen

```text
eyebrow     PASSWORD HASHING
headline    Change one letter. / 3 of 64 survive.
field       a password field, characters visible, caret blinking
row         64 hex characters, 16 across by 4 down, recomputed every keystroke
sweep       a comparison crossing the row one character at a time
count       3 OF 64 MATCH, counted as the sweep passes
chip        SAVED, then NO MATCH, then MATCH
keeper      A SITE THAT CAN EMAIL YOU / YOUR PASSWORD IS NOT DOING THIS
provenance  sha-256 - hashed three ways, they agree
```

Three passes at one login box. Sign up with `hunter2`, fail with `hunter3`,
succeed with `hunter2`. One object for the whole cut, which is what VR15 proved
out: a single thing changing state holds a frame far better than three shots
cutting between layouts.

The field shows characters rather than bullets. A row of dots would be truer to
a login screen and would hide the one thing the middle pass is about, which is
which character changed. The character that differs from the signed-up password
is drawn in the accent, derived from the passwords rather than typed in, so it
cannot drift.

Nothing in the frame is a stored picture of a hash. `sha256.ts` is a SHA-256
written from FIPS 180-4, and every glyph is computed from whatever is currently
in the field. Type a different password into `beats.ts` and the whole frame
changes. That is the only honest way to animate this claim, and it is also what
makes the seven keystroke turnovers real rather than decorative.

A survivor is a filled accent cell with the glyph knocked out of it, not an
accent glyph on a washed accent tint. The tinted version was two shades of the
same hue a few per cent apart and the three survivors were nearly invisible at
the size a cover is seen in a profile grid.

The sweep head only exists while the comparison is running. Left on, it parks on
the last cell for the rest of the pass and reads as a cursor waiting for input.

## Sound

A key going down, a position being compared, a verdict landing.

The comparison carries the claim. A position that came back rings; one that did
not knocks an octave and a fourth below, which is the register VR10 settled on
for the expensive event. So the wrong password is a run of dull knocks with
three rings buried in it and the right one is a run all the way across, and a
listener with the screen off hears which is which.

Density is held near twenty notes a second. Knocks fire every other position,
rings fire on every match, except in the passes where nearly everything matches,
where they stride by two as well, so sixty-four of them do not collapse into one
noise.

Peak -5.7 dBFS. No silence gaps at -45 dB over 0.35 seconds.

## Copy

In `publishing.md`, with the runtime, the cover and the crops, so everything the
upload form asks for is in one place.
