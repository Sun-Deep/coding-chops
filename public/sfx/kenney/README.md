# Recorded effects (Kenney, CC0)

Real recordings, used where a generated effect sounds like what it is: noise
and sine waves. They come from two packs by Kenney (www.kenney.nl), both
released under Creative Commons Zero, so they can be used, changed and
redistributed with no conditions. `License.txt` is the pack's own licence
file.

| Pack                   | Downloaded from                           | Files here                                                                                                                 |
| ---------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Impact Sounds (1.0)    | https://kenney.nl/assets/impact-sounds    | `impactWood_*`, `impactGeneric_light_*`, `impactBell_heavy_000`, `impactSoft_heavy_000`                                    |
| Interface Sounds (1.0) | https://kenney.nl/assets/interface-sounds | `click_002` to `click_005`, `tick_*`, `confirmation_001`, `error_004`, `drop_002`, `switch_003`, `switch_004`, `glass_003` |

Downloaded 2026-10-22 and converted from Ogg to 48 kHz mono WAV with ffmpeg.
The clicks shorter than one video frame (`click_002` to `click_005`,
`tick_002`) are padded with silence to 0.12 s, because Remotion drops an
audio clip shorter than a frame without a warning; the sound itself is
unchanged. Each file peaks near -1 dBFS, so a cue's gain is
the level it should sit at. Only the files a reel uses are kept here.

First used by VR43, git bisect: key clicks as commands type, a wooden tap as
a commit is picked up, the ruled-out half clattering down, a bell when git
names the commit.
