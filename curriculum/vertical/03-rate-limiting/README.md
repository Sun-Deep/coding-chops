# Vertical 03: what a rate limit actually limits

Status: approved

Both gates are passed. The understanding check is complete, and the finished
render was watched from beginning to end.

## What it claims

A limit of 100 requests a minute is not a limit of 100 requests a minute if the
counter resets on the clock. The same 200 request attack runs against three
limiters. Fixed window lets all 200 through and rejects nothing.

## Why this topic

Rate limiting was on the untouched list and it fits the shape this page rewards.
The load balancing cut, one burst against five algorithms, did 107K, so a burst
tested against N strategies already works here.

It also varies the format. The database index cut was a mechanism reveal, and a
second one in a row reads as a repeat.

The deciding factor is that the bug is real and common. Fixed window is what
almost everybody writes first, because it is the one you can implement with a
counter and a timestamp, and the failure only shows up under a client that
retries on a clock.

## Scope

It teaches: that fixed window resets on the clock rather than on the client, that
this lets twice the limit through at the boundary, that a sliding window log
fixes it exactly and costs 25 times the memory, and that a token bucket gets
within 3 percent for 64 bytes.

It does not teach: distributed rate limiting and the Redis round trip, sliding
window counter, leaky bucket, concurrency limits, per route against per user
limits, or what to return to the client.

Sliding window counter was the strongest thing left out. It is the weighted
approximation Cloudflare actually runs, it let 102 through in the same test, and
it costs 56 bytes. Four lanes does not fit in thirty seconds. It is the obvious
follow-up.

## Files

- `learning-notes.md`: what had to be understood before drawing anything
- `sources.md`: what the mechanism was checked against
- `understanding-check.md`: the creator comprehension gate
- `measurements.md`: the full run and the machine
- `script.md`: the narration and the on-screen copy
- `storyboard.md`: the shot plan
- `publishing.md`: the caption, the hashtags and the title

## Compositions

```text
VR03-Rate-Limiting   1080x1920, 690 frames, 30 fps  (23s, no title card)
VR03-Cover           1080x1920 still
```

```bash
npm run render:reel-03
node --expose-gc scripts/measure-rate-limiting.mjs
```
