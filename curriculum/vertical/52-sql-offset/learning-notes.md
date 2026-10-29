# Learning notes

- `ORDER BY id OFFSET n LIMIT 100` walks the primary key index in order
  and has to step over n rows before it can return any. EXPLAIN ANALYZE
  shows it: the Index Scan under the Limit reads n + 100 rows.
- The cost grows with the page number: 100 rows read for page 1, 10,100
  for page 101, 100,100 for page 1,001, 900,100 for page 9,001.
- Keyset pagination (also called the seek method) asks for rows after the
  last one the client saw: `WHERE id > last_id ORDER BY id LIMIT 100`.
  The index goes straight to last_id, a few page reads down the B-tree,
  and reads 100 rows whatever the page.
- It needs a unique, indexed sort key, and it pages forwards and backwards
  rather than jumping to page 734. That is why OFFSET survives for small
  tables and for "page 3 of 10" interfaces.
