# Vertical 50: Google's AI interview, and why LeetCode isn't dead

Status: published 25 Oct 2026 at 8:44 PM.

A 29-second news cut in the creator's voice. Google is piloting a coding
round where candidates fix existing code with Gemini and are graded on how
they use it. The internet read it as "LeetCode and DSA are dead"; the reel
shows that the round grades catching the AI when it is wrong, which needs
the very skills people called dead, and that it is a pilot.

The second voiced cut, recorded under section 14 of
`docs/vertical-format-standard.md` before VR48's numbers are in.

## Building it

1. Stems in `audio/master/` (not in Git), linked for Remotion:
   `ln -sfn ../../../curriculum/vertical/50-google-ai-interview/audio/master public/narration/vertical/50-google-ai-interview`
2. After a re-record: `node scripts/transcribe-narration.mjs curriculum/vertical/50-google-ai-interview/audio`
   and `node scripts/stem-bounds.mjs curriculum/vertical/50-google-ai-interview/audio`
3. `scripts/blender/interview/render.sh`
4. `npx remotion render src/index.ts VR50-Google-AI-Interview out/vertical/vr50-google-ai-interview.mp4`
