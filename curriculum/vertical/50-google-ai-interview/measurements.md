# Measurements

`node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs scripts/measure-google-interview.mjs`,
Node 22.14, 25 October 2026. Exact and deterministic.

```text
original  search([1,3,5], 5) -> -1   search([1,3,5], 1) -> -1   wrong 2509 of 12156
suggested search([1,3,5], 5) -> 2    search([1,3,5], 1) -> -1   wrong 2004 of 12156
fixed     search([1,3,5], 5) -> 2    search([1,3,5], 1) -> 0    wrong 0 of 12156
```

The cases are every target from -1 to 10 in every sorted array of distinct
values 0 to 9, up to length 8. Each version is compiled from the exact lines
the reel shows.
