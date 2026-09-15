# Measurements

```bash
node scripts/measure-pathfinding-race.mjs
SWEEP=1 node scripts/measure-pathfinding-race.mjs
```

## The machine

```text
Apple M5 Pro, macOS 26.5.1, node v22.14.0
```

Nothing here is timed, so the machine does not affect a single figure. It is
recorded because the run should be repeatable, not because the hardware matters.

## The fixture

A 51 by 25 maze carved by recursive backtracker from a pinned generator, seed
21, with 18 percent of the interior walls knocked out afterwards to put loops in
and 22 percent of the open cells turned to mud. 674 cells are open, 148 of them
mud. Start is the top left corner, the exit is the bottom right.

The maze is a fixture and it was chosen from a sweep rather than taken at
random. Most seeds produce a maze where the cheapest route and the shortest
route are nearly the same and there is nothing to see. This one is at the
dramatic end: its step-shortest route costs 2.05 times the cheapest, against a
median of 1.35 across 200 maps. That is disclosed here and the distribution is
in the reel's own notes, because a map picked for being convincing has to come
with the range it was picked from.

## What is counted

A cell is expanded when it comes off the frontier and its neighbours are looked
at. That is the standard unit for comparing searches and it is the one thing all
six do identically. Pushes onto the frontier are not counted.

Ground charges to be entered: open costs 1, mud costs 9. A route's cost is what
it pays to enter every cell after the start.

Counts, not times. An expansion is a property of the algorithm and a millisecond
is a property of the laptop.

## The run

| Search        | Expanded | Steps | In mud | Cost  |
| ------------- | -------- | ----- | ------ | ----- |
| Depth-first   | 586      | 364   | 85     | 1,044 |
| Breadth-first | 658      | 74    | 20     | 234   |
| Dijkstra      | 583      | 98    | 2      | 114   |
| Greedy        | 99       | 78    | 22     | 254   |
| A\*           | 469      | 98    | 2      | 114   |
| Bidirectional | 527      | 98    | 2      | 114   |

The mud column is where the cost is, and it is the figure the reel puts on
screen. 54 clear steps and 20 muddy ones make 234. 96 clear and 2 muddy make 114. The script asserts that arithmetic for all six rather than reporting the
three numbers side by side and trusting them.

Dijkstra, A\* and bidirectional Dijkstra return routes of identical cost, which
is the check that they are all answering the same question. Breadth-first search
returns the fewest steps, which is the question it is actually asking.

## The sweep

200 fresh mazes, one per seed:

```text
breadth-first route cost against cheapest: min 1.00, median 1.35, max 2.28
greedy route cost against cheapest:        min 1.00, median 1.54, max 3.47
A*, bidirectional and Dijkstra agreed on the cheapest route on every map
```

## How it is kept honest

The script asserts all six sets of counts, that every route joins the start to
the exit through cells that touch and none of them walk a wall, and that the
three weighted searches agree with each other. The sweep re-runs those checks
on every one of the 200 maps.

`src/vertical/10-search-race/maze.ts` runs its own copy of the maze and the six
searches and asserts the totals against `measurements.ts` at module load, so a
port that drifted from the script cannot reach a render.

## Three bugs the assertions caught

None of these were visible in the picture and all three would have shipped.

Depth-first search recorded a cell's parent when the cell was pushed onto the
stack rather than when it came off. A cell is pushed once per neighbour that
sees it, so the last writer won and the route it reconstructed did not always
join the start to the exit.

Bidirectional search tracked its meeting point as a cell settled by both halves.
A shortest path crosses between the two halves on an edge, and the two ends of
that edge can be settled on opposite sides without either search ever settling a
cell the other has. Stopping on the cell condition returned 132 against
Dijkstra's 129.

And the one that mattered most: ground charges to be entered, so the graph is
not symmetric. Walking from c to n pays for n and walking back pays for c. The
search running backwards from the exit was charging the forward cost, which made
every distance it computed wrong and returned routes that were close to cheapest
rather than cheapest. It is the kind of error that produces a plausible picture
and a false claim.
