# Sources

Every claim in the cut was checked by running it, in
`scripts/measure-ls-long.sh`, and every column of the line is checked against
`stat`. The references below are where the behaviour is documented. They were
not re-read while building this cut.

- GNU coreutils manual, "ls invocation" and "What information is listed". The
  long format's columns and the six-month rule for dates.
- The Linux kernel documentation, "ext4 Data Structures and Algorithms",
  directory entries and block size.
- `man 2 stat`, for `st_nlink`, `st_size` and `st_mtime`.
