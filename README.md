# Coding Chops

An open-source visual curriculum for system design, data structures and algorithms, and problem solving.

The project follows one non-negotiable publishing rule:

> A lesson is not ready because the animation looks good. It is ready when the creator can explain, draw, evaluate, and apply the concept without relying on the script.

## Status

Episode 1 is published: [How One Server Runs a Web App](https://youtu.be/PyRwPoFdERg).

A script leaves `Status: blocked` only when every box in its understanding check
is ticked, and `npm run check` fails if the two ever disagree. That check is the
gate, not a note somebody remembers to update.

Lessons come out one at a time, each waiting on the one before it. No schedule,
and no list of announced titles to fall behind on.

## Tracks

[System design](curriculum/system-design/README.md) has the published lesson,
the order the rest run in, and the gates each one passes.

[Data structures and algorithms](curriculum/dsa/README.md) and
[problem solving](curriculum/problem-solving/README.md) have none yet.

Every track uses the same brand, primitives and production standard, and keeps
its own curriculum and compositions.

## Formats

Each approved lesson produces:

- One horizontal YouTube master
- One thumbnail composition
- Learning notes, sources, understanding checks, script, and storyboard

One lesson, one video. The master never gets cut into vertical clips. A clip
that needs the full episode to make sense is not a lesson, and one that does
not is a different lesson that deserves its own script.

## Quick start

Requirements:

- Node.js 22
- npm 10 or newer

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm run check
```

```bash
npm run compositions
```

```bash
npm run render:episode
```

```bash
npm run render:thumbnail
```

## Narration audio

The narration recordings are not in this repository. They run to roughly 300 MB
across the raw takes, the noise-reduced passes and the masters, and the content
licence excludes narration recordings from what is granted.

The caption JSON in each episode's `audio/captions` directory does ship. That is not a convenience. It is the timing source the whole project is
built on. Every animation in every scene anchors to the frame a specific word is
spoken, so the compositions do not even load without it.

To render without the recordings:

```bash
node scripts/silent-narration.mjs system-design/01-single-server
```

That writes a silent stem per scene, each exactly as long as the real one. You
get the finished video with nobody speaking. Subtitles still carry every word,
so the lesson is followable. It never overwrites a file that is already there,
so if you do have the real stems it does nothing.

If you re-record, the pipeline is:

```bash
node scripts/transcribe-narration.mjs curriculum/<track>/<episode>/audio
```

```bash
node scripts/narration-durations.mjs curriculum/<track>/<episode>/audio
```

The first transcribes the masters to word-level captions and applies
`caption-corrections.json`; the second regenerates `narration.ts`, which is what
gives each composition its length. Pass `--recorrect` to the first to re-apply
corrections to existing captions without running transcription again.

Two more sit in front of that, for turning a raw take into a master:

```bash
scripts/measure-voiceover.sh <file-or-directory>
```

```bash
scripts/clean-voiceover.sh <input-audio> [output-dir] [--denoise|--minimal]
```

Measure first. It reports the room tone in the gaps between phrases, which is
the number that decides whether denoising is worth doing at all. Then clean,
with `--minimal` if the take has already been through a repair tool, because
stacking a second round of EQ and compression is what makes narration sound
processed. Sound effects are generated rather than licensed. `scripts/build-sfx.sh`
reproduces the whole set.

## Repository map

```text
curriculum/                 Learning notes, sources, scripts, and storyboards
curriculum/**/audio/captions   Word-level caption JSON. Every animation is timed off these
docs/                       Production and visual-language contracts
public/                     Redistributable static assets used through staticFile()
public/music, public/sfx    Each carries a README recording its provenance and licence
scripts/                    Validation, transcription and audio tooling
src/shared/scene            The world: phone, wire, machine, callouts, meters
src/shared/primitives       Scene shell, captions, grade, music bed
src/shared/video            Timing, motion and caption helpers
src/tracks/                 Track and episode compositions
```

## Retention experiments

A retention result is a hypothesis generator, not proof that any single factor
caused the outcome. Recording the same fields every time is what makes two
episodes comparable at all.

For each published lesson, record:

- The exact first frame
- Spoken and on-screen hook
- Time until the first useful answer
- Visual changes during the first fifteen seconds
- Thirty-second retention and the first large drop
- Average watch time and percentage viewed
- Shares, saves, subscriptions gained, and outbound clicks

See [the retention experiment template](curriculum/templates/retention-experiment.md).

The production workflow is defined in [the video production standard](docs/video-production-standard.md). The visual identity is defined in [the visual-language contract](docs/visual-language.md).

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before proposing code or curriculum changes. Official lessons require sources, an understanding check, and editorial review.

## Licensing

- Source code is licensed under the [MIT License](LICENSE).
- Curriculum text and original diagrams are licensed under [CC BY 4.0](CONTENT-LICENSE.md).
- The Coding Chops name and logo are not granted under either license.
- Third-party assets retain their original licenses.
- Remotion has separate licensing terms. Users are responsible for checking the terms that apply to them.
