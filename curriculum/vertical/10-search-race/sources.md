# Sources

The algorithms are textbook and the implementations are in the repository, so
the reading below was for the accounting and for the one algorithm that is
genuinely easy to get wrong.

- Cormen, Leiserson, Rivest and Stein, _Introduction to Algorithms_, fourth
  edition. Chapter 20 for breadth-first and depth-first search, chapter 22 for
  Dijkstra.
- Hart, Nilsson and Raphael, "A Formal Basis for the Heuristic Determination of
  Minimum Cost Paths", IEEE Transactions on Systems Science and Cybernetics, 1968. The admissibility condition is why Manhattan distance is a legal
  heuristic here: movement is four-connected and the cheapest possible step
  costs 1, so the estimate never exceeds the true remaining cost.
- Goldberg and Harrelson, "Computing the Shortest Path: A\* Search Meets Graph
  Theory", SODA 2005, and Nicholson, "Finding the Shortest Route Between Two
  Points in a Network", Computer Journal, 1966, for bidirectional search and in
  particular for its stopping rule. Stopping at first contact is the classic
  bug and it returns a route that is nearly shortest.
- Sedgewick and Wayne, _Algorithms_, fourth edition, chapter 4, for the
  convention of counting expansions rather than timing runs.

The maze generator is a recursive backtracker, which is a depth-first search of
the cell lattice. No source needed; it is in `scripts/measure-pathfinding-race.mjs`.
