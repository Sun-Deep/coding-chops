# Storyboard

Three beats on one object, and the object is a QR code.

| Frames  | Beat            | Hero                                               |
| ------- | --------------- | -------------------------------------------------- |
| 16-128  | the hole opens  | a square eating the middle, ring by ring, to 16x16 |
| 128-214 | it reads anyway | a scan line crossing the damage, then the link     |
| 158-300 | why             | 134 pieces flying out, 46 of them the link         |
| 262-318 | the reference   | four levels, more backup buying a bigger hole      |
| 318-400 | the heal        | the missing squares coming back                    |

## Why the surprise comes first

The cut could have opened by explaining what a QR code is made of and then
demonstrated the hole. It opens with the hole instead, because nobody has a
question yet at frame zero and the damage creates one. "It still scans" is the
moment the viewer wants an answer, and the 70 pieces are the answer.

That order is what separates an explanation from a fact.

## Why the hole is countable

It opens a ring at a time to 16 by 16, with a sound on each ring, and the number
in the band is 256. A viewer who does not believe it can count the square
against the grid it sits in. That is chmod's `4 + 2 + 1 = 4`: the frame does not
ask to be trusted.

## Why the pieces fly

They used to fade in where they belonged, and the frozen-frame check called the
whole beat a still. Small squares appearing change almost no pixels in a 1080 by
1920 frame, so for 1.7 seconds the cut looked stopped while it was busy.

Flying them out of the symbol fixed the picture and said something truer at the
same time: they are not a chart about the code, they are what is in it. Same
class of note as VR12's drum spins and VR13's drain. On a cut with few moving
parts, an event has to be given size.

## Why it heals

The claim is that 44 pieces exist to rebuild the other 26, and the last beat is
the viewer watching exactly that happen. It also carries the closing seconds,
which otherwise held still from the last ladder row to the end.

The last frame is the code whole again with the reference under it, which is the
true end state: nothing was lost.

## Why the code is the repository

The symbol encodes `https://github.com/Sun-Deep/coding-chops`, and the finished
reel really does scan: frames pulled out of the mp4 with the hole fully open
decode to that URL. A viewer who points a phone at the screen lands on the code
the figures came from, which is the strongest form of a checkable moment there
is. Not a number they can recompute, an artefact they can test.

## Colour

One accent. The symbol is ink on paper, which is what a QR code is and the only
place in this format where a light plate is allowed. Orange marks the damage,
the scan, the link's own pieces and the level the cut is running at. Everything
else is neutral.

## Cue map

| Event                  | Sound    | Pitch                       |
| ---------------------- | -------- | --------------------------- |
| the code landing       | `appear` | fixed                       |
| a ring of the hole     | `swap`   | falling as the square grows |
| the hole finished      | `settle` | low                         |
| the scan crossing      | `scan`   | fixed                       |
| it read                | `solved` | fixed                       |
| the link typing in     | `tick`   | high                        |
| a piece landing        | `tick`   | link high, backup low       |
| the split              | `name`   | fixed                       |
| a row of the reference | `land`   | rising down the rows        |
| the code being rebuilt | `probe`  | rising                      |
| whole again            | `solved` | fixed                       |
