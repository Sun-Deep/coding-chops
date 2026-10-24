# Measurements

`node --experimental-strip-types scripts/measure-last-ticket.mjs`, Apple M5 Pro,
macOS 26.5.1, PostgreSQL 15.13 in a throwaway cluster, 2026-10-23.

The plain-SELECT count depends on real timing near the boundary, so it
moves a little run to run. Five runs gave 327, 336, 329, 338 and 342 races
sold twice out of 1,000; FOR UPDATE sold twice 0 times in every run. A
sixth run, recorded below, gave 331 and the script checked it against the
band.

```text
== versions
PostgreSQL 15.13 (Homebrew) on aarch64-apple-darwin24.4.0, compiled by Apple clang version 17.0.0 (clang-1700.0.13.3), 64-bit

== 1000 races: one seat left, two buyers 200 ms apart at most, 50 ms of payment between the read and the write
buyer session, plain SELECT:
  SELECT pg_sleep_until('<tap time>');
  BEGIN;
  SELECT seats_left > 0 AS ok FROM shows WHERE id = <show> \gset
  \if :ok
    SELECT pg_sleep(0.05);
    UPDATE shows SET seats_left = seats_left - 1 WHERE id = <show>;
    INSERT INTO tickets (show, buyer) VALUES (<show>, '<A|B>');
  \endif
  COMMIT;

== plain SELECT
sold twice: 331
seats_left below zero: 331
no ticket at all: 0

== SELECT ... FOR UPDATE
sold twice: 0
seats_left below zero: 0
no ticket at all: 0

== the race the reel plays: show 2, taps 19 ms apart
largest gap sold twice: 65 ms; smallest gap sold once: 55 ms

== measurements.ts matches this run (plain 331, recorded 327, 336, 329, 338, 342)
```
