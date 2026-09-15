# Sources

The mechanism was checked against documentation rather than recalled. Every
number in the cut is measured locally and recorded in `measurements.md`; these
are what the measurements were interpreted with.

- ECMAScript language specification, pattern semantics, for how a quantifier
  backtracks and in what order alternatives are tried.
  https://tc39.es/ecma262/multipage/text-processing.html#sec-pattern-semantics
- Python `re` documentation, and Friedl's description of the same engine family.
  https://docs.python.org/3/library/re.html
- Go `regexp` package documentation, which states the linear time guarantee and
  the absence of backreferences.
  https://pkg.go.dev/regexp
- RE2 design notes, Russ Cox, "Regular Expression Matching Can Be Simple And
  Fast", for why the automaton simulation cannot blow up and what it gives up.
  https://swtch.com/~rsc/regexp/regexp1.html
- Rust `regex` crate documentation, for the same guarantee and the same
  omissions.
  https://docs.rs/regex/latest/regex/
- OWASP, Regular expression Denial of Service.
  https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS

## For the pinned comment, not for the frame

Two real outages caused by this. Both are someone else's measurement, so
neither goes on screen under the rule in section 9 of the standard. Verify both
before the comment is posted; they are written here from the postmortems and
the dates matter.

- Cloudflare, 2 July 2019. A regex in a WAF rule caused CPU exhaustion across
  the global network.
  https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/
- Stack Overflow, 20 July 2016. A trailing-whitespace regex in post rendering.
  https://stackstatus.tumblr.com/post/147710624694/outage-postmortem-july-20-2016

## What the sources settled

That "catastrophic backtracking" is specifically about the rejecting case. Every
description of the bug that starts from a matching string gets the mechanism
wrong, because a match terminates the search on the first arrangement that
works.

That the linear-time guarantee and the missing features are one decision rather
than two. Cox's article is explicit that backreferences are what make the
problem NP-hard, and that a machine which cannot express them is the machine
that can promise linear time. The cut's last line rests on this.
