# Music

## bed.mp3

| Field       | Value                                                                                              |
| ----------- | -------------------------------------------------------------------------------------------------- |
| Track       | First Light Particles                                                                              |
| Artist      | Yoiyami                                                                                            |
| Source      | https://opengameart.org/content/first-light-particles-%E2%80%93-cc0-atmospheric-pianoambient-track |
| Licence     | CC0 1.0 Universal, public domain dedication                                                        |
| Attribution | Not required                                                                                       |
| Downloaded  | 2026-08-23                                                                                         |

CC0 was the deciding factor. This repository is public and MIT licensed, and
CC0 is the only common music licence that places no restriction on
redistributing the file itself. Pixabay and the YouTube Audio Library are fine
to use in a video but restrict redistributing the audio as a standalone file,
which committing to a public repository arguably is.

The author states the piece was composed from scratch with no commercial
samples or third-party audio.

## What was done to it

The source is 131 seconds. Measuring it in ten second windows, the stretch from
28s to 74s is its calmest passage, which is what a bed wants: no melodic peak
arriving in the middle of a spoken sentence. That 46 seconds is what `bed.mp3`
holds.

Beyond the trim: a high-pass at 62 Hz, 3 dB off the shelf above 4.2 kHz to keep
it out of the way of consonants, fades at both ends, and loudness normalisation
to -30 LUFS.

Nothing else. If a later scene needs a different passage, cut a new file rather
than editing this one, and record it here.

## How it plays

`MusicBed` ducks it against the narration using the caption timings, so the
level drops before a word starts and recovers once a sentence ends. The duck is
exact and identical on every render, unlike a compressor listening to the voice.

It also loops. Every scene but the opener and the disclosure runs longer than
46 seconds, up to 91, so without looping the music simply stopped partway
through and the rest of the scene played dry. The seam falls wherever it falls,
which is inaudible on an ambient bed sitting under a voice.

If you can identify the melody while someone is speaking, it is too loud.
