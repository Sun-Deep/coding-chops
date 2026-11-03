# Harlem to Wall Street

VR59 is a fourteen-second Blender cut, composed at 1080 x 1920 and 30 fps.
New York at night, built from OpenStreetMap: every street a faint line,
every building extruded to its tagged height. A bike delivery from Harlem
(W 125th St) to Wall Street is searched twice on the real street graph,
one-way streets kept. Both searches leave Harlem on one shared clock, so by
any frame each has checked the same number of intersections.

A\* lights its streets orange and reaches Wall Street in a second and a half,
having checked 1,062 intersections. The route is traced back from Wall
Street in white. Dijkstra lights its streets blue and is still a pool around
Harlem; it floods the island, the Bronx, Queens, Brooklyn and New Jersey
before it arrives with the same 13.2 km route, having checked 21,559. The
camera rises as the blue spreads so the whole flood is in view.

It is the first reel built to plan v11's rule: the picture explains the
idea muted, and the only words on screen are the subject itself (the place
names, the two counts, the algorithm names) plus seventeen words of
narration.

## What the numbers are

An intersection is checked when its shortest distance from Harlem is
settled. The counts are for this one ride; a ride that has to detour away
from the customer (Midtown to Williamsburg over the Williamsburg Bridge)
checked 3x fewer, not 20x. The caption says it is one ride.

The street graph has 63,050 intersections, from an extract that reaches
13.8 km from Harlem in every direction. Dijkstra only checks intersections
nearer than the customer by road (13.2 km), so the box cut nothing off. An
earlier, smaller box did: it capped Dijkstra at 14,744, and the script now
refuses to run when that can happen.

## Reproduce

```sh
node scripts/measure-delivery-route.mjs curriculum/vertical/59-manhattan-route/runs/route.json public/vr59/search.json
bash scripts/blender/manhattan/render.sh
npx remotion render src/index.ts VR59-Manhattan-Route out/vertical/vr59-manhattan-route.mp4
npx remotion still src/index.ts VR59-Cover out/vertical/vr59-manhattan-route-cover.png
```

The map extract lives in `third_party/osm-nyc/` (see `third_party/README.md`).
Renders, the search order and the map data stay out of Git. Map data
© OpenStreetMap contributors, ODbL.
