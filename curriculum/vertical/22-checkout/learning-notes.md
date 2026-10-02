# Learning notes

## The two rules

Shortest line: on arrival a shopper counts the people at each till, the one
being served included, joins the fewest, and stays. Ties go to the leftmost
till. Nobody can see how long a checkout will take.

Shared line: one queue. Its front goes to whichever till frees first, the
leftmost on a tie. Banks, post offices and some supermarkets run this.

## Why separate lines let people pass you

A line only moves as fast as its slowest checkout. When the one ahead of you
hits a price check, your line stops while the other two keep emptying, and
anyone who walks in after you joins a moving line. In seed 1 that happened to
you seven times: a 180 second checkout started at your till seven seconds
before you joined.

## Why one line cannot be overtaken

Everyone leaves the line in the order they joined it. A slow checkout ties up
one till, not a line, and the line keeps feeding the other two. This holds by
construction: the shared shop's overtaking count is 0 in every scenario.

## Why the average barely moves

The tills do the same total work either way, and at 85 percent busy most of
the time nobody is waiting at all. The shared line wins by removing the long
tail: across 200,000 shoppers the 95th percentile wait drops from 230 s to
199 s and the 99th from 368 s to 324 s, while the mean drops 11 percent. For
any one shopper it is close to a coin flip: 34.1 percent waited longer in the
shortest line, 31.6 percent waited less.

## What the frame shows

The first 109 frames are the two rules being read out over both shops already
busy. You walk in at frame 109. The shared shop has you at a till by frame 137. The left counter climbs as each later shopper reaches a till, and you
reach yours at frame 301.
