# Measurements

`node --experimental-strip-types scripts/measure-elevator-door.mjs`, run twice on
2026-10-16, identical output both times. It imports the reel's own
`simulation.ts`. Seeded: Apple M5 Pro, macOS 26.5.1, Node 22.14.0.

```text
One lift, 10 floors, 4 people a minute, 2 s a floor, 8 s a stop, 1 s to step in, doors close 3 s after the last person in, 12 people at most. Hold: for anyone up to 15 s away. 100 mornings; people arriving from 300 s to 3300 s counted.

Defaults
defaults           door to floor 72.6 s let close, 79.7 s held (+9.8%); held for 23.4% of people, 17.1 s sooner; everyone else 14.5 s later, 60.0% of them later; first one into a held car 47.5 s later

Followed: person #181 of seed 1, the first one into a held car whose extra time is closest to the average for first ones in; reaches the doors at 3022.5 s, floor 9. Door to floor: 149.1 s let close, 197.8 s held (48.7 s later). Out at 52:52 and 53:40.
  close:
    trip 47: open 2997.3 would shut 3009.6 shut 3009.6 back 3093.6; #171>4@2956.2 #172>7@2967.8 #173>5@2983.2 #174>3@2987.0 #175>1@2991.8 #176>7@2995.8 #177>1@2998.3 #178>5@3001.0 #179>9@3005.6; stops 1@3011.6 3@3023.6 4@3033.6 5@3043.6 7@3055.6 9@3067.6
    trip 48: open 3093.6 would shut 3105.6 shut 3105.6 back 3201.6; #180>4@3021.2 #181>9@3022.5 #182>5@3022.5 #183>2@3034.1 #184>8@3066.6 #185>9@3084.1 #186>7@3093.7 #187>10@3099.6 #188>9@3099.8; stops 2@3109.6 4@3121.6 5@3131.6 7@3143.6 8@3153.6 9@3163.6 10@3173.6
    trip 49: open 3201.6 would shut 3214.6 shut 3214.6 back 3286.6; #189>10@3130.9 #190>10@3148.3 #191>2@3152.2 #192>3@3153.3 #193>1@3161.5 #194>1@3181.8 #195>1@3186.2 #196>2@3205.0 #197>3@3210.6; stops 1@3216.6 2@3226.6 3@3236.6 10@3258.6
  hold:
    trip 33: open 2942.1 would shut 2947.1 shut 3022.2 back 3114.2; #169>5@2909.2 #170>8@2935.6 #171*>4@2956.2 #172*>7@2967.8 #173*>5@2983.2 #174>3@2987.0 #175*>1@2991.8 #176*>7@2995.8 #177>1@2998.3 #178>5@3001.0 #179*>9@3005.6 #180*>4@3021.2; stops 1@3024.2 3@3036.2 4@3046.2 5@3056.2 7@3068.2 8@3078.2 9@3088.2
    trip 34: open 3114.2 would shut 3125.2 shut 3154.3 back 3250.3; #181>9@3022.5 #182>5@3022.5 #183>2@3034.1 #184>8@3066.6 #185>9@3084.1 #186>7@3093.7 #187>10@3099.6 #188>9@3099.8 #189*>10@3130.9 #190*>10@3148.3 #191>2@3152.2 #192>3@3153.3; stops 2@3158.3 3@3168.3 5@3180.3 7@3192.3 8@3202.3 9@3212.3 10@3222.3
    trip 35: open 3250.3 would shut 3259.3 shut 3259.3 back 3323.3; #193>1@3161.5 #194>1@3181.8 #195>1@3186.2 #196>2@3205.0 #197>3@3210.6 #198>8@3238.6; stops 1@3261.3 2@3271.3 3@3281.3 8@3299.3
  (* got in only because the doors were held)

How far away people can be and still be held for
up to 2 s          door to floor 72.6 s let close, 71.6 s held (-1.4%); held for 2.7% of people, 43.1 s sooner; everyone else 0.2 s later, 35.8% of them later; first one into a held car 18.3 s later
up to 5 s          door to floor 72.6 s let close, 71.1 s held (-2.0%); held for 7.8% of people, 34.6 s sooner; everyone else 1.3 s later, 42.8% of them later; first one into a held car 24.5 s later
up to 10 s         door to floor 72.6 s let close, 73.4 s held (+1.2%); held for 15.3% of people, 27.3 s sooner; everyone else 5.9 s later, 50.5% of them later; first one into a held car 34.4 s later
up to 15 s         door to floor 72.6 s let close, 79.7 s held (+9.8%); held for 23.4% of people, 17.1 s sooner; everyone else 14.5 s later, 60.0% of them later; first one into a held car 47.5 s later
up to 20 s         door to floor 72.6 s let close, 87.9 s held (+21.1%); held for 29.8% of people, 8.2 s sooner; everyone else 25.3 s later, 67.6% of them later; first one into a held car 63.7 s later
up to 30 s         door to floor 72.6 s let close, 103.4 s held (+42.5%); held for 34.8% of people, -6.0 s sooner; everyone else 44.1 s later, 75.8% of them later; first one into a held car 94.8 s later

People a minute
2 a minute         door to floor 46.3 s let close, 47.2 s held (+2.1%); held for 28.3% of people, 13.7 s sooner; everyone else 6.7 s later, 45.0% of them later; first one into a held car 24.0 s later
3 a minute         door to floor 59.6 s let close, 63.6 s held (+6.7%); held for 27.1% of people, 13.7 s sooner; everyone else 10.6 s later, 54.4% of them later; first one into a held car 33.9 s later
5 a minute         door to floor 86.9 s let close, 92.7 s held (+6.6%); held for 16.3% of people, 23.7 s sooner; everyone else 11.5 s later, 56.3% of them later; first one into a held car 55.9 s later
6 a minute         door to floor 114.3 s let close, 117.8 s held (+3.1%); held for 7.1% of people, 33.3 s sooner; everyone else 6.4 s later, 52.8% of them later; first one into a held car 56.5 s later

Floors
5 floors           door to floor 41.7 s let close, 51.7 s held (+23.9%); held for 36.6% of people, -0.4 s sooner; everyone else 15.5 s later, 61.6% of them later; first one into a held car 35.3 s later
20 floors          door to floor 155.9 s let close, 154.6 s held (-0.8%); held for 7.0% of people, 57.4 s sooner; everyone else 2.9 s later, 50.6% of them later; first one into a held car 69.1 s later

Seconds a stop
5 s a stop         door to floor 52.7 s let close, 59.6 s held (+13.1%); held for 30.4% of people, 8.5 s sooner; everyone else 13.6 s later, 59.6% of them later; first one into a held car 37.3 s later
12 s a stop        door to floor 111.3 s let close, 115.3 s held (+3.6%); held for 14.6% of people, 34.2 s sooner; everyone else 10.5 s later, 55.7% of them later; first one into a held car 58.5 s later

Door timer
closes after 2 s   door to floor 71.7 s let close, 76.5 s held (+6.6%); held for 24.8% of people, 18.5 s sooner; everyone else 12.4 s later, 58.6% of them later; first one into a held car 42.2 s later
closes after 5 s   door to floor 75.9 s let close, 85.2 s held (+12.2%); held for 20.8% of people, 15.7 s sooner; everyone else 15.8 s later, 59.5% of them later; first one into a held car 55.0 s later

Car size
8 people           door to floor 76.6 s let close, 79.5 s held (+3.8%); held for 17.0% of people, 21.2 s sooner; everyone else 7.9 s later, 56.1% of them later; first one into a held car 41.1 s later
16 people          door to floor 72.6 s let close, 81.7 s held (+12.5%); held for 25.3% of people, 14.2 s sooner; everyone else 17.0 s later, 61.3% of them later; first one into a held car 50.2 s later
```
