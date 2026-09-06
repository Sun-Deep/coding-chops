# Publishing copy: PS01

No affiliate slot on this episode, so nothing here carries a disclosure. If one
is ever added, the disclosure goes on line one of the description and this file
follows [the affiliate and sponsor standard](../../../docs/affiliate-and-sponsor-standard.md).

Timestamps are measured from `src/tracks/problem-solving/01-best-time-to-buy-and-sell-stock/Master.tsx`,
not estimated. Re-derive them after any edit that changes a scene length.

## Title

Ship this one.

```text
Best Time to Buy and Sell Stock | LeetCode 121 for Beginners
```

60 characters. The problem name goes first because that is what people type.
The word "LeetCode" matters more than the digits, because the common query is
"best time to buy and sell stock leetcode" rather than "leetcode 121". Once the
word is there the number is nearly free, and it catches the people who do search
by number.

An earlier draft of this file put the hook in the title,
`Best Time to Buy and Sell Stock | 5 Billion Checks or 100,000`. Two problems
with it. It carried neither "LeetCode" nor "121", so it missed the qualifier
most of those searches contain. And the thumbnail already sets
"5 billion checks, or 100,000" at 95px, so the title was repeating the
thumbnail's argument instead of doing its own job.

Alternatives, in the order I would try them if the first one underperforms:

```text
Best Time to Buy and Sell Stock, LeetCode 121, Explained by Drawing It
Best Time to Buy and Sell Stock | LeetCode 121 in One Pass
The LeetCode Problem That Teaches You What to Throw Away
```

The third one is the strongest idea and the weakest title. It wins on curiosity
and loses every search for the problem name, which is where this video's traffic
has to come from at the start. Worth trying once the channel has enough momentum
that search is not the whole story.

## The title formula, so the channel stays consistent

Episode 01 published as `How One Server Runs a Web App | System Design for
Beginners`. That title works because the left side is the thing someone searches
for and the right side says who it is for.

Keep the shape:

```text
<the searched thing> | <the hook, or who it is for>
```

Rules that hold across every episode:

Left side carries the search term, in the words a beginner would use. Not the
clever framing. Not the internal act title.

Right side is the identifier plus the audience, so "LeetCode 121 for Beginners"
or "System Design for Beginners". One concrete number can replace the audience,
but only when the thumbnail is not already carrying that number. Two assets
making the same argument is one wasted asset.

Where a problem has a canonical number, include it. It costs about eight
characters and catches a search the name alone misses. The word "LeetCode"
earns its place before the digits do.

No question marks. No all caps. No brackets announcing the format, so no
"[Explained]" and no "(2026)". The thumbnail already says what it is.

Under 65 characters. If it does not fit, the left side is too long, which
usually means the episode is trying to cover two things.

## Description

```text
LeetCode 121, Best Time to Buy and Sell Stock.

Six stock prices. Buy on one day, sell on a later day, and get the biggest profit you can.

Brute force works. Check every pair, take the best one, done. For six prices that is fifteen checks. For the hundred thousand prices this problem actually allows, it is five billion.

This video builds the fast version by finding the one thing worth remembering, and then throws everything else away. No pattern names, no formulas up front. You watch the same walk twice, once by hand and once as code.

There is one beat where a whole day goes by and nothing updates. That is the beat most explanations cut, and it is the one that makes the algorithm make sense.

Chapters
00:00 What the question actually asks
01:34 Try every pair
02:38 Stop checking every earlier price
03:41 Carry one number
04:15 Walk it once
05:30 The same walk as code
06:31 Two inputs that look special
07:10 What it cost
07:42 The move you keep

Every animation here is code. Each one lands on the frame its word is spoken, so the picture and the sentence never drift apart. The whole repository is open, including the script, the storyboard, the narration timing and the Remotion source:

https://github.com/Sun-Deep/coding-chops

#LeetCode #Algorithms #SoftwareEngineering
```

The GitHub link sits on its own line rather than trailing a sentence, because
a URL buried at the end of a paragraph is one nobody clicks. It stays below the
chapters on purpose. YouTube collapses the description after about three lines,
and those lines are worth more as the hook than as a link. Episode 01 puts its
link near the top only because an affiliate disclosure has to go first.

Three hashtags on YouTube, matching episode 01. Facebook gets five because the
platform actually surfaces them.

## The four part cut

Four parts, split on scene boundaries so no part starts or ends mid sentence.
Every seam is already a match cut, so a part opens on the frame the previous one
closed on.

| Part | Scenes | In master    | Length | What it covers                               |
| ---- | ------ | ------------ | ------ | -------------------------------------------- |
| 01   | 1 to 2 | 0:00 to 2:39 | 2:39   | The question, and the obvious answer         |
| 02   | 3 to 4 | 2:39 to 4:15 | 1:36   | What to throw away, and what to carry        |
| 03   | 5 to 6 | 4:15 to 6:31 | 2:16   | The walk by hand, then the same walk as code |
| 04   | 7 to 9 | 6:31 to 8:26 | 1:55   | Where it breaks, what it cost, what you keep |

Part 01 runs nine seconds over 2:30. The alternative is cutting inside scene 01,
which means cutting mid sentence, because a scene is exactly one narration stem.
Nine seconds is the cheaper price.

Frame ranges into `PS01-Master`, for a straight extract:

```text
part 01   frames 0 to 4765
part 02   frames 4766 to 7650
part 03   frames 7651 to 11730
part 04   frames 11731 to 15188
```

## Facebook captions

Each caption leads with the same idea as its cover, so the two point at one
thing. The cover lines are in `brand/social-prompts.md` and the pairing is:

```text
01   Six prices. Five billion checks.   ->  LeetCode 121. Six prices...
02   Keep one price.                    ->  Four trades, same sell day...
03   Two numbers, one pass.             ->  One pass, six days, two numbers...
04   Wrong answer, no error.            ->  A market that only falls...
```

One per part. Under about 200 characters so nothing collapses behind a
"See more" on mobile.

Part 01

```text
LeetCode 121. Six prices, buy one day, sell a later day, biggest profit wins. Checking every pair works, and for a hundred thousand prices that is five billion checks.

#LeetCode #Algorithms #BigO #CodingInterview #SoftwareEngineering
```

Part 02

```text
Four trades, same sell day, same sell price. Only the buy price differs. So stop keeping every earlier price and keep the cheapest one.

#LeetCode #Algorithms #ProblemSolving #CodingInterview #SoftwareEngineering
```

Part 03

```text
One pass, six days, two numbers, then the same walk as six lines of code. Watch day four, where nothing happens. That is the part most explanations cut.

#LeetCode #Algorithms #TypeScript #CodingInterview #SoftwareEngineering
```

Part 04

```text
A market that only falls needs no special case. Change one line and it returns the wrong answer with no error. Five billion operations, or a hundred thousand.

#LeetCode #BigO #Algorithms #CodingInterview #SoftwareEngineering
```

### If you cut one standalone reel instead

The page's best performing shape is a large search space collapsing. This
episode has exactly one of those, and it is not tied to a part number.

```text
Five billion checks, or a hundred thousand. Same answer. The difference is one number you decide to keep.

Every animation is code: github.com/Sun-Deep/coding-chops

#LeetCode #BigO #Algorithms #ProblemSolving #SoftwareEngineering
```

Written without the `https://`. Facebook auto-links it either way, and on
Instagram and TikTok a caption URL is dead text, so the shorter form is the one
somebody can actually retype.

The link is on this cut and not on parts 01 to 04. This is the one meant to send
people somewhere. The four parts are meant to be watched, and Facebook has never
been generous with reach on posts carrying an external link. If you want it on
the parts too, part 04 is the one to add it to, because anyone who reached the
end of a four part series has already decided they are interested.
