# Measurements

`node --experimental-strip-types scripts/measure-kiosk.mjs`, run twice on
2026-10-10, identical output both times. It imports the reel's own
`simulation.ts`. Seeded: Apple M5 Pro, macOS 26.5.1, Node 22.14.0.

```text
a customer every 40 s on average for 25 minutes; 45 s to order at the till, 1.4x that at a kiosk, 6 kiosks; the kitchen 42 s an order; 8 s to notice a tray and take it

seed 1, the customer the reel follows: #24, whose wait in the till line is closest to the 20-rush average of 4:24; arrives at 17:46
  cashier in line 4:21, ordering 0:28, waiting for food 1:52, door to tray 6:48; order number 125
  kiosks  in line 0:00, ordering 0:40, waiting for food 5:27, door to tray 6:12; order number 126

20 rushes each, customers arriving from 5:00 to 20:00, cashier -> kiosks
defaults                 in line 4:24 -> 0:00; waiting for food 1:31 -> 4:10; door to tray 6:50 -> 5:24 (21% sooner)
kitchen 30 s an order    in line 4:24 -> 0:00; waiting for food 0:44 -> 1:49; door to tray 6:03 -> 3:04 (49% sooner)
kitchen 36 s an order    in line 4:24 -> 0:00; waiting for food 0:59 -> 2:52; door to tray 6:18 -> 4:07 (35% sooner)
kitchen 48 s an order    in line 4:24 -> 0:00; waiting for food 2:28 -> 5:37; door to tray 7:47 -> 6:52 (12% sooner)
kiosk 1x the till        in line 4:24 -> 0:00; waiting for food 1:31 -> 4:09; door to tray 6:50 -> 5:04 (26% sooner)
kiosk 2x the till        in line 4:24 -> 0:01; waiting for food 1:31 -> 4:08; door to tray 6:50 -> 5:53 (14% sooner)
3 kiosks                 in line 4:24 -> 0:13; waiting for food 1:31 -> 3:58; door to tray 6:50 -> 5:25 (21% sooner)
10 kiosks                in line 4:24 -> 0:00; waiting for food 1:31 -> 4:10; door to tray 6:50 -> 5:24 (21% sooner)
35 s at the till         in line 2:04 -> 0:00; waiting for food 2:34 -> 4:10; door to tray 5:22 -> 5:09 (4% sooner)
55 s at the till         in line 7:23 -> 0:00; waiting for food 1:05 -> 4:09; door to tray 9:34 -> 5:39 (41% sooner)
a customer every 35 s    in line 6:20 -> 0:00; waiting for food 1:36 -> 5:25; door to tray 8:50 -> 6:40 (25% sooner)
a customer every 50 s    in line 2:17 -> 0:00; waiting for food 1:24 -> 2:48; door to tray 4:37 -> 4:03 (12% sooner)
```

## What the reel uses

- The followed customer, #24: in line 4:21 then 1:52 waiting for food at
  the till, tray in 6:48; with kiosks no line, 5:27 waiting for food, tray
  in 6:12. Order numbers 125 and 126.
- The board, the trays on the pass, the line and the crowd are read live
  off the same run.

## How the model got here

The first version had customers take their tray the instant it was ready,
so the "Ready" column on the board never showed a number. Real customers
take a few seconds to notice and step up; 8 seconds is now added to both
restaurants, which moves both totals by the same amount.
