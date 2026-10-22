# Script

Status: blocked

No voiceover and no music. The narration is burned into the frame.

| Frames  | Line                                                   |
| ------- | ------------------------------------------------------ |
| 4-64    | Postgres starts at FROM.                               |
| 70-164  | WHERE drops unpaid orders. / GROUP BY piles the rest.  |
| 172-242 | HAVING drops small piles. / Only then does SELECT run. |
| 248-314 | ORDER BY sorts. LIMIT keeps 5.                         |
| 322-414 | **So WHERE can't see your alias. / ORDER BY can.**     |

## On screen

```text
headline   SQL doesn't run / top to bottom.
query      the query as written; as each step runs its number lands
           beside its line, ending 5 1 2 3 4 6 7
scene      1,000 orders as glowing table rows on a dark floor, rendered
           in Blender: a scan lights the table, the unpaid rows sink, the
           rest fly into stacks per customer, the small stacks go dark,
           each stack left stands up as one bar as tall as its total,
           the bars sort, all but five fall
chips      STEP n and the clause; the rows or groups out of that step,
           from EXPLAIN ANALYZE
tags       the five customers and their totals
proof      psql's answers: the alias in WHERE, ERROR; in ORDER BY, 1 row
orange     what SELECT makes: its line, its step number, its result rows
```
