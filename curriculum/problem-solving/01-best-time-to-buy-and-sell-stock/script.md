# Script: Best Time to Buy and Sell Stock

Status: approved

Approved means the understanding check beside this file passes and this is the
text that goes in front of the microphone. It says nothing about timing.

Nothing here has been recorded yet.

Section headings map one to one onto the scene compositions in
`src/tracks/problem-solving/01-best-time-to-buy-and-sell-stock`. The runtimes
are the storyboard's plan. Real timing comes from the recorded stems and the
caption JSON they generate, and those will disagree with these numbers.

The visual plan for every line is in `storyboard.md`, act by act.

1189 words. SD01 measured 148 words per minute over its finished runtime, so
11:45 buys about 1740. This episode is well under that everywhere, which is
worth watching in a read-through.

## Scene01

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

So here's the rule that makes this problem a problem. Buy first, sell after,
always.

Which leaves the actual question.

Pick a day to buy, pick a later day to sell, and find the pair that leaves you
the most profit.

And if every pair loses money, you don't trade at all, and the answer is zero.

So. Six prices. What's the most profit you can make?

## Scene02

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

Check every buy day against every later sell day and you cannot miss the best
trade.

So it works.

Six prices is fifteen pairs. That's nothing.

A hundred prices is about five thousand.

A hundred thousand prices, which is what this problem allows, is five billion.

The answer is right. We're just doing a lot of work to get it.

Look at day five. We asked about it four separate times.

## Scene03

Four trades. Every one of them sells on the same day, for six dollars.

The only thing changing is what you paid.

So compare two of them.

Buy at five, sell at six. You make one.

Buy at one, sell at six. You make five.

Same sell price. Cheaper buy. Bigger profit.

So do you still need the five?

No. And the same reasoning drops seven and three.

For a six-dollar sell, only one earlier price is worth keeping. The cheapest
one.

Now the last day. You're selling at four.

Which earlier price do you want?

One. Still one.

Four minus one is three. Every other earlier price gives you less.

That's the work we kept repeating.

Every day, we checked prices that had already lost to something cheaper.

So maybe we don't need to remember every price behind us.

Maybe we only need the cheapest.

## Scene04

So carry it with you.

Not every old price. Just the cheapest one.

Start again from day one. Cheapest so far is seven.

Day two. One is cheaper than seven, so seven goes.

Cheapest so far is one.

Day three is five. Not cheaper. Nothing changes.

Day four is three. Still not cheaper. Nothing changes.

That's the whole rule. Find something cheaper, replace it. Otherwise leave it
alone.

And now you never look at an old price twice.

## Scene05

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

## Scene06

Here's all of that as code.

Cheapest so far becomes minPrice. Best profit so far becomes maxProfit.

Same two boxes. Shorter names.

minPrice starts at the first price, because on day one it's the only price
you've seen.

maxProfit starts at zero, because you're never forced to trade.

The loop starts at day two and walks right. That's the marker.

This line is the question you asked every day. What would I make if I sold
today, buying at the cheapest so far?

And this line moves the cheapest, but only when today is cheaper.

Then you hand back the best profit you found.

Six lines. You already knew all of them.

One thing worth trying. Delete the line that updates the cheapest price.

Now it never moves off seven, every profit comes out negative, and the answer is
zero.

Wrong answer, no error. Nothing tells you.

## Scene07

Two inputs that look like they need special handling.

Prices that only fall. Seven, six, four, three, one.

The cheapest keeps moving down, and every sale loses money. So best profit never
leaves zero.

Zero is the right answer. You just don't trade.

And one single day. There's no later day to sell on, so the loop never runs.
Zero again.

Neither of those needs a special case. They fall out of starting maxProfit at
zero.

Start it at negative infinity instead and the falling market returns minus one.
A loss you never had to take.

## Scene08

So what did that save us?

Brute force checked every pair. For six prices that's fifteen. For a hundred
thousand it's five billion.

If you want the formula, it's n times n minus one, over two. Which grows like n
squared.

The walk touches each price once. A hundred thousand prices, a hundred thousand
steps.

And it holds two numbers no matter how long the array gets.

Five billion operations, or a hundred thousand. Same answer.

## Scene09

Forget the stock for a second.

What you actually did was decide what to throw away.

At every step you asked one question. If I had to answer right now, what would I
need?

Here it was the cheapest price so far, and the best profit so far. Everything
else went.

Try it somewhere else. Largest number in a list? You need the largest so far.
Nothing else.

Seen this value before? You need the set of what you've seen. Not the order, not
the count.

Same question, different answer. That's the move.
