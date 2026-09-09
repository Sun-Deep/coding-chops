# Learning notes

## The question

When a service says 100 requests a minute, what is it actually counting?

## Fixed window

One counter per clock minute. A request arrives, the limiter works out which
minute it is in, resets the counter if that minute changed, and compares.

Cheap. 48 bytes a user, one integer and one window id, and it is the version
almost everybody writes first because it is the version you can write from the
sentence "100 requests a minute" without thinking further.

The bug is that the reset is on the server's clock, not on the client's traffic.
Two full windows share a boundary, and a client that puts 100 requests either
side of it has sent 200 requests inside two seconds without a single rejection.
Measured, not argued: 200 allowed, 0 rejected.

Worth being precise about why this is worse than it sounds. It is not that the
limiter is slightly loose. It is that the limiter's guarantee is wrong by a
factor of two, and the failure only appears under exactly the traffic a retry
loop generates, which is the traffic you built the limiter for.

## Sliding window log

Keep the timestamp of every request. On each new one, drop everything older than
the window and count what is left.

Exact. It let 100 through and rejected 100, which is what the limit says.

It costs 1,208 bytes a user, because the reason it is exact is that it remembers
every request, and 100 timestamps in an array is what remembering costs. At
100,000 users that is 115 MB against 4.6 MB for the fixed window counter.

That is the honest tradeoff and it is the part that usually gets left out. An
article that shows the fixed window bug and then recommends the log has moved
the problem into the memory budget without saying so.

## Token bucket

A bucket of 100 tokens that refills at 100 a minute. Each request takes one. No
tokens, no request.

Two numbers, the token count and when it was last topped up, so 64 bytes. It let
103 through in the same test.

The three extra are not a bug. A full bucket is a deliberate burst allowance,
which is what you want when a client that has been quiet for an hour sends ten
requests at once. Stripe describes the burst as the point of the design.

So the comparison is not "one is right and two are wrong". Fixed window misses by
100 percent and does not know it. Token bucket misses by 3 percent on purpose.

## What was cut

Sliding window counter. Keep this window's count and the previous one, and
weight the previous by how far into the current window you are. 102 through, 56
bytes. It is the practical answer and the one Cloudflare runs, and there is no
room for a fourth lane in thirty seconds.

Also cut: what happens when the limiter runs on more than one server, which
changes all of this and is its own cut.

## What would make this wrong

The fixed window result depends on the client being able to time requests around
the boundary. A client that does not know when the window resets hits it by luck
rather than by design, so the average case is better than 200. The worst case is
still 200, and a limit is a claim about the worst case.
