# Storyboard

Fourteen seconds, 420 frames. One hero object: the video's view count,
on a page everyone recognises. Every beat is a frame in
`src/vertical/51-gangnam-counter/beats.ts`.

## Its own look

A dark video page: the player on top, the title, the view count in large
mono, the counter's bits under it and three lines of Java under those.
The player plays a dancer rendered in Blender by
`scripts/blender/gangnam/render.sh`: a CC0 Quaternius character in a
powder-blue suit and round sunglasses doing the horse-riding dance, facing
the viewer: legs in a stride a beat at 132 beats a minute, a hop on every
beat, wrists crossed in front of the chest and pumped down as the feet
land; in the last stretch the right arm whirls the lasso overhead. On a
sunny set. Not footage from the music video.

## Shots

1. **The count (0 to 140).** He dances. The count climbs from
   2,147,483,610, slowing as it reaches 2,147,483,647, and the bits read
   0 then 31 ones.
2. **One more view (150 to 218).** The carry runs through the bits right
   to left, two frames a bit. The top bit, the sign, sets and turns
   orange; the count reads -2,147,483,648 views in orange; the code
   prints -2147483648. He stops and slumps.
3. **64 bits (290 to 350).** int becomes long; a second row of bits,
   63 to 32, appears above; bit 31 is a number again; the count reads
   2,147,483,648 and he dances again.
4. **6 billion (352 to 420).** He whirls the lasso. The count runs to
   6,000,000,000; bit 32,
   in the upper row, is set. The code puts 6 billion into an int and
   prints 1705032704, in orange: the lower row alone.

## Sound

Kenney CC0: a tick per view as the count slows, a switch at the ceiling,
32 clicks for the carry, a heavy clunk as the sign sets, knocks as the
second row arrives, a run of ticks for the race and a bell at 6 billion.
Peaks: the clunk at -6 dB, ticks around -14, clicks around -20.
