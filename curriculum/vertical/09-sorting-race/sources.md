# Sources

The algorithms are textbook and the implementations are in the repository, so
the reading below was for the accounting rather than for the mechanisms.

- Knuth, _The Art of Computer Programming_, Volume 3, Sorting and Searching,
  second edition. Section 5.2 for the quadratic sorts and 5.2.3 for heap sort.
  The comparison and move counts there are what the instrumentation was checked
  against in shape, not in value, since those counts are for a different array.
- Cormen, Leiserson, Rivest and Stein, _Introduction to Algorithms_, fourth
  edition. Chapter 2 for insertion and merge sort, chapter 6 for heap sort,
  chapter 7 for Lomuto partitioning.
- Sedgewick and Wayne, _Algorithms_, fourth edition, chapter 2, for the
  convention of counting compares and array accesses separately, which is where
  the split in `measurements.md` comes from.

The one judgement call not settled by any of them is whether merge sort's
auxiliary writes count. They are counted here. The reasoning is in
`learning-notes.md`.
