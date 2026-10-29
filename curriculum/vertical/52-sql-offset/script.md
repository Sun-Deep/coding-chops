# Script

Status: published

No voice; the narration is burned in, 28 words, under three a second.

```text
0.1 s   OFFSET can't jump to row 100,001.
3.1 s   100,000 rows read, / then thrown away.          (payoff)
6.3 s   Then your 100.
8.0 s   WHERE id > 100000 / finds it in the index.
11.2 s  100 rows read. Same page.                         (payoff, 100 in orange)
```

## On screen

```text
headline   OFFSET 100000 still / reads 100,000 rows.
code       one clause a line, the running one lit
           take 1: SELECT id, customer, amount FROM orders / ORDER BY id /
           OFFSET 100000 / LIMIT 100
           take 2: SELECT id, customer, amount FROM orders /
           WHERE id > 100000 / ORDER BY id / LIMIT 100, WHERE in orange
scene      the wall of crates (storyboard.md)
chips      the clause running; rows read, 1,000 a crate as each lid opens,
           to 100,100, then 5.314 ms. Take 2: 100, in orange; 0.024 ms
tags       1,000 orders, ids 1-1,000 on the first crate; page 1,001,
           ids 100,001-100,100 on the page; in take 2, boxes on the row
           sign 96,001 and the page's crate
verdict    OFFSET 100000      100,100 rows · 5.314 ms
           WHERE id > 100000      100 rows · 0.024 ms
           PostgreSQL 15.13 · 1,000,000 orders · median of 51 runs
```
