# Measurements

`node --experimental-strip-types scripts/measure-gym.mjs`, run twice on
2026-10-13, identical output both times. It imports the reel's own
`simulation.ts`. Seeded: Apple M5 Pro, macOS 26.5.1, Node 22.14.0.

```text
a lifter wanting the bench every 600 s on average for 90 minutes; 3 to 5 sets of 40 s (25% either way), 120 s rest between sets (40% either way), 30 s to change plates when a different lifter takes the bar (40% either way), 2 lifters taking turns when sharing; 10 s from the door

seed 1, 9 lifters. The lifter the reel follows: #4, whose wait for the bench is closest to the 100-evening average of 12:44; walks in at 24:47 (1487.3 s)
  keep  wait for the bench 11:42, walk in to last set done 17:13; on the bench at 2189.3 s, done at 2519.9 s
  share wait for the bench 2:03, walk in to last set done 9:29; on the bench at 1610.4 s, done at 2056.3 s

seed 1, every lifter: walks in, wait keep -> share, done keep -> share
  #0   2:17  3 sets  wait  0:10 ->  0:10  done  6:22 ->  6:22
  #1  10:48  4 sets  wait  0:10 ->  0:10  done  9:25 -> 12:24
  #2  14:26  5 sets  wait  5:48 ->  0:10  done 15:58 -> 12:25
  #3  20:24  3 sets  wait  9:59 ->  3:55  done 16:05 -> 11:45
  #4  24:47  3 sets  wait 11:42 ->  2:03  done 17:13 ->  9:29
  #5  28:05  3 sets  wait 13:55 ->  4:04  done 20:59 -> 11:48
  #6  32:27  4 sets  wait 16:37 ->  1:49  done 25:30 -> 11:46
  #7  77:29  4 sets  wait  0:10 ->  0:10  done  9:35 ->  9:35
  #8  89:10  5 sets  wait  0:10 ->  0:10  done 11:17 -> 11:17

100 evenings each, lifters walking in from 10:00 to 80:00, keep -> share
defaults                   wait 12:44 ->  2:43; done 22:00 -> 13:30; 15.1% finish later under sharing, by 1:36 on average (715 lifters)
a lifter every 480 s       wait 19:40 ->  4:40; done 28:54 -> 15:38;  9.9% finish later under sharing, by 1:42 on average (897 lifters)
a lifter every 720 s       wait  8:47 ->  1:55; done 18:01 -> 12:31; 17.4% finish later under sharing, by 1:43 on average (592 lifters)
a lifter every 900 s       wait  5:37 ->  1:12; done 14:45 -> 11:30; 21.8% finish later under sharing, by 1:31 on average (482 lifters)
60 s rests                 wait  4:17 ->  1:28; done 10:30 ->  9:06; 24.9% finish later under sharing, by 1:40 on average (715 lifters)
90 s rests                 wait  7:48 ->  1:57; done 15:33 -> 11:10; 18.2% finish later under sharing, by 1:42 on average (715 lifters)
180 s rests                wait 24:49 ->  5:08; done 37:07 -> 19:02;  9.9% finish later under sharing, by 1:39 on average (715 lifters)
0 s plate change           wait 11:01 ->  1:25; done 19:47 -> 10:22;  7.0% finish later under sharing, by 0:30 on average (715 lifters)
15 s plate change          wait 11:52 ->  1:57; done 20:53 -> 11:46; 14.0% finish later under sharing, by 0:54 on average (715 lifters)
60 s plate change          wait 14:31 ->  5:05; done 24:17 -> 18:03; 18.6% finish later under sharing, by 2:53 on average (715 lifters)
90 s plate change          wait 16:24 ->  9:18; done 26:39 -> 24:46; 35.7% finish later under sharing, by 3:50 on average (715 lifters)
120 s plate change         wait 18:18 -> 15:06; done 29:03 -> 33:19; 76.5% finish later under sharing, by 6:10 on average (715 lifters)
30 s sets                  wait 10:23 ->  2:09; done 18:59 -> 12:06; 17.5% finish later under sharing, by 1:25 on average (715 lifters)
60 s sets                  wait 17:48 ->  4:14; done 28:25 -> 16:42; 12.6% finish later under sharing, by 1:42 on average (715 lifters)
3 lifters taking turns     wait 12:44 ->  1:05; done 22:00 -> 12:24; 15.5% finish later under sharing, by 1:59 on average (715 lifters)
```

## What the reel uses

- The followed lifter, #4 in seed 1: the bench after 11:42 above and 2:03
  below, from walking in. These are the "your turn at" readouts at the
  payoff, and "2 minutes, not 12" in the narration. `runs.ts` throws on
  load if the model disagrees with `src/vertical/35-gym/measurements.ts`.
- The live clocks above each gym are the model's time since you walked in.
- The cover: 13 minutes and 3, the 100-evening averages of 12:44 and 2:43,
  rounded to whole minutes.
- The caption: 12:44, 2:43, 15% (15.1%) and 1:36.
