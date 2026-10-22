# Learning notes

## Why holding costs

A lift is one car going round. Holding it at the lobby keeps everyone
inside waiting, adds stops for the people let in, and brings the car back
later for everyone waiting downstairs. The person held for saves a trip;
the cost is spread thinly over many people, and when the doors are held
for anyone in sight, those holds chain.

## When it helps

Someone a step or two away costs a second or two of waiting and saves
themselves a whole round trip, so the morning comes out slightly faster.
Someone fifteen seconds away costs the whole car fifteen seconds, often
more than once in a row.

## Batching

A network connection with a small packet to send can send it now or wait
a moment in case more data comes, and send both together. Waiting fills
the trip and adds delay to what was already ready. Nagle's algorithm makes
that trade; latency-sensitive programs turn it off.
