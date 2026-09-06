# PS01 storyboard: Best Time to Buy and Sell Stock

Status: all nine acts drafted. None recorded, none locked.

The narration in this file is draft copy. It is not the recording script and it
is not approved. It moves to `script.md` once the understanding check passes.
Every timing here is provisional. Real timing comes from the measured narration
and the caption JSON, and the two will disagree with these numbers.

The track's visual contract is `docs/problem-solving-visual-language.md`. This
file plans shots. It does not restate rules that live there.

`script.md` now exists and is the narration authority. The narration blocks
below are copies kept beside their shots for reading convenience. Where the two
disagree, the script wins.

## Conventions

These hold for every act. Anything an act does differently gets written down in
that act's decisions section, with the reason.

Canvas is near-black, per section 25 of the visual contract. Ink is `#E9E4D8`,
warm rather than white, so a stroke reads as pencil on dark paper rather than
chalk on a board.

Four zones: the example, the ledger, the code, the margin. At most two are live
in any frame. The example is the six-day chart, and from 1:05 in Act 1 it holds
one home position for the rest of the episode. Its coordinates never change
again.

The camera pushes in and out. It never travels.

Motion uses the eight semantic presets in section 2 of the visual-language
contract, at the frame counts recorded there. The instructional floor is
`y = 940`, so nothing a viewer needs sits below it.

Cobalt debuts in Act 5 and belongs to the walking token, which is the one
genuinely active path in the episode. No rejected trade, hypothetical trade or
tempting wrong answer is ever drawn in cobalt. A viewer who sees blue should be
able to trust it.

Rejection is a graphite strike. Never red. The audio contract allows a reject
tone for a blocked path, and that carries the feeling the colour would have.

Ink has four roles, listed in section 9 of the visual-language contract:
circle, strike, pointer arrow, title scrawl. Inside the lesson the hand only
comments. It never carries. Every value, equation and sentence is typeset.

Human labels come before variable names. The screen says "cheapest price so
far" long before it says `minPrice`, and the second is a transformation of the
first.

Prediction beats run freeze, ask, hold about two seconds, reveal. Never fill
the hold.

One word per idea. Profit is profit in every act. No cycling through money,
earnings or gain.

## Act 1: what are we even trying to do

Runtime 1:32.

The emotional path is: what am I looking at, that is a trade, that is profit,
order matters, now I know what the question is.

Zones: the example only, plus a one-line rule strip under the chart from 0:40.
Camera: one slow push-in as the chart forms, static after that.

### Narration draft

```text
Six numbers. The price of one share of stock, one for each of six days.

On day one it costs seven dollars. Next day it drops to one.

You buy a share once, and you sell it once.

So say you buy on day one. Seven dollars out of your pocket.

You hold it, you sell on day four, and three dollars comes back.

Which means you put in seven and got back three. You're down four.

Let's try again. Buy on day two, when a share is only a dollar.

And sell here on day five, for six.

So how much did you make?

Five dollars. Sell price minus buy price. That's all profit is.

So you'd think you just find the lowest price, find the highest, and subtract.

Buy at one, sell at seven. Six dollars. Nice.

Except look at when they happen. The seven comes first.

Which means that trade needs a time machine.

So here's the rule that makes this problem a problem. Buy first, sell after, always.

Which leaves the actual question.

Pick a day to buy, pick a later day to sell, and find the pair that leaves you the most profit.

And if every pair loses money, you don't trade at all, and the answer is zero.

So. Six prices. What's the most profit you can make?
```

224 words, which is what 1:32 buys at the 148 words per minute SD01 measured.

### Shots

| Time      | Visual                                                                                                                                                                  | Narration                                                                                         | Purpose                                           |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 0:00-0:06 | Warm paper. `[7, 1, 5, 3, 6, 4]` sets in mono, then each number drops to its height and becomes a dot. A line connects them, axes draw last. Camera pushes in slightly. | "Six numbers. The price of one share of stock, one for each of six days."                         | The array and the chart are the same object.      |
| 0:06-0:11 | Values stay pinned to their dots. Day 1 and day 2 lift in turn.                                                                                                         | "On day one it costs seven dollars. Next day it drops to one."                                    |                                                   |
| 0:11-0:15 | A single coin rests at the left edge, on the day axis. No character.                                                                                                    | "You buy a share once, and you sell it once."                                                     | One action, stated once.                          |
| 0:15-0:20 | Coin rises to the day 1 dot and flips to a share token. `$7` lifts away and fades.                                                                                      | "So say you buy on day one. Seven dollars out of your pocket."                                    | Money out, physically.                            |
| 0:20-0:25 | Share token travels right along the line to day 4, then flips back to a coin. `$3` arrives.                                                                             | "You hold it, you sell on day four, and three dollars comes back."                                | Money in, physically.                             |
| 0:25-0:30 | In the working region, `$3 - $7 = -$4` assembles in mono, one term at a time.                                                                                           | "Which means you put in seven and got back three. You're down four."                              | The subtraction has a reason now.                 |
| 0:30-0:32 | Hold on `-$4`. Low reject tone. Chart dims, then resets.                                                                                                                | Silence.                                                                                          | Let a loss feel like a loss.                      |
| 0:32-0:37 | Coin reappears and rises to day 2. `$1` lifts away.                                                                                                                     | "Let's try again. Buy on day two, when a share is only a dollar."                                 |                                                   |
| 0:37-0:40 | Token travels to day 5. The sell animation begins and stops before the number lands.                                                                                    | "And sell here on day five, for six."                                                             | Set up the prediction.                            |
| 0:40-0:42 | Frozen. Buy price and sell price both visible, no result.                                                                                                               | "So how much did you make?"                                                                       |                                                   |
| 0:42-0:44 | Still frozen. Nothing moves. Bed pinned at `duck`.                                                                                                                      | Silence, 2 seconds.                                                                               | Thinking time. Do not fill it.                    |
| 0:44-0:48 | `$6 - $1 = $5` assembles term by term. Chime on the result, which then slides down into a rule strip reading `profit = sell price - buy price`.                         | "Five dollars. Sell price minus buy price. That's all profit is."                                 | Abstraction only after two concrete cases.        |
| 0:48-0:53 | Chart slides left, out of frame. `[7, 6, 4, 1, 5]` draws as a new chart. `$7` labelled highest, `$1` labelled lowest.                                                   | "So you'd think you just find the lowest price, find the highest, and subtract."                  | Name the wrong idea before killing it.            |
| 0:53-0:57 | Buy marker plants on `$1`, sell marker on `$7`. Both in ink, no accent. `6` lands between them in mono.                                                                 | "Buy at one, sell at seven. Six dollars. Nice."                                                   | Make the mistake attractive without endorsing it. |
| 0:57-1:01 | The day labels under both markers lift. Attention moves off the arithmetic and onto position.                                                                           | "Except look at when they happen. The seven comes first."                                         |                                                   |
| 1:01-1:04 | An arc tries to travel from day 4 back to day 1. It stalls mid-air and stops. One graphite X strikes it out. Buzzer.                                                    | "Which means that trade needs a time machine."                                                    | The constraint, discovered rather than stated.    |
| 1:04-1:10 | Full frame clears. Oversized: `BUY -> SELL`. One arrow, left to right.                                                                                                  | "So here's the rule that makes this problem a problem. Buy first, sell after, always."            | The rule locks.                                   |
| 1:10-1:12 | The `[7, 1, 5, 3, 6, 4]` chart returns to its home position, where it stays for the rest of the episode. The arrow shrinks and parks above it.                          | "Which leaves the actual question."                                                               | Establish the fixed geography.                    |
| 1:12-1:20 | Two markers hover above the chart, `BUY?` and `SELL?`, drifting between candidate days. A profit readout beside them changes with each pairing.                         | "Pick a day to buy, pick a later day to sell, and find the pair that leaves you the most profit." | LeetCode's wording, in objects.                   |
| 1:20-1:26 | Chart swaps briefly to `[7, 6, 4, 3, 1]`, falling the whole way. Markers try several pairs. The readout holds at `$0`.                                                  | "And if every pair loses money, you don't trade at all, and the answer is zero."                  | The zero case, with its reason.                   |
| 1:26-1:30 | Original chart returns. Freeze. Markers park. Below: `MAXIMUM PROFIT = ?`                                                                                               | "So. Six prices. What's the most profit you can make?"                                            | Spoken and on-screen wording match.               |
| 1:30-1:32 | Held frame. Markers wait.                                                                                                                                               | Silence.                                                                                          | The viewer starts before Act 2 does.              |

### Decisions

The word algorithm does not appear in Act 1. Neither does any code, any
variable name, or any complexity notation.

One losing trade comes before the winning one, so the second trade means
something.

Profit gets defined at 0:40, after the viewer has watched profit happen twice.
Not before.

Both equations are mono, assembled term by term, not handwritten. Watching
terms land carries the same sense of reasoning being built, and it keeps them
the same material as the code in Scene06. Handwritten arithmetic is the most
whiteboard thing this episode could do, and one cursive sentence measures 77
strokes against an episode ink budget of about seventy.

The tempting wrong answer at 0:48 is drawn in ink rather than cobalt. Cobalt
means the valid path, and blessing a trade that is about to be struck out would
teach the wrong association on the first blue the viewer ever sees.

"Looks like six dollars" carries a deliberate qualifier. Without it the
narrator states an impossible trade as fact, and a beginner can encode it
before the correction lands four seconds later.

The act ends on the word profit rather than a phrase like "walk away with",
which blurs the gross amount and the gain. Buy at one and sell at six and you
hold six dollars, but your profit is five. That distinction is the whole of
Act 1, so the closing line has to respect it, and the on-screen
`MAXIMUM PROFIT = ?` uses the same word.

The act ends on a question. Act 2 exists to answer it.

### Objects Act 5 inherits

The coin and share token, which become the walking token.

The profit readout introduced at 1:14, which becomes the best-profit box.

The `BUY -> SELL` arrow parked above the chart, which stays for the episode.

The chart's home position, fixed at 1:05.

## Act 2: the obvious solution

Runtime 1:14.

The path is: try one buy day against every later day, move the buy day, repeat,
watch the count grow, then notice the same day being asked about over and over.

Brute force has to feel natural before it feels expensive. The scene never says
it is bad. It says it works, then says what it costs.

Zones: the example, plus a check counter in the working region. Camera: static,
with one pull-back for the scale sequence and a return.

### Narration draft

```text
How would you find the answer without knowing a trick?

Start on day one. You buy at seven.

Now you can sell on day two. Or three. Or four. Any day after it.

So try them all.

Every option loses money. The best you can do buying at seven is lose a dollar.

Move the buy day forward. Now you buy at one.

Try every day after it again.

Sell at five, you make four.

Sell at three, two.

Sell at six, five.

Keep going.

Check every buy day against every later sell day and you cannot miss the best trade.

So it works.

Six prices is fifteen pairs. That's nothing.

A hundred prices is about five thousand.

A hundred thousand prices, which is what this problem allows, is five billion.

The answer is right. We're just doing a lot of work to get it.

Look at day five. We asked about it four separate times.
```

155 words.

### Shots

| Time      | Visual                                                                                                                                                 | Narration                                                                              | Purpose                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 0:00-0:04 | Act 1's final chart, unchanged. `MAXIMUM PROFIT = ?` fades back. No reset, no title card.                                                              | "How would you find the answer without knowing a trick?"                               | Act 1's question becomes Act 2's reason to exist.         |
| 0:04-0:08 | Day 1 `$7` lifts to active. A `BUY` marker stores above it. Everything else rests.                                                                     | "Start on day one. You buy at seven."                                                  | One fixed buy day.                                        |
| 0:08-0:13 | Sell marker slides to day 2, day 3, day 4. The trade path redraws to each, always left to right.                                                       | "Now you can sell on day two. Or three. Or four. Any day after it."                    | The grammar of a valid trade, without restating the rule. |
| 0:13-0:16 | Days 5 and 6 arrive faster. Each profit appears beside its sell point in mono, then fades back.                                                        | "So try them all."                                                                     | Brute force, concretely.                                  |
| 0:16-0:21 | The five results compress into one line: `best from day one, -$1`.                                                                                     | "Every option loses money. The best you can do buying at seven is lose a dollar."      | A finished local search.                                  |
| 0:21-0:26 | Day 1 fades back. `BUY` slides to day 2, which lifts. The check counter appears in the working region reading `5`.                                     | "Move the buy day forward. Now you buy at one."                                        | The outer loop as behaviour, never as syntax.             |
| 0:26-0:30 | Sell marker begins traversing again from day 3.                                                                                                        | "Try every day after it again."                                                        | Repetition starts to show.                                |
| 0:30-0:33 | `$1` to `$5`. `$5 - $1 = $4` assembles term by term in mono. Counter steps to `6` without lifting.                                                     | "Sell at five, you make four."                                                         |                                                           |
| 0:33-0:36 | `$1` to `$3`. `$3 - $1 = $2`. The previous equation fades back rather than leaving. Counter `7`.                                                       | "Sell at three, two."                                                                  |                                                           |
| 0:36-0:39 | `$1` to `$6`. `$6 - $1 = $5`. The `$5` lifts to active. Counter `8`.                                                                                   | "Sell at six, five."                                                                   | The answer appears without the search ending.             |
| 0:39-0:44 | Day 2's fourth check lands and the counter reaches `9`. Remaining pairs then draw fast, `12`, `14`, `15`.                                              | "Keep going."                                                                          |                                                           |
| 0:44-0:49 | All 15 paths present at `faded`, never at full weight together. The `$1` to `$6` pair stays active.                                                    | "Check every buy day against every later sell day and you cannot miss the best trade." | Correctness.                                              |
| 0:49-0:52 | `+$5` stores into an answer label.                                                                                                                     | "So it works."                                                                         | Brute force is valid, and the scene says so out loud.     |
| 0:52-0:56 | The path structure compresses into `6 prices, 15 pairs`.                                                                                               | "Six prices is fifteen pairs. That's nothing."                                         | Turn from correctness to cost.                            |
| 0:56-1:00 | Camera pulls back. The chart morphs to an abstract band of representative marks labelled `100 prices`. Counter rolls to `5,000`.                       | "A hundred prices is about five thousand."                                             |                                                           |
| 1:00-1:05 | The band densifies to `100,000 prices`. `5,000,000,000` cuts in rather than rolling, and holds. The number owns the frame, everything else at `faded`. | "A hundred thousand prices, which is what this problem allows, is five billion."       | Hero moment.                                              |
| 1:05-1:09 | Everything freezes. Numbers fade back. Camera returns to the six-price chart.                                                                          | "The answer is right. We're just doing a lot of work to get it."                       | Correct and expensive are different things.               |
| 1:09-1:14 | Freeze on day 5. The four paths ending there lift from `faded` to active one at a time, from `$7`, `$1`, `$5`, `$3`. Hold.                             | "Look at day five. We asked about it four separate times."                             | Regroup by sell day. Act 3's question, unanswered.        |

### Decisions

The scale numbers come from LeetCode's constraint, not from a number that
sounded good. `1 <= prices.length <= 10^5`, so the ceiling is
`n(n-1)/2 = 4,999,950,000`. An earlier draft said ten thousand prices gives
fifty million, which is correct arithmetic on a figure nobody chose. Five
billion is the real number and it lands harder.

The sweep runs by buy day, and the counter therefore reads 5, 9, 12, 14, 15.
Sweeping by sell day would give the triangular numbers instead. The learning
notes originally argued for the sell-day sweep so Act 3 would continue rather
than change subject. This is better: buying first is how a beginner actually
thinks, and the closing shot regroups the same paths by sell day, so Act 3's
inversion is a second look at work already done rather than a new idea.

Fifteen paths never appear at full weight together. They arrive one, then a few,
then the rest as texture at `faded`. The set is there to show quantity, not to
be read. Section 11 of the production standard rejects the overcrowded frame,
and a spiderweb of arcs is one.

No nested-loop code, no `n(n-1)/2`, no `O(n^2)`, and no `minPrice`. The formula
belongs to Act 8 as optional precision. Nested-loop syntax would hand a beginner
a second problem while they are still learning the first.

The scene says "so it works" before it says anything about cost. A viewer who
leaves thinking brute force is wrong has learned something false. It is correct
and expensive, and those are different words.

The word "works" is reserved for the method, never for a trade. An earlier draft
said "nothing works" about the trades from `$7`, then "so it works" about brute
force thirty seconds later. Same word, two meanings, and nothing in either
sentence tells a beginner which is which. Trades lose money. Methods work.

The counter never jumps ahead of the screen. Day 1 finishes at 5, day 2's four
checks carry it to 9, and three of those are narrated one at a time, so it reads
6, 7, 8 before "Keep going" collects the fourth. The increments stay quiet and
never lift to active, because the equation owns the focus in those beats and a
counter that animates competes with the thing it is counting.

The last scale number cuts in and holds. The step to `5,000` rolls, so the
instinct is to roll `5,000,000,000` as well, and a digit roll at that size is
the arcade treatment section 9 of the visual contract rejects. Letting it appear
and sit is the point. At five billion, counting stops being something you can
watch.

Ink is almost absent here. The chart and the trade paths are already doing the
teaching. At most one pointer arrow. Nothing gets circled, because ink that
appears in every scene stops meaning anything.

The closing line names a count rather than a feeling. An earlier draft ended on
"some of that work feels very familiar", which hedges twice and explains
nothing. Four is the exact number of pairs ending on day 5, and Act 3 opens on
that same freeze.

One "we" appears, in "we're just doing a lot of work to get it". That is the
narrator standing beside the viewer to assess, which is a different job from the
"you" that does the trading. A single deliberate switch, not a drift.

### Objects Act 3 inherits

The freeze on day 5 with four paths converging on it. Act 3 opens on this exact
frame and asks which of the four mattered.

The check counter, which Act 8 picks back up when it puts a number on the cost.

The chart, still in the home position it took at 1:05 of Act 1.

## Act 3: stop checking every earlier price

Runtime 1:20. This is the hinge of the episode.

The path is: four trades share one sell day, only the buy price differs, a
cheaper buy always wins, so every earlier price except the cheapest can go. Then
the same question on a later day, answered faster.

Act 3 finds the insight. It does not build the algorithm. Act 4 turns the
insight into something the code can carry.

Zones: the example only. Camera: static on day 5, one slide right to day 6, one
pull-back at the end.

### Narration draft

```text
Four trades. Every one of them sells on the same day, for six dollars.

The only thing changing is what you paid.

So compare two of them.

Buy at five, sell at six. You make one.

Buy at one, sell at six. You make five.

Same sell price. Cheaper buy. Bigger profit.

So do you still need the five?

No. And the same reasoning drops seven and three.

For a six-dollar sell, only one earlier price is worth keeping. The cheapest one.

Now the last day. You're selling at four.

Which earlier price do you want?

One. Still one.

Four minus one is three. Every other earlier price gives you less.

That's the work we kept repeating.

Every day, we checked prices that had already lost to something cheaper.

So maybe we don't need to remember every price behind us.

Maybe we only need the cheapest.
```

146 words.

### Shots

| Time      | Visual                                                                                                               | Narration                                                                           | Purpose                                               |
| --------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 0:00-0:05 | Act 2's final frame, unchanged. Day 5 `$6` active, four paths ending there.                                          | "Four trades. Every one of them sells on the same day, for six dollars."            | Picks up Act 2's count. No reset.                     |
| 0:05-0:09 | `$6` holds still and stays active. The four earlier prices lift one at a time.                                       | "The only thing changing is what you paid."                                         | Fix one variable, move the other.                     |
| 0:09-0:12 | The `$7` and `$3` paths fade back. `$5` to `$6` and `$1` to `$6` remain.                                             | "So compare two of them."                                                           | Two is arguable. Four is a table.                     |
| 0:12-0:16 | `$6 - $5 = $1` assembles term by term in mono, 3 to 4 frames apart.                                                  | "Buy at five, sell at six. You make one."                                           |                                                       |
| 0:16-0:20 | The first equation fades back. `$6 - $1 = $5` assembles below it. The result lifts.                                  | "Buy at one, sell at six. You make five."                                           |                                                       |
| 0:20-0:24 | The two equations align so the `$6` terms share a column. Only the buy terms differ.                                 | "Same sell price. Cheaper buy. Bigger profit."                                      | The screen proves it. The narration only names it.    |
| 0:24-0:27 | `$5` lifts. `$1` stays active. Nothing else moves.                                                                   | "So do you still need the five?"                                                    |                                                       |
| 0:27-0:29 | Frozen. Both candidates and the fixed `$6` visible. Bed pinned at `duck`.                                            | Silence, 2 seconds.                                                                 |                                                       |
| 0:29-0:34 | Strike on the `$5` path, which drops to `faded` on the follow-through. Then `$7` and `$3` strike faster.             | "No. And the same reasoning drops seven and three."                                 | Reason once, then apply. Not three unexplained marks. |
| 0:34-0:40 | Only `$1` to `$6` is active. `$1` circles in graphite. The struck candidates stay in place at `faded`.               | "For a six-dollar sell, only one earlier price is worth keeping. The cheapest one." | Hero moment. Let disappearance do it.                 |
| 0:40-0:45 | The day marker slides right to day 6. `$4` lifts. Five earlier prices sit at `resting`. The `$6` context fades back. | "Now the last day. You're selling at four."                                         | Forward, never back.                                  |
| 0:45-0:48 | Frozen. Five candidates visible, none named.                                                                         | "Which earlier price do you want?"                                                  |                                                       |
| 0:48-0:50 | Frozen. Bed at `duck`.                                                                                               | Silence, 2 seconds.                                                                 |                                                       |
| 0:50-0:53 | `$1` lifts and circles. The rest fade back.                                                                          | "One. Still one."                                                                   | The rule transferred.                                 |
| 0:53-0:58 | `$4 - $1 = $3` assembles in mono. The four losing candidates stay ghosted at `faded`.                                | "Four minus one is three. Every other earlier price gives you less."                | Reasoning, not recall.                                |
| 0:58-1:02 | Camera pulls back. Act 2's fifteen paths reappear at `faded`.                                                        | "That's the work we kept repeating."                                                | Name what Act 2 was spending.                         |
| 1:02-1:08 | Across the whole chart, the dominated candidates fade out day by day. `$1` stays.                                    | "Every day, we checked prices that had already lost to something cheaper."          |                                                       |
| 1:08-1:14 | The chart returns to its home state. Everything rests. `$1` active.                                                  | "So maybe we don't need to remember every price behind us."                         | Open the memory question.                             |
| 1:14-1:20 | `[7, 1, 5, 3]` begins drifting toward `$1`. Cut before the compression finishes.                                     | "Maybe we only need the cheapest."                                                  | Hand Act 4 an unresolved idea.                        |

### Decisions

The second test uses day 6, not day 4. An earlier draft slid the focus left from
day 5 to day 4, which contradicts the temporal grammar in section 5 of the
visual contract and undoes the twenty seconds Act 1 spent teaching that you
cannot move backwards on this chart. Day 6 also has five earlier candidates
where day 5 had four, which says without narration that the problem gets worse
the further right you go.

Nothing is called useless. Buying at `$5` and selling at `$6` earns a real
dollar. It loses to a better trade, which is a different thing. The phrase is
"worth keeping".

Prediction prompts stay short. "So do you still need the five?" is seven words.
An earlier draft asked "once you know one dollar was available earlier, do you
ever need five as a buying option for this day", which is twenty. A hold works
when the viewer spends it thinking rather than parsing.

Two candidates get compared, not four. Four equations on screen is a table, and
a table is something you read rather than reason about. The other two get struck
once the rule is established.

Strike order carries the argument. `$5` is struck only after the viewer has
answered, then `$7` and `$3` follow faster. Reason once, then apply. Three
simultaneous marks would be three assertions.

Worth knowing while animating: selling at `$6`, buying at `$3` earns three
dollars and buying at `$5` earns one, so `$3` is the better of the two. Both
lose to `$1`, which is all the narration claims. Nothing on screen should imply
a ranking between `$7`, `$5` and `$3`.

The hero moment at 0:34 has no title, no glow and no camera move. Four paths
become one and `$1` gets circled. Disappearance is the effect.

No ledger yet. `cheapest so far` does not become a persistent box in this act.
Act 3 knows the cheapest earlier price matters. Act 4 answers how you would know
it without searching backwards every day, and that is where state appears.

The closing compression does not finish. The four past values start drifting
toward `$1` and the act cuts. Act 4 completes the movement, which is what makes
it read as an answer rather than a new topic.

### Objects Act 4 inherits

The unfinished compression of `[7, 1, 5, 3]` toward `$1`. Act 4 opens by
completing it.

The circled `$1`, which becomes the first value the ledger holds.

The chart in its home position, unmoved since 1:05 of Act 1.

## Act 4: carry one number

Runtime 0:50. The shortest act, and it should feel that way. Its whole message
is that the solution just got smaller.

The path is: finish the compression Act 3 left hanging, then walk forward from
day one and watch one stored number change, twice not change, and settle.

Act 3 found the insight. Act 4 turns it into something the code can hold. The
labels stay in plain English. `minPrice` is Act 6's job.

Zones: the example plus the state slot, which appears here and stays for the
rest of the episode. Camera: static, with one pull-back at the rule.

### Narration draft

```text
So carry it with you.

Not every old price. Just the cheapest one.

Start again from day one. Cheapest so far is seven.

Day two. One is cheaper than seven, so seven goes.

Cheapest so far is one.

Day three is five. Not cheaper. Nothing changes.

Day four is three. Still not cheaper. Nothing changes.

That's the whole rule. Find something cheaper, replace it. Otherwise leave it alone.

And now you never look at an old price twice.
```

78 words.

### Shots

| Time      | Visual                                                                                                                                  | Narration                                                                              | Purpose                                                             |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 0:00-0:04 | Act 3's compression finishes. `[7, 1, 5, 3]` collapses into `$1`, which stores into a slot beside the chart labelled `cheapest so far`. | "So carry it with you."                                                                | Answer Act 3's "maybe" with an instruction.                         |
| 0:04-0:08 | The collapsed values fade out. Chart and state slot remain.                                                                             | "Not every old price. Just the cheapest one."                                          |                                                                     |
| 0:08-0:14 | The chart dissolves to its day 1 state, marker on day 1. No leftward slide. `$7` stores into the slot.                                  | "Start again from day one. Cheapest so far is seven."                                  | A rewind of the derivation, not of time, and the narration says so. |
| 0:14-0:20 | Marker slides right to day 2. `$1` lifts. `$7` in the slot fades back.                                                                  | "Day two. One is cheaper than seven, so seven goes."                                   |                                                                     |
| 0:20-0:24 | `$1` stores into the same slot. No chime.                                                                                               | "Cheapest so far is one."                                                              | The state got more accurate. That is all it did.                    |
| 0:24-0:29 | Marker slides to day 3. `$5` lifts, then returns to resting. The slot does not move. No sound.                                          | "Day three is five. Not cheaper. Nothing changes."                                     |                                                                     |
| 0:29-0:34 | Marker slides to day 4. `$3` lifts, then rests. Slot untouched. No sound.                                                               | "Day four is three. Still not cheaper. Nothing changes."                               | Second non-event, deliberately.                                     |
| 0:34-0:42 | Camera pulls back. Two mono lines appear under the state: `cheaper -> replace`, then `otherwise -> keep`.                               | "That's the whole rule. Find something cheaper, replace it. Otherwise leave it alone." |                                                                     |
| 0:42-0:48 | Act 2's pair structure ghosts in behind at `faded`, then clears, leaving the chart and one stored number.                               | "And now you never look at an old price twice."                                        | Closes the loop Act 2 opened.                                       |
| 0:48-0:50 | Hold. Chart, marker, `cheapest so far` reading `$1`.                                                                                    | Silence.                                                                               | Hand Act 5 a stable state.                                          |

### Decisions

The rewind to day 1 is spoken, not smuggled. Act 3 ends near day 6, so arriving
at day 1 needs a reason or the viewer thinks time ran backwards. "Start again
from day one" costs four words and the chart dissolves rather than sliding left,
which keeps the temporal grammar intact.

The narrator does not agree with themselves. An earlier draft opened on
"Exactly." in answer to Act 3's closing "Maybe we only need the cheapest",
which is the same voice confirming its own hypothesis one second later. The
instruction answers the maybe instead.

"Nothing changes" is said twice, once for day 3 and once for day 4. Act 5's most
important beat is a step where nothing updates, and hearing this phrase twice
here makes that beat familiar rather than surprising when it lands.

There is no prediction hold. Act 1 had one, Act 3 had two, Act 5 is built on
three. An act without one stops the beat becoming mechanical. That puts the
episode at five holds, not six.

There is no ink. Act 3 already circled `$1` and circling it again would say
nothing new. A mark that appears in every scene stops meaning anything.

`$7` is never struck. It was not wrong, it was replaced by better information,
and section 9 of the visual contract reserves the strike for things that are
eliminated.

The state slot holds position while the marker moves. An earlier draft
considered a token travelling beside the pointer. Persistence is the idea, and a
thing that stays put says it better than a thing that chases.

No `best profit` yet. Act 4 answers how you know the best buying price from the
past. How you remember the best profit found so far is Act 5's, and putting a
second box on screen here would answer a question nobody has asked.

The state slot is not a card. No border, no shadow, no rounded panel. The label
is Inter, the value is JetBrains Mono, and it sits on the page like everything
else. Composition rule 9 of the production standard is explicit about not
putting every concept inside a panel.

### Objects Act 5 inherits

The `cheapest so far` slot in its fixed position, holding `$1`. Act 5 puts a
second slot beside it.

The day marker, parked on day 4 and ready to keep walking right.

The chart in its home position, unmoved since 1:05 of Act 1.

## Act 5: the walk

Runtime 2:20. The longest act, and the one the whole episode has been building
toward.

One pass, six days, two slots. Every day asks the same two questions in the same
order: what would I make selling today, and is today cheaper than anything I
have seen. Three prediction holds, and one day where the answer to both is no.

Zones: the example plus both state slots. Camera: static, one push-in at the
end.

### Narration draft

```text
Same walk. This time carry two numbers.

Day one. Seven dollars. It's the only price you've seen, so it's the cheapest.

And you haven't made a trade, so your best profit is nothing. Zero.

Day two. One dollar.

Sell today and you'd lose six. Worse than not trading at all, so zero stays.

But one is cheaper than seven. Cheapest so far is now one.

Day three. Five dollars.

If you sold today, what would you make?

Five minus one. Four.

Four beats zero, so four is your best profit now.

Day four. Three dollars.

Sell today and you make two. Does two beat four?

No. So nothing changes. Best profit is still four. Cheapest is still one.

Watch that. A whole day went by and nothing moved. That's normal.

Day five. Six dollars. Your turn.

Six minus one is five. Five beats four.

Best profit is now five.

Day six. Four dollars. Four minus one is three. Three doesn't beat five.

Nothing changes. And you're out of days.

Five dollars. That's the answer.
```

174 words.

### Shots

| Time      | Visual                                                                                     | Narration                                                                        | Purpose                                                            |
| --------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 0:00-0:05 | Chart in home position, marker back at day 1, `cheapest so far` slot empty.                | "Same walk. This time carry two numbers."                                        |                                                                    |
| 0:05-0:12 | `$7` lifts and stores into `cheapest so far`.                                              | "Day one. Seven dollars. It's the only price you've seen, so it's the cheapest." |                                                                    |
| 0:12-0:18 | A second slot appears beside the first, labelled `best profit so far`. `0` stores into it. | "And you haven't made a trade, so your best profit is nothing. Zero."            | The second box arrives holding zero, matching `let maxProfit = 0`. |
| 0:18-0:23 | Marker slides right to day 2. `$1` lifts.                                                  | "Day two. One dollar."                                                           |                                                                    |
| 0:23-0:31 | `$1 - $7 = -$6` assembles in mono. The best slot does not move.                            | "Sell today and you'd lose six. Worse than not trading at all, so zero stays."   | Act 1's "you don't have to trade" becomes mechanical.              |
| 0:31-0:38 | `$7` fades out of the cheapest slot. `$1` stores into it.                                  | "But one is cheaper than seven. Cheapest so far is now one."                     | Profit first, then the cheapest moves. Always that order.          |
| 0:38-0:43 | Marker slides to day 3. `$5` lifts.                                                        | "Day three. Five dollars."                                                       |                                                                    |
| 0:43-0:47 | Frozen. Both slots visible, no equation yet.                                               | "If you sold today, what would you make?"                                        | Hold one.                                                          |
| 0:47-0:49 | Frozen. Bed pinned at `duck`.                                                              | Silence, 2 seconds.                                                              |                                                                    |
| 0:49-0:54 | `$5 - $1 = $4` assembles in mono.                                                          | "Five minus one. Four."                                                          |                                                                    |
| 0:54-1:00 | `0` fades out of the best slot. `4` stores into it.                                        | "Four beats zero, so four is your best profit now."                              | First update to the second slot.                                   |
| 1:00-1:05 | Marker slides to day 4. `$3` lifts.                                                        | "Day four. Three dollars."                                                       |                                                                    |
| 1:05-1:11 | `$3 - $1 = $2` assembles. Freeze with both slots and the result visible.                   | "Sell today and you make two. Does two beat four?"                               | Hold two.                                                          |
| 1:11-1:13 | Frozen. Bed at `duck`.                                                                     | Silence, 2 seconds.                                                              |                                                                    |
| 1:13-1:21 | The `$2` dissolves. Neither slot moves. No sound.                                          | "No. So nothing changes. Best profit is still four. Cheapest is still one."      |                                                                    |
| 1:21-1:28 | Hold on both unchanged slots. Nothing animates.                                            | "Watch that. A whole day went by and nothing moved. That's normal."              | The most important beat in the act. Do not cut it for pacing.      |
| 1:28-1:34 | Marker slides to day 5. `$6` lifts. Freeze.                                                | "Day five. Six dollars. Your turn."                                              | Hold three, with no question asked.                                |
| 1:34-1:36 | Frozen. Bed at `duck`.                                                                     | Silence, 2 seconds.                                                              |                                                                    |
| 1:36-1:43 | `$6 - $1 = $5` assembles.                                                                  | "Six minus one is five. Five beats four."                                        |                                                                    |
| 1:43-1:48 | `4` fades out of the best slot. `5` stores into it.                                        | "Best profit is now five."                                                       |                                                                    |
| 1:48-1:58 | Marker slides to day 6. `$4` lifts. `$4 - $1 = $3` assembles, then dissolves.              | "Day six. Four dollars. Four minus one is three. Three doesn't beat five."       | Faster. No hold. The viewer predicts silently.                     |
| 1:58-2:05 | Neither slot moves. The marker walks off the right edge of the chart.                      | "Nothing changes. And you're out of days."                                       |                                                                    |
| 2:05-2:14 | Camera pushes in on the best slot. `$5` circles in graphite.                               | "Five dollars. That's the answer."                                               |                                                                    |
| 2:14-2:20 | Hold. Chart, both slots, the circled `5`.                                                  | Silence.                                                                         |                                                                    |

### Decisions

The `best profit so far` slot appears on day 1 holding zero, not on day 3 when
the first real profit arrives. Day 2 computes a loss of six and has to compare
it against something, so the slot has to exist by then. Zero on day 1 also maps
straight onto `let maxProfit = 0`, which Act 6 puts on screen, and it makes
Act 1's "you don't have to trade" into a number the viewer can see.

Every day computes the profit before the cheapest price moves. Day 2 uses `$7`
for the subtraction and only then replaces it with `$1`. The learning notes
prove that swapping these two is harmless, so this is not a trap to teach. It is
simply the order the walk runs in, and Act 6 shows the same two lines in the
same order twenty seconds later.

Day 4 gets the longest hold of any beat in the episode, and it is the beat where
nothing happens. Seven seconds on two unchanged slots. Beginners misread these
algorithms because every video only shows them the frames where something
changes. Act 4 said "nothing changes" twice to make this familiar before it
arrives.

Three prediction holds, all two seconds. The third asks no question at all,
just "your turn", because by then the viewer knows the shape and the question
would be scaffolding they no longer need.

Day 6 has no hold. The viewer answers it silently or not at all, which is the
point of ending the pattern rather than repeating it a fourth time.

Ink appears once, circling the `5` at 2:05. Nothing else in the act is
commented on.

### Objects Act 6 inherits

Both slots in their fixed positions, holding `$1` and `$5`.

The circled `5`, which Act 6's `return` line points at.

The marker's completed path across all six days, which Act 6's `for` line
points at.

## Act 6: the code

Runtime 1:50.

Six lines of TypeScript, each one pointing at something already on screen. The
code is a translation of the walk, not a new solution, so no line introduces a
concept and its syntax at the same moment.

Zones: the code panel bottom-left, the chart and slots shrunk to the upper area
as reference. Camera: static. The code arrives, the page does not move.

```ts
function maxProfit(prices: number[]): number {
  let minPrice = prices[0];
  let maxProfit = 0;

  for (let i = 1; i < prices.length; i++) {
    maxProfit = Math.max(maxProfit, prices[i] - minPrice);
    minPrice = Math.min(minPrice, prices[i]);
  }

  return maxProfit;
}
```

### Narration draft

```text
Here's all of that as code.

Cheapest so far becomes minPrice. Best profit so far becomes maxProfit.

Same two boxes. Shorter names.

minPrice starts at the first price, because on day one it's the only price you've seen.

maxProfit starts at zero, because you're never forced to trade.

The loop starts at day two and walks right. That's the marker.

This line is the question you asked every day. What would I make if I sold today, buying at the cheapest so far?

And this line moves the cheapest, but only when today is cheaper.

Then you hand back the best profit you found.

Six lines. You already knew all of them.

One thing worth trying. Delete the line that updates the cheapest price.

Now it never moves off seven, every profit comes out negative, and the answer is zero.

Wrong answer, no error. Nothing tells you.
```

147 words.

### Shots

| Time      | Visual                                                                                                                                                            | Narration                                                                                                          | Purpose                                            |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| 0:00-0:05 | Chart and both slots shrink to the upper area. Space opens bottom-left.                                                                                           | "Here's all of that as code."                                                                                      |                                                    |
| 0:05-0:14 | The two labels morph. Containers hold position, glyphs cross-fade over 12 frames. `cheapest so far` becomes `minPrice`, `best profit so far` becomes `maxProfit`. | "Cheapest so far becomes minPrice. Best profit so far becomes maxProfit."                                          | The box is the continuity. Only the label changes. |
| 0:14-0:19 | Hold. Both slots now carry mono labels and mono values.                                                                                                           | "Same two boxes. Shorter names."                                                                                   |                                                    |
| 0:19-0:29 | `let minPrice = prices[0];` appears. Ink pointer arrow draws to the `minPrice` slot.                                                                              | "minPrice starts at the first price, because on day one it's the only price you've seen."                          |                                                    |
| 0:29-0:37 | `let maxProfit = 0;` appears. Arrow to the `maxProfit` slot.                                                                                                      | "maxProfit starts at zero, because you're never forced to trade."                                                  |                                                    |
| 0:37-0:46 | The `for` line appears. Arrow to the marker's path across the chart.                                                                                              | "The loop starts at day two and walks right. That's the marker."                                                   |                                                    |
| 0:46-1:00 | The `Math.max` line appears. Arrow to where the equations assembled in Act 5.                                                                                     | "This line is the question you asked every day. What would I make if I sold today, buying at the cheapest so far?" |                                                    |
| 1:00-1:09 | The `Math.min` line appears. Arrow to the `minPrice` slot.                                                                                                        | "And this line moves the cheapest, but only when today is cheaper."                                                |                                                    |
| 1:09-1:16 | `return maxProfit;` appears. Arrow to the circled `5` from Act 5.                                                                                                 | "Then you hand back the best profit you found."                                                                    |                                                    |
| 1:16-1:23 | All six lines at active. Six arrows visible. Hold.                                                                                                                | "Six lines. You already knew all of them."                                                                         |                                                    |
| 1:23-1:31 | Every line fades back except the `Math.min` line, which lifts. A graphite strike crosses it.                                                                      | "One thing worth trying. Delete the line that updates the cheapest price."                                         |                                                    |
| 1:31-1:43 | The walk replays fast with `minPrice` frozen at `7`. Every profit lands negative. The `maxProfit` slot never leaves `0`.                                          | "Now it never moves off seven, every profit comes out negative, and the answer is zero."                           |                                                    |
| 1:43-1:50 | Hold on `0` where `5` should be. Then the strike lifts and the line restores.                                                                                     | "Wrong answer, no error. Nothing tells you."                                                                       |                                                    |

### Decisions

The labels morph, the containers do not move. `cheapest so far` becoming
`minPrice` is a change of name on a box the viewer already trusts. If the box
moved, it would read as a new object.

Every value has been mono since Act 1, so the morph at 0:05 changes only the
label. Nothing on screen changes material between the walk and the code, which
is the point.

The deletion test uses the `Math.min` line and nothing else. Removing it leaves
`minPrice` at `7` forever, every profit comes out negative, and the function
returns `0` instead of `5`. Verified.

Swapping the two update lines is not a bug and is not taught as one. Doing so
computes `max(prices[i] - min(prices[0..i]))` instead of
`max(prices[i] - min(prices[0..i-1]))`, and the only terms that adds are
same-day trades worth exactly zero, which `maxProfit` already holds. Tested
against brute force on 200,000 random arrays with zero mismatches. Earlier
drafts of this episode taught the swap as a trap. It is not one, and a viewer
who tries it will find out.

Six pointer arrows, one per line. That is the entire ink budget for this act.

`minPrice` starts at `prices[0]` rather than `Infinity`. Both work. `Infinity`
asks a beginner to hold an extra abstraction for nothing, and `prices[0]` is
already true on day one.

### Objects Act 7 inherits

The code panel, which Act 7 edits in place rather than reintroducing.

The `maxProfit = 0` line, which is what both edge cases turn out to depend on.

## Act 7: where it breaks

Runtime 0:50.

Two inputs that look like they need special handling and do not, then the one
initialisation mistake that actually breaks it.

Zones: the example and the code panel. Camera: static.

### Narration draft

```text
Two inputs that look like they need special handling.

Prices that only fall. Seven, six, four, three, one.

The cheapest keeps moving down, and every sale loses money. So best profit never leaves zero.

Zero is the right answer. You just don't trade.

And one single day. There's no later day to sell on, so the loop never runs. Zero again.

Neither of those needs a special case. They fall out of starting maxProfit at zero.

Start it at negative infinity instead and the falling market returns minus one. A loss you never had to take.
```

96 words.

### Shots

| Time      | Visual                                                                                                                    | Narration                                                                                                       | Purpose                        |
| --------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| 0:00-0:04 | Chart and code both at `resting`.                                                                                         | "Two inputs that look like they need special handling."                                                         |                                |
| 0:04-0:10 | The chart morphs to `[7, 6, 4, 3, 1]`, falling the whole way.                                                             | "Prices that only fall. Seven, six, four, three, one."                                                          | LeetCode's own second example. |
| 0:10-0:19 | Fast walk. The `minPrice` slot steps 7, 6, 4, 3, 1. The `maxProfit` slot holds `0` throughout.                            | "The cheapest keeps moving down, and every sale loses money. So best profit never leaves zero."                 |                                |
| 0:19-0:25 | Hold on `maxProfit` reading `0`.                                                                                          | "Zero is the right answer. You just don't trade."                                                               |                                |
| 0:25-0:34 | The chart morphs to a single dot, `[5]`. The marker lands and has nowhere to go. `maxProfit` reads `0`.                   | "And one single day. There's no later day to sell on, so the loop never runs. Zero again."                      |                                |
| 0:34-0:41 | Both charts ghost at `faded`. In the code, `= 0` on the `maxProfit` line lifts to active.                                 | "Neither of those needs a special case. They fall out of starting maxProfit at zero."                           |                                |
| 0:41-0:50 | `0` swaps to `-Infinity` in the code. The falling chart replays. `maxProfit` lands on `-1`. A graphite strike crosses it. | "Start it at negative infinity instead and the falling market returns minus one. A loss you never had to take." | The real failure mode.         |

### Decisions

The falling array is `[7, 6, 4, 3, 1]`, which is LeetCode's example 2 rather
than something invented for the video.

Neither edge case gets a special branch, and the act says so out loud. Both fall
out of `maxProfit = 0` and a loop that runs zero times. Pointing at the absence
of a branch teaches more than adding one would.

The failure mode is `maxProfit` starting at `-Infinity`, which returns `-1` on a
falling market. Verified. It is the right failure to show because it is the same
idea Act 1 planted at 1:19, arriving as a bug: nobody is forced to trade, and
code that forgets it will happily report a loss.

Earlier drafts used the update-order swap here. That is not a bug. See Act 6's
decisions and the learning notes.

### Objects Act 8 inherits

The broken state, not the fixed one. Act 7's last line is about the version
that returns minus one, and the take leaves fifteen frames after it, which is
not enough to put the chart, the code and both slots back. Act 7 ends on
`-Infinity`, the falling chart and the struck `-$1`. Act 8 opens on that frame
and clears it during "So what did that save us?", which has five seconds and
nothing else to do.

The code panel and the six-price chart, both returning to their Act 6 state,
by the end of Act 8's first line rather than before it.

## Act 8: what it cost

Runtime 0:50.

Complexity arrives last, as the consequence of the fix rather than the
motivation for it. Act 2 already showed the cost. This puts the notation on it.

Zones: the example plus the counter from Act 2. Camera: one pull-back.

### Narration draft

```text
So what did that save us?

Brute force checked every pair. For six prices that's fifteen. For a hundred thousand it's five billion.

If you want the formula, it's n times n minus one, over two. Which grows like n squared.

The walk touches each price once. A hundred thousand prices, a hundred thousand steps.

And it holds two numbers no matter how long the array gets.

Five billion operations, or a hundred thousand. Same answer.
```

76 words.

### Shots

| Time      | Visual                                                                                       | Narration                                                                                                  | Purpose                                                  |
| --------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 0:00-0:05 | The chart, calm.                                                                             | "So what did that save us?"                                                                                |                                                          |
| 0:05-0:14 | Act 2's check counter returns, reading `15`, then cuts to `5,000,000,000`.                   | "Brute force checked every pair. For six prices that's fifteen. For a hundred thousand it's five billion." | Same counter, same treatment. It cuts, it does not roll. |
| 0:14-0:23 | `n(n - 1) / 2` assembles in mono. `O(n^2)` stores beneath it.                                | "If you want the formula, it's n times n minus one, over two. Which grows like n squared."                 | Optional precision, offered as optional.                 |
| 0:23-0:31 | The six-day walk replays as one sweep. The counter reads `6`, then `100,000`. `O(n)` stores. | "The walk touches each price once. A hundred thousand prices, a hundred thousand steps."                   |                                                          |
| 0:31-0:38 | Both slots lift. `O(1)` stores beside them.                                                  | "And it holds two numbers no matter how long the array gets."                                              |                                                          |
| 0:38-0:45 | `5,000,000,000` and `100,000` sit side by side.                                              | "Five billion operations, or a hundred thousand."                                                          |                                                          |
| 0:45-0:50 | Both resolve to the same `5`.                                                                | "Same answer."                                                                                             |                                                          |

### Decisions

The formula is offered, not taught. "If you want the formula" lets a beginner
skip it without feeling they missed something. It explains where Act 2's numbers
came from, which is all it needs to do.

Both numbers trace to LeetCode's constraint of `10^5` prices. Nothing here is a
figure chosen for effect.

Complexity lands here rather than in Act 2. Act 2's job was to make the
redundancy visible, and the notation would have arrived as a separate idea.
Here it is the consequence of a fix the viewer already understands.

### Objects Act 9 inherits

Everything, briefly, before it all fades. Act 9 opens by clearing the frame.

## Act 9: the move you keep

Runtime 1:00, up from the 0:40 band. See the decisions.

The transferable idea, practised rather than announced, then the outro.

Zones: the margin only. Camera: the widest frame in the episode.

### Narration draft

```text
Forget the stock for a second.

What you actually did was decide what to throw away.

At every step you asked one question. If I had to answer right now, what would I need?

Here it was the cheapest price so far, and the best profit so far. Everything else went.

Try it somewhere else. Largest number in a list? You need the largest so far. Nothing else.

Seen this value before? You need the set of what you've seen. Not the order, not the count.

Same question, different answer. That's the move.
```

93 words.

### Shots

| Time      | Visual                                                                                                  | Narration                                                                                     | Purpose                              |
| --------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------ |
| 0:00-0:05 | Chart, slots and code all fade to `faded`.                                                              | "Forget the stock for a second."                                                              |                                      |
| 0:05-0:11 | The frame keeps clearing.                                                                               | "What you actually did was decide what to throw away."                                        |                                      |
| 0:11-0:20 | The question sets large in Inter, centred: `If I had to answer right now, what would I need?`           | "At every step you asked one question. If I had to answer right now, what would I need?"      |                                      |
| 0:20-0:28 | The two slots lift back to active, holding `$1` and `$5`. Everything else clears.                       | "Here it was the cheapest price so far, and the best profit so far. Everything else went."    |                                      |
| 0:28-0:37 | A second array appears, unlabelled, with one slot beside it.                                            | "Try it somewhere else. Largest number in a list? You need the largest so far. Nothing else." | Practise, not a promise.             |
| 0:37-0:46 | A third array, with a set beside it rather than a number.                                               | "Seen this value before? You need the set of what you've seen. Not the order, not the count." |                                      |
| 0:46-0:52 | All three collapse back into the question.                                                              | "Same question, different answer. That's the move."                                           |                                      |
| 0:52-1:00 | Paper clears. The title scrawl in the creator's own hand, the wordmark, and `Like . Share . Subscribe`. | Silence.                                                                                      | The only handwriting in the episode. |

### Decisions

Act 9 runs 1:00 rather than the 0:40 in section 18 of the visual contract. The
extra twenty seconds buys the two worked examples at 0:28 and 0:37. Without them
the act states a slogan the viewer has seen applied exactly once, which is not
enough to reuse. The episode total moves to 11:45, still under the 12:00
ceiling.

The two examples are practised, not promised. An early draft ended on three
unlabelled chart shapes shown deliberately without explanation, which is a
decorative element whose meaning cannot be stated in one sentence, and
composition rule 10 of the production standard rejects exactly that. Naming what
each one carries forward costs nine seconds each and turns the slogan into a
method.

Kadane's algorithm is not named, and neither is the maximum subarray framing.
The array of day-to-day changes makes 121 and maximum subarray the same problem,
which is why this episode comes before that one. Saying so here would hand a
beginner a reading list instead of a mental model.

The title scrawl at 0:52 is the only handwriting in the episode. Section 9 of
the visual contract reserves it for the outro, and everything else the hand does
is commenting.

## Nothing after this

All nine acts are drafted. Next is the learning gate, then the script, then
recording. Section 19 of the visual contract holds Act 1's narration unlocked
until this point, which it now has passed.

Not written. Each one gets the same treatment: narration draft, shot table,
decisions, and what the next act inherits.

## Settled since this file was written

Runtime. The episode targets 10:30 to 11:30 with a 12:00 ceiling, and Act 1's
band is 1:30. The per-scene bands are in section 18 of the visual-language
contract.

Affiliate slot. None. The scene map is Scene01 through Scene09 with no seam.

Canonical representation. The plotted chart is the house representation for
this episode, with the array as the secondary form for the input, the move into
code, and anything about indices. That decision covers PS01 only.

## Open

Nothing blocking Act 1. Acts 2 to 9 need drafting before Act 1's narration can
lock, because a later act may need Act 1 to plant something first.
