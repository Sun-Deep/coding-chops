# Understanding check

The creator gate. Answer each without looking at the notes, the plan output or
the composition. Tick only what you can actually do.

- [ ] Explain, without using the word "faster", what changes about the work the
      database does when an index is added.
- [ ] Say what `Rows Removed by Filter: 3333333` means on a plan that launched
      two workers, and why the number on screen is 9,999,999.
- [ ] Draw the descent for ten million rows and say how many page reads it takes
      before the heap fetch.
- [ ] Explain why the tree is three levels deep rather than twenty-four.
- [ ] Say roughly what happens to the number of page reads if the table grows to
      a hundred million rows, and why.
- [ ] Name the two costs of an index and give the measured figure for each.
- [ ] Describe a case where adding the index would not help, and say why the
      planner would ignore it.
- [ ] Explain what an index-only scan is and why it was left out of this cut.
