# Learning notes

What had to be settled before anything could be drawn.

## The map has to be able to punish a wrong guess

The first generator was cellular automata caves, which is the standard way to
get an organic-looking map. Every setting of it converged on one open cavern:
the shortest route came out at 62 steps against a Manhattan distance of 60, so
nothing was ever forced to detour, and greedy best-first walked a straight line
to the exit in 61 expansions and won outright.

That is not a search cut. If a map cannot punish a wrong guess then every
search is the same search. A maze with loops replaced it.

## The loops are not decoration

A perfect maze has exactly one route between any two cells. Every optimal
search then agrees by construction, the mud has nothing to change, and the
comparison the cut exists to make cannot happen. Knocking out 18 percent of the
interior walls gives real alternatives, which is what lets pricing the ground
produce a different answer from counting steps.

## Ground that charges to be entered is a directed graph

This is the thing that cost the most and it is worth stating plainly. Cost lives
on cells, not on edges, so walking from c to n pays for n and walking from n to c
pays for c. The graph is asymmetric.

Every forward search is unaffected. The search that runs backwards from the exit
is not the forward search with its ends swapped, and charging it the forward
cost makes every distance it computes wrong. It still returns a route, the route
still looks sensible, and it is not the cheapest one. Only the assertion against
Dijkstra caught it.

## On a maze the heuristic barely helps

A\* is the one everybody expects to win, and on open ground it does: the
heuristic pulls the search into a narrow cone at the goal. Walls take that away.
The route has to go where the corridors go, and a cell that looks close to the
exit is not close if the only way there is back the way you came.

So A\* expands 469 cells against Dijkstra's 583, a saving of a fifth rather than
the order of magnitude an open grid would give. That is not a disappointing
result to be buried, it is the most useful thing in the cut for anybody who has
reached for A\* because it is the one with the reputation.

## Greedy is the honest villain

It expands 99 cells, a sixth of what the others do, and it does it by never
looking back. On this maze it gets away with it and arrives, which is why it is
tempting. It arrives by a route costing 254 against 114, the worst of the six
apart from depth-first search.

Across 200 maps its route costs a median 1.54 times the cheapest and as much as
3.47 times. It is the algorithm that is cheap to run and expensive to follow.

## Shortest and cheapest are different questions

Breadth-first search is not wrong. It answers "fewest steps" correctly and
returns 74 of them. It has no way to know that 20 of those steps are through mud
at nine times the price, because nobody told it there was a price.

That is the whole cut, and it is the thing everybody already understands from
route apps without connecting it to an algorithm: the long way round is the
fast way round, and which one you get depends on what the search was counting.
