# Sources

The algorithms are implemented from their definitions rather than copied, and
the numbers come from running them. These are what the definitions and the
failure mode were checked against.

- Cloudflare, how their rate limiter counts, and the weighted approximation they
  use instead of a log.
  https://blog.cloudflare.com/counting-things-a-lot-of-different-things/
- Kong, the three algorithms in its rate limiting plugin and what each stores.
  https://docs.konghq.com/hub/kong-inc/rate-limiting/
- Redis, patterns for a fixed window counter and a sliding window log, including
  the memory note on the log.
  https://redis.io/glossary/rate-limiting/
- Stripe, why they run a token bucket and what the burst allowance is for.
  https://stripe.com/blog/rate-limiters

## What the sources settled

That the fixed window boundary problem is the documented reason Cloudflare moved
to a weighted counter, rather than a corner case somebody made up for a diagram.

That the token bucket's overshoot is deliberate. Stripe describes the burst as
the feature, which is why the cut says the bucket lets 103 through on purpose
and the fixed window lets 200 through by accident.
