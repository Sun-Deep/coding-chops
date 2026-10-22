# Measurements

Output of `node --experimental-strip-types scripts/measure-rain-run.mjs`,
run twice on 2026-10-19 with identical output.

```text
20 mm/h of 2 mm drops falling at 6.54 m/s, 203 drops in each cubic metre of air. 14 m of open sky between the awning and the shelter. You are a 1.7 x 0.45 x 0.25 m box, walking at 1.4 m/s or running at 5 m/s.

Defaults, by the formula
defaults               walk 10.2 s: 3,665 (front 2,172, top 1,492). run 2.9 s: 2,590 (front 2,172, top 418). running: 29% fewer, top 3.6x fewer

Defaults, 1,000 showers counted drop by drop (seeds 1 to 1000)
walk                   mean 3664.1 (front 2170.7, top 1493.4)
run                    mean 2589.7 (front 2172.6, top 417.1)

Rain, mm/h
5 mm/h                 walk 10.2 s: 916 (front 543, top 373). run 2.9 s: 648 (front 543, top 104). running: 29% fewer, top 3.6x fewer
10 mm/h                walk 10.2 s: 1,832 (front 1,086, top 746). run 2.9 s: 1,295 (front 1,086, top 209). running: 29% fewer, top 3.6x fewer
50 mm/h                walk 10.2 s: 9,161 (front 5,431, top 3,730). run 2.9 s: 6,476 (front 5,431, top 1,044). running: 29% fewer, top 3.6x fewer

Drop size, mm
1 mm                   walk 10.2 s: 40,692 (front 28,756, top 11,937). run 2.9 s: 32,098 (front 28,756, top 3,342). running: 21% fewer, top 3.6x fewer
1.5 mm                 walk 10.2 s: 9,769 (front 6,232, top 3,537). run 2.9 s: 7,222 (front 6,232, top 990). running: 26% fewer, top 3.6x fewer
3 mm                   walk 10.2 s: 965 (front 523, top 442). run 2.9 s: 647 (front 523, top 124). running: 33% fewer, top 3.6x fewer
4 mm                   walk 10.2 s: 388 (front 201, top 187). run 2.9 s: 254 (front 201, top 52). running: 35% fewer, top 3.6x fewer

Distance to shelter, m
5 m                    walk 3.8 s: 1,309 (front 776, top 533). run 1.1 s: 925 (front 776, top 149). running: 29% fewer, top 3.6x fewer
30 m                   walk 21.6 s: 7,853 (front 4,655, top 3,198). run 6.0 s: 5,551 (front 4,655, top 895). running: 29% fewer, top 3.6x fewer
100 m                  walk 71.6 s: 26,175 (front 15,518, top 10,658). run 20.1 s: 18,502 (front 15,518, top 2,984). running: 29% fewer, top 3.6x fewer

Walking speed, m/s
1 m/s                  walk 14.3 s: 4,261 (front 2,172, top 2,089). run 2.9 s: 2,590 (front 2,172, top 418). running: 39% fewer, top 5.0x fewer
1.8 m/s                walk 7.9 s: 3,333 (front 2,172, top 1,161). run 2.9 s: 2,590 (front 2,172, top 418). running: 22% fewer, top 2.8x fewer

Running speed, m/s
3 m/s                  walk 10.2 s: 3,665 (front 2,172, top 1,492). run 4.8 s: 2,869 (front 2,172, top 696). running: 22% fewer, top 2.1x fewer
4 m/s                  walk 10.2 s: 3,665 (front 2,172, top 1,492). run 3.6 s: 2,695 (front 2,172, top 522). running: 26% fewer, top 2.9x fewer
6 m/s                  walk 10.2 s: 3,665 (front 2,172, top 1,492). run 2.4 s: 2,521 (front 2,172, top 348). running: 31% fewer, top 4.3x fewer
7 m/s                  walk 10.2 s: 3,665 (front 2,172, top 1,492). run 2.0 s: 2,471 (front 2,172, top 298). running: 33% fewer, top 5.0x fewer

Body, height x width x depth, m
1.55 x 0.40 x 0.22     walk 10.2 s: 2,928 (front 1,761, top 1,167). run 2.8 s: 2,088 (front 1,761, top 327). running: 29% fewer, top 3.6x fewer
1.85 x 0.50 x 0.30     walk 10.2 s: 4,616 (front 2,627, top 1,990). run 2.9 s: 3,184 (front 2,627, top 557). running: 31% fewer, top 3.6x fewer
1.70 x 0.45 x 0.40     walk 10.3 s: 4,560 (front 2,172, top 2,387). run 2.9 s: 2,841 (front 2,172, top 668). running: 38% fewer, top 3.6x fewer

Wind along the street, m/s, positive from behind (formula only)
-3 m/s                 walk 10.2 s: 8,320 (front 6,828, top 1,492). run 2.9 s: 3,894 (front 3,476, top 418). running: 53% fewer, top 3.6x fewer
-1.5 m/s               walk 10.2 s: 5,992 (front 4,500, top 1,492). run 2.9 s: 3,242 (front 2,824, top 418). running: 46% fewer, top 3.6x fewer
1.5 m/s                walk 10.2 s: 1,647 (front 155, top 1,492). run 2.9 s: 1,939 (front 1,521, top 418). running: -18% fewer, top 3.6x fewer
3 m/s                  walk 10.2 s: 3,975 (front 2,483, top 1,492). run 2.9 s: 1,287 (front 869, top 418). running: 68% fewer, top 3.6x fewer
```
