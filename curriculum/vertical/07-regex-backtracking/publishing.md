# Publishing

The creator understanding check has passed. Ready to upload.

Still outstanding: hearing the cut on a phone at feed size, a third measurement
run an hour after the other two, and verifying the two outage dates in the
pinned comment against their postmortems.

## Files

```text
reel     out/vertical/vr07-regex-backtracking.mp4   1080x1920, 420 frames, 14.06s
cover    out/vertical/vr07-cover.png                1080x1920
cover    out/vertical/vr07-cover-crop-1x1.png       1080x1080, the TikTok grid
cover    out/vertical/vr07-cover-crop-3x4.png       1080x1440, the Instagram grid
```

Only the 9:16 file is uploaded. The crops exist so the profile grids can be
checked before it is, and both come from `scripts/crop-cover.sh`.

## Facebook, Instagram, TikTok caption

```text
^(a+)+$ against 30 a's and one X. Python takes 20 seconds to say no.

Nothing can match, so the engine tries every split of those a's between the two quantifiers before giving up. Each character added doubles it. Measured at 2.0x over 11 points.

Rewritten as ^a+$ it is 0.0002 ms. Go and Rust cannot blow up at all. No backreferences is what that costs.

Code and measurements: github.com/Sun-Deep/coding-chops

#regex #algorithms #python #backend #programming
```

Four hundred and sixty-one characters. The finding closes at sixty-eight, so
the whole surprise clears Facebook's cut before "more".

The lead is the pattern itself rather than the twenty seconds. Seven characters
of regex is something almost every developer can read at a glance and almost
none of them expect to be dangerous, and putting it first means the number
arrives as a consequence of something the reader has already understood. A lead
built on the duration alone would be a stunt.

Python carries the figure rather than Node because twenty seconds is a length
of time a person can feel waiting and four is not. Both are on the frame.

The first draft ran to 527 against the playbook's ceiling of about 450, and it
lost the difference in the mechanism paragraph, which is where it always goes.
That paragraph is the one tempted to re-explain what the reel has just shown.

The catch is the trade the safe engines made, not the speedup. A caption that
stopped at 0.0002 ms would send somebody to rewrite a working pattern in a
language that cannot express it.

Both figures are rounded to the precision the two measurement sessions agree
on. `SCREEN_SAFE` in `measurements.ts` is the only place either may come from.

## YouTube Shorts title

```text
Python takes 20 seconds to fail on 31 characters
```

Forty-eight characters, and the surprise closes at thirty-one, inside the forty
a phone shows. It names Python rather than the pattern because a title has no
room to teach `^(a+)+$` before the number has to land, which is the opposite of
the caption's problem and needs the opposite answer.

## Pinned comment

Verify both outage dates against the linked postmortems before posting. They
are written from memory of the write-ups and the dates are the whole value of
including them.

```text
Conditions: Node 22.14.0 and Python 3.14.6, median of 3 runs, two sessions, n from 20 to 30.

The absolute times moved about 4 percent between the two sessions, so they are on screen as whole seconds. The doubling ratio came out 2.01 and 2.00, which is why that one is quoted to a decimal.

Worth knowing: both patterns are fast on a string that does match, because the engine stops at the first arrangement that works. Only the failing case explodes, so this passes every test written with valid input and fires in production.

The two outages people usually cite: Cloudflare, 2 July 2019, a WAF rule. Stack Overflow, 20 July 2016, a trailing whitespace regex. Neither figure is in the video because they are not my measurements.

In Java or PCRE an atomic group fixes it without rewriting. JavaScript has neither, so the nesting comes out instead.
```

## Checks

- The first 100 characters carry the surprise on their own. Yes, at 68.
- Every number is in `measurements.ts`. Yes, all four through `SCREEN_SAFE`.
- The catch is named. The missing backreferences.
- Five hashtags, none the channel name. Yes.
- Title under 60 with the hook inside 40. Yes, 48 and 31.
- No em dashes, no call to action, no question mark, no backticks. Confirmed.
- The repository line is there. Yes.
