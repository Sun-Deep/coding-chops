# Full cut review, 19 October 2026

Status: rendered for creator review. The understanding gate remains open.

The creator approved the full build after the four-second test and requested
more realistic coins. The full cut replaces the thick blanks with thin reeded
coins carrying an invented portrait, serif lettering and a wreath. Tweezers
support transfers. The balance arrest holds the beam during loading, and the
answer turns onto its edge while staying supported.

## Outputs

- `out/vertical/vr41-coin-puzzle.mp4`, 1080 by 1920, 420 video frames at 30 fps
- `out/vertical/vr41-cover.png`
- `out/vertical/vr41-cover-crop-1x1.png`
- `out/vertical/vr41-cover-crop-3x4.png`
- `out/vertical/vr41-full-contact.png`, one complete frame per second
- `out/vertical/vr41-motion-sheet-01.png`, first weighing at three-frame intervals
- `out/vertical/vr41-motion-sheet-03.png`, candidate transfer and second weighing
- `out/vertical/vr41-motion-ending.png`, last four seconds at three-frame intervals
- `out/vertical/vr41-full-safe-review.png`, end shot against the safe-area guide

## Checks

The first run and the run after the full render agree on all counts. Every one
of the nine lighter-coin positions is solved, and all 81 mass variations pass.
The motion check covers all 420 frames, preserving identities, checking coin
separation, matching every transfer to its tweezers and checking subtitle pace
and shot boundaries. No answer coin has a different highlight before the
first weighing narrows the candidates.

The frame-15 glance, contact sheets, ending and square cover crop were
inspected. The complete movie was played in QuickTime muted and with sound.
The longest near-static interval in the finished picture is 28 frames,
0.93 seconds. The sound is generated material handling, coin contacts, the
balance arrest and the answer turn. Its peak is about -6 dBFS, with no music
or voiceover. Pauses give the viewer time to interpret the weighing results.

Typecheck, lint, curriculum validation, scoped formatting, Python compilation,
shell syntax and composition discovery passed. Generated renders remain
ignored. No commit was made.

## Creator gate

The understanding checklist remains unticked and `script.md` remains blocked.
The creator still needs to review the delivered cut and complete that checklist
before publication. The eight-equal-coins and known-lighter conditions are
essential; this does not solve an unknown-heavy-or-light coin puzzle.
