# Learning notes

What had to be understood before drawing anything.

## A perfect maze is a spanning tree

Treat each room as a node and each wall between two neighbouring rooms as a
possible edge. A perfect maze has exactly one route between any two rooms: no
loops, nothing sealed off. That is the definition of a spanning tree, and a
spanning tree on N nodes has exactly N - 1 edges.

So on 300 rooms every generator opens exactly 299 walls. It is the fact that
makes the six comparable. None of them does more carving than another, and the
shared clock in the cut is walls knocked down, so all six finish on the same
frame without anything being choreographed.

The grid has 563 walls between rooms: 25 x 11 vertical neighbours plus 12 x 24
horizontal ones. 264 stay up in every maze.

## The six

Depth-first, also called the recursive backtracker. Walk to a random unvisited
neighbour, and when there is none, back up until there is. It runs long before
it has to back up, so it leaves long corridors and few dead ends, 32 on median,
and a route that wanders through a big share of the maze, 128 rooms on median.

Prim's, randomised. Keep a list of rooms touching the maze; pick one at random
and join it to the maze. The maze grows outward from one corner as a blob, and
because every new room joins at a random point on the boundary it leaves many
short dead ends, 104 on median, and a nearly direct route, 38.

Kruskal's, randomised. Put every wall in a random order; knock one down if the
rooms either side are not yet connected. It grows scraps everywhere at once
that merge, which is what the panel shows. Union-find decides "not yet
connected".

Wilson's. Start with one room in the maze. From any room outside it, wander at
random until the walk hits the maze, erase any loop the walk made, and add what
is left. Every possible spanning tree of the grid is equally likely to come out,
which is why it is the unbiased reference. The cost is the wandering: 3,073
steps of walk for 299 walls on this seed.

Binary tree. At every room, open north or east, chosen by a coin. The top row
has no north, so it always opens east, and the right column has no east, so it
always opens north. Both are unbroken corridors on every maze it makes, and the
route from top left to bottom right is always the top row then the right column.
It is also the only one of the six that needs no memory at all: each room is
decided alone.

Sidewinder. Row by row. Carve east and add the room to a run, or close the run
by opening one door north from a random room in it. The top row cannot go north
so it is a single corridor, which gives sidewinder the same open top edge and a
route that never has to go back up. It is less biased than binary tree, because
the door north can be anywhere in the run.

## Why the route is the unit

The route is the one figure the frame can show as a line, and walking it at a
fixed pace turns length into time a viewer can feel. Dead ends are the other
real difference and are left in the notes, for the reason in the README.

Route length is not the same as how hard a maze is to solve for a person. A
short route through a maze with 104 dead ends can still take longer to find.
The cut says "route" and never "hardest".

## Why binary tree is the payoff and not a curiosity

Its bias is visible, structural and absolute. Nothing about seeds or luck is
involved, so "every time" is a claim the script can prove and the frame can
show, by changing the maze under a line that does not move.
