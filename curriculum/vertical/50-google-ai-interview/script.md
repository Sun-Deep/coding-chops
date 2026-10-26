# Script

Status: published

The creator's own voice, one take, 27.9 seconds recorded, the reel 29.
Built around the creator's hook: people are saying LeetCode and DSA are
dead, and they are not. The captions are the transcription of the take,
with the corrections in `audio/caption-corrections.json` ("lead code" to
LeetCode, "Germany" to Gemini, "great" to grade, and "their" to "the" in
"the regular coding rounds", which follows the script and is the one
correction not certain from the audio).

## stem-01

Everyone's saying LeetCode and DSA are dead because Google now lets you use AI in interviews. But that's not really what's happening. Google is testing one new round where you fix code someone else wrote with Gemini's help. And they grade whether you catch it when Gemini is wrong, which you can't do if you don't understand the code yourself. It's a pilot on some US teams and Google hasn't said it's dropping the regular coding rounds.

## On screen

```text
label      GOOGLE · HIRING NEWS, top right, level with the mark
headline   LeetCode and DSA / are dead? -> LeetCode is dead? / Not even
           close. -> Google's new round: / fix code with AI. -> Graded:
           can you / catch the AI's bug? -> Only a pilot. / LeetCode
           isn't dead.
code       the editor: a binary search with a bug (LeetCode 704); the bug
           report; the AI's fix landing in orange; the reported case
           passing and another still wrong; the real fix passing all
           12,156 cases; then the pilot and the source
assistant  under the editor from the first frame, a terminal agent's
           pane marked in blue: an idle prompt box, the question typed,
           the reply (labelled an example, not Gemini's output), and
           WRONG on it when the test fails
scene      an interview room at eye level, rendered in Blender: the
           candidate reads, types, leans in, shakes their head at the
           failed test, types the fix and sits back; the interviewer
           glances at the screen, writes a note and nods
chips      the three graded skills, each as it is reached
```

## Where the claims come from

See `sources.md`. The code results are measured by
`scripts/measure-google-interview.mjs`.
