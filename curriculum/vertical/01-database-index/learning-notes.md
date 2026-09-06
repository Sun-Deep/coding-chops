# Learning notes

## The question the cut answers

When you add an index, what actually changes about the work the database does?

The usual answer is "it makes the query faster", which is a result rather than a
mechanism, and it does not tell anybody when an index will not help or what it
costs. The mechanism is that the number of rows the database has to consider
drops by the fanout of one page on every page read.

## Sequential scan

With no index on the column, the only way to answer `WHERE user_id = 8675309`
is to look at every row. Postgres reads the heap page by page, applies the
filter, and throws away everything that does not match.

The plan says so in as many words:

```text
Rows Removed by Filter: 3333333
```

Three workers, so 9,999,999 rows examined and discarded to return one. That
number is the whole cut. It is not a slow query because the machine is slow, it
is a slow query because it is doing ten million pieces of work to answer a
question about one row.

The trap in reading this plan: `Rows Removed by Filter` is per worker and
`Buffers` is not. Getting that backwards puts either 3,333,333 or 191,085 on
screen, and both are wrong.

## B-tree

A b-tree index is a sorted structure whose pages each hold many keys. Every page
read picks one child out of that page's entries, so the set of rows still
possible divides by the page's fanout.

At ten million rows the measured tree is three levels:

```text
                            entries   still possible
                                        10,000,000
root page                        97       103,093
internal page                   285           362
leaf page                       367             1
heap fetch                                      1 row
```

Three page reads to find where the row is, one more to go and get it.

That is the number that makes the whole thing intuitive: the tree is shallow
because the pages are wide. A binary tree over ten million rows would be 24
levels deep. Eight-kilobyte pages holding a few hundred keys each get it to
three.

The fanout is why the answer to "how much slower does this get as the table
grows" is "barely". Going from ten million rows to a hundred million adds one
level, so four page reads instead of three.

## What it costs

Two things, and neither is optional.

Space. The index is 214 MB on a 498 MB table, a 43 percent addition, because it
holds a copy of every value in the column plus a pointer.

Writes. Every insert, update to the indexed column, and delete has to maintain
the tree. Measured: 500,000 inserts take 1.7 seconds with no index, 2.5 with
one, 5.1 with three.

That is the part that gets left out of index advice, and it is why the cut ends
on it. A table with an index on every column somebody once needed is a table
whose writes are three times slower than they have to be.

## What was cut

Index-only scans. When every column the query wants is in the index, Postgres
can answer without touching the heap at all, which removes the fourth read.
Genuinely surprising and a better payoff than the two-lane comparison, and it
does not fit in thirty seconds alongside the descent. It is the follow-up.

Also cut: composite index column order, partial indexes, when the planner
decides a sequential scan is cheaper anyway, and every non-btree index type.
Each of those is its own cut.

## What would make this wrong

If the table were small enough to fit in a few pages, the planner would ignore
the index and be right to. If the query matched a large fraction of the table,
the same. The cut says ten million rows and one matching row on screen, which
are the conditions where the claim holds, rather than claiming indexes are
always faster.
