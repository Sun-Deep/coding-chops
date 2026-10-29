# Storyboard

Fourteen seconds, 420 frames, one fixed shot at eye level, the camera
easing in a little. One hero object: the page, an orange folder at the
front of the 101st crate. Every beat is a frame in
`src/vertical/52-sql-offset/beats.ts`; when each crate is read is in
`wall.ts`, which the counter reads too.

## The wall

The stockroom of the SQL reel's building, seen the way the SQL reel saw
its mailroom: square on, the whole of the data in frame at once. A wall
of shelves, 12 crates across and 9 rows down, the orders in id order the
way you read a page. Each crate holds 1,000 orders and carries its first
id on its label; each row has a sign at its left with the row's first id.
The signs and the labels are the index. The 101st crate, ids 100,001 to
101,000, sits in the bottom row with the page at its front: its first 100
orders, an orange folder. A belt runs along the foot of the wall. The
same worker stands at the right.

## Take 1: OFFSET 100000

1. **The first crate (2 to 18).** Top left, it slides out, its lid flips
   open on its orders, and it tips onto the belt. A tag: 1,000 orders,
   ids 1 to 1,000. Rows read: 1,000.
2. **The rest of the 100 (16 to 187).** In id order, faster and faster,
   each one out, open, tipped onto the belt and carried off to the left,
   until the top eight rows and the first four crates of the bottom row
   are empty. The OFFSET line is lit; rows read climbs to 100,000. The
   page waits the whole time, tagged in orange.
3. **LIMIT (188 to 235).** The page's crate slides out and opens, the
   folder rises and flies to him. 100,100 rows read, 5.314 ms.

## Take 2: WHERE id > 100000

4. **Wind back (236 to 253).** Every crate flies back to its slot. The
   query swaps, its WHERE line orange.
5. **The index (260 to 281).** An orange box on the bottom row's sign,
   96,001; a line runs along the row to the page's crate, boxed too. No
   crate moves.
6. **LIMIT (282 to 335).** The page's crate slides out and opens, the
   folder flies to him, he punches the air. 100 rows read, 0.024 ms,
   every other crate still in its slot.
7. **Verdict (336 to 420).** Both runs side by side over the full wall.

## Why it looks like this

The first build was six shots down a long aisle: close on the worker,
overhead on a wave, a card cabinet and a tube, a chase. The creator could
not follow it: there was never a frame showing where the page was among
everything before it, and the cabinet and tube had to be learned before
they meant anything. The SQL reel worked because the whole data set was
in one frame and every clause was one act you could watch. So this one
shows the whole wall, the page in it from the first frame, and puts the
clause running and the rows read in chips over the scene.

## Sound

Kenney CC0, one sound per event: a crate sliding out, its lid, its thud on
the belt, each heard for the first three, then thinned as they speed up;
the page's crate, its lid, the page in flight and caught; the wind back;
a tick for each look in the index; the catch; a chime; the verdict.
