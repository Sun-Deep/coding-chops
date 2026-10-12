# Learning notes

A single queue can block useful work even while a resource farther along
is idle. A dessert-only diner does not need the salad tongs, but the no-pass
rule makes them wait for whoever is using them. Giving each dish its own
queue lets that diner use the dessert tray while salad is busy.

Skipping does not remove contention for the same food. Each dish still has
one serving position. People already at it finish before the next person
starts. A bypassing person can reach a later dish before someone who arrived
earlier and then delay that earlier diner. Lower average time does not imply
that everyone wins.

Head-of-line blocking means the item at the front prevents items behind it
from progressing. The buffet represents queue blocking, not packet mechanics.
HTTP/1.1 pipelined responses have an ordering constraint. HTTP/2 interleaves
independent exchanges but TCP still delivers one ordered byte stream. Loss
can therefore stall multiple HTTP/2 streams. HTTP/3 uses QUIC streams, so a
loss affecting one stream need not stop delivery on another. It can still
have dependencies and shared congestion limits.

The model assumes serving times, dish choices, arrivals, space and walking
speed. It does not simulate collisions in the passing aisle, running out of
food, etiquette, accessibility, trays with multiple serving positions or
movement in both directions. A buffet that forbids passing is a different
policy constraint from a buffet that allows it.
