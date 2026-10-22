# Sources

- git-bisect documentation (git-scm.com/docs/git-bisect): `start`,
  `good`, `bad`, `run`; a test exiting 0 marks the commit good, 1 to 127
  bad except 125, which skips it.
- Binary search: each test halves the commits that could hold the first
  bad one, so n commits need about log2(n) tests; log2(999) is 9.96.
- The run: `scripts/measure-git-bisect.mjs`, git 2.53.0 and node 22.14.0,
  which builds the repository with `git fast-import` and runs everything.
