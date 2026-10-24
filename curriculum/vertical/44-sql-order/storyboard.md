# Storyboard

One shot, eye level, in a dark mailroom: a sorting table in front, a
wall of 98 cubbies behind it, one per customer in name order, and a
worker by the end of the table. Every order is a parcel; the paid ones
carry a white label.

FROM: 1,000 parcels pour onto the table into a heap. WHERE: the unpaid
ones, plain and dark, slide off the end of the table and drop out of
sight while the worker bends to them. GROUP BY: the paid ones fly into
their customer's cubby, three to a layer. HAVING: a shutter rolls down
on every cubby holding fewer than 8. SELECT, sum(amount): the parcels in
each open cubby turn into one stack of orange coins, as tall as that
customer's total. ORDER BY: the 29 stacks come out onto the table where
the heap was, in a line, tallest first. LIMIT: all but five are swept
off the back of the table, the worker walks off, and the camera moves
in on the five, each named with its total at its foot, beside psql's
answer to the alias in WHERE and in ORDER BY.

The stacks are coins, not the parcels themselves, because ORDER BY
sorts by the money total, and a pile's height would show how many
orders a customer has, which is a different order.

## Its own look (24 Oct)

The first cut drew the orders as glowing rows on a black floor under a
high tilted camera, stacking and standing up as bars. The creator pointed
out that git bisect, Monty Hall and PHP2Shell end on the same kind of
shot. The mailroom gives each step a physical act a viewer already knows:
a heap, a returns bin, pigeonholes, shutters, coins, a line on the table.

## Built to read without the narration

The query at the top gains a number on each line as that step runs, so
by the end it reads 5, 1, 2, 3, 4, 6, 7 down the side, with SELECT's 5 in
orange.
