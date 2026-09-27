# Sources

The claims in the cut were checked by running them, not by reading them. The
script asserts that every maze is a spanning tree, measures every figure on
screen, and checks the binary tree route room by room on 1,000 seeds. The
references below are where the algorithms come from and where to read further.
They were not re-read while building this cut.

- Jamis Buck, _Mazes for Programmers_, Pragmatic Bookshelf, 2015. Covers all
  six generators here, including binary tree's and sidewinder's open edges.
- Jamis Buck, the "Maze Generation" series on weblog.jamisbuck.org, 2010 to 2011. One post per algorithm, with the same names used on screen.
- David Bruce Wilson, "Generating random spanning trees more quickly than the
  cover time", Proceedings of STOC, 1996. The loop-erased random walk and its
  uniformity.
- Joseph Kruskal, "On the shortest spanning subtree of a graph and the
  traveling salesman problem", Proceedings of the AMS, 1956.
- Robert Prim, "Shortest connection networks and some generalizations", Bell
  System Technical Journal, 1957.

Kruskal's and Prim's are minimum spanning tree algorithms. Used as maze
generators they run on random weights, or equivalently a random order, which is
what the script does.
