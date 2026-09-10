# Learning notes

## The question the cut answers

You added the index the advice told you to add. Why is the query still reading
the table?

VR01 answered "what does an index do" on a query returning one row. On one row
the answer is clean: three page reads down the tree, then the heap fetch, and
the heap fetch is one page so nobody notices it. The moment a query returns a
hundred thousand rows, that fourth read happens a hundred thousand times, and it
becomes the whole cost.

## Two costs, not one

An index scan is two separate pieces of work.

Finding the matching entries in the index. On the measured run that was 88 page
reads for all 100,366 of them, and it is the part everybody pictures.

Going and getting the rows. The index stores the key and a pointer. It does not
store `amount`, so `sum(amount)` has to open the table for every row it found.

The first cost is what an index removes. The second cost is what a covering
index removes, and it is the larger one by three orders of magnitude.

## Why scatter matters so much

`cust_id` is hashed, so one customer's 100,366 rows are spread across the whole
table. `pg_stats` reports correlation 0.006. Those rows land on close to 100,000
distinct pages out of 123,457, so fetching them is not much cheaper than reading
the table.

`day_id` has the same 100 distinct values and the same rows per value, but the
rows are contiguous. Correlation 1.0. There the plain index reads 1,322 pages,
because 100,000 contiguous rows occupy about 1,235 pages and it reads them in
order.

Same index type, same row counts, same query shape. 69,211 against 1,322. The
only difference is where the rows physically sit, which is why the cut measures
correlation rather than asserting the scatter.

This is the thing to hold on to: a covering index is worth 246 times on the
scattered key and 4.8 times on the contiguous one. The size of the win is a
property of the data, not of the feature.

## What the lossy bitmap adds

The 69,211 is not scatter alone and the cut must not say it is.

Postgres builds a bitmap of matching row locations before touching the heap, so
it can visit pages in physical order instead of randomly. An exact bitmap of
100,366 rows across 123,457 pages does not fit in the default 4 MB `work_mem`,
so it degrades whole pages to page granularity. Those pages are marked `lossy`,
and every row on them has to be rechecked after reading:

```text
Heap Blocks: exact=12126 lossy=11057
Rows Removed by Index Recheck: 872200
```

872,200 rows read and thrown away, on top of the ones that matched. That is
default configuration on a laptop, which is the standard this channel measures
against, but it is a second mechanism sharing the credit for one number. Both
receipts are on shot 1 for that reason.

## What INCLUDE actually stores

`CREATE INDEX ON events (cust_id) INCLUDE (amount)` puts `amount` on the leaf
pages only. It is not a key. It is not in the internal pages, it cannot be
searched, and it does not change the height of the tree.

That is the whole reason the trade works out. The index grows from 66 MB to
215 MB, all of it in the leaves, and the descent costs exactly what it did
before. A bigger index that is not a slower lookup.

If `amount` had been added as a second key column instead, it would sit in the
internal pages too and change the sort order of the index, which changes what
else the index can answer. `INCLUDE` is the version that says "carry this, do
not index it".

## The visibility map, and why this is the interesting part

An index-only scan is not a property of the index.

The index has the answer, but it does not know whether the row it points at is
visible to this transaction. That information lives in the row, in the table.
So Postgres keeps a visibility map: one or two bits per heap page, saying
whether every row on that page is visible to everyone.

When the scan hits an entry, it checks the map. If the page is all-visible, it
uses the index's copy of `amount` and skips the heap. If not, it fetches the row
anyway.

`VACUUM` is what sets those bits. An update clears them.

So the measured collapse is real:

```text
after VACUUM              281 pages     Heap Fetches: 0     4.8 ms
1% updated, no VACUUM  70,103 pages     bitmap heap scan    187 ms
```

Same index, same query, same rows. The plan fell all the way back. Then one
`VACUUM` with no schema change put it at 284 pages.

This is the part that bites in production, because autovacuum runs on its own
schedule. A table taking steady writes can have a covering index that is doing
nothing for most of the day, and nothing in the schema will tell you.

## What was hard to accept

That `Heap Fetches: 0` is a report about the visibility map rather than about
the index. Reading it as "this index avoids the heap" is the natural reading and
it is wrong, and it is the misreading the whole third shot exists to break.
