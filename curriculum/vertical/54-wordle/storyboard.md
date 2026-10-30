# Storyboard

One physical Wordle board, rendered in Blender. Its six rows, five columns,
Wordle masthead and three-row keyboard carry the complete cut. The camera moves
with the feedback reveal and pulls back for the result. The typography and
burned-in narration follow the recent Blender cuts, including SQL order,
OFFSET and Gangnam Style.

| Frames     | Event                                                  | Why it is on screen                                                          |
| ---------- | ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| 0 to 33    | ADIEU types into the first row. Keys depress.          | Open inside a recognizable game already in progress.                         |
| 34 to 115  | The five tiles flip, yellow/gray/gray/yellow/gray.     | The matching candidate set narrows from 2,309 to 187.                        |
| 116 to 165 | The board resets, then ROATE types into the first row. | Compare a different opener against the same hidden answer.                   |
| 166 to 251 | ROATE flips yellow/gray/green/yellow/green.            | Only STARE, TRACE and TRADE match.                                           |
| 252 to 335 | TRACE enters the second row and flips all green.       | Finish an actual valid play sequence. This guess is selected for the replay. |
| 336 to 419 | The camera returns to the full solved board.           | Hold the all-answer mean comparison and the limit of ROATE.                  |

`game.ts` computes every displayed game state from a Remotion frame. The Blender
export records that same state for each of the 420 frames. No animation uses CSS
transitions or keyframes. Blender only gives the recorded states a physical body.

## Feedback colors

This episode uses Wordle's green, yellow and gray to encode its rules. The
creator explicitly asked for real Wordle gameplay after rejecting the orange
score display. Green means the letter and place match, yellow means an available
copy occurs elsewhere, and gray means this occurrence is absent. Colors on the
keyboard preserve the strongest known state for each letter.

This is an episode-only exception to the single teaching accent rule. It solves
recognition and preserves the actual game semantics. It does not change the
shared palette or other cuts. Verify every colored tile against the measured
feedback, and review the game at phone size. Orange stays on the channel mark
and the final measured winner, outside the game board.

## Set and camera

A graphite board stands on a low foot against a curved charcoal studio backdrop.
Beveled tile edges and keycaps show depth. A soft key and a restrained rim light
separate it from the ground. The camera moves closer while the first row flips,
then returns to the complete board. It keeps letters sharp and leaves the lower
caption band clear. No extra characters or scene metaphors are introduced.

## Sound

Recorded Kenney CC0 key clicks follow actual key presses. Quiet wooden taps
follow tile flips. A switch marks the alternate replay. A confirmation marks the
all-green row. The final comparison has the strongest cue. No voice or music bed.
