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
scene      1,000 orders as parcels in a mailroom at eye level, rendered
           in Blender: they pour onto a table, the unpaid ones slide off
           the end, the rest fly into one cubby per customer, shutters
           close on the cubbies under 8, each open cubby's parcels turn
           into a coin stack as tall as its total, the stacks line up on
           the table tallest first, all but five are swept off
chips      STEP n and the clause; the rows or groups out of that step,
           from EXPLAIN ANALYZE
tags       UNPAID at the end of the table during WHERE; the five
           customers and their totals at the foot of their stacks
proof      psql's answers: the alias in WHERE, ERROR; in ORDER BY, 1 row
orange     what SELECT makes: its line, its step number, its result rows
```
