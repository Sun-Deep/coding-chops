# Sources

The mechanism was checked against these rather than against memory. The numbers
were not taken from any of them; those come from the run in `measurements.md`.

- Knuth, _The Art of Computer Programming_, Volume 3, section 5.2.3, on
  selection sorting and why its comparison count is fixed by the length.
- Hoare, "Quicksort", _The Computer Journal_, volume 5 issue 1, 1962, for the
  original partition argument.
- Cormen, Leiserson, Rivest and Stein, _Introduction to Algorithms_, chapter 7,
  for Lomuto partitioning as implemented here, and chapter 2 for the selection
  sort loop bound.
- Sedgewick, "Implementing Quicksort Programs", _Communications of the ACM_,
  volume 21 issue 10, 1978, on why the pivot choice is the whole story.

The write cost argument for constrained media is a datasheet property rather
than a literature one. It was checked against the erase and write endurance
figures published for common NOR flash and EEPROM parts, which is where a write
budget becomes the binding cost rather than a footnote.
