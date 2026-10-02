# Measurements

`node scripts/measure-checkout.mjs`, run twice on 2026-10-01, identical output
both times. Seeded, no timing, so the machine cannot move a figure: Apple M5
Pro, macOS 26.5.1, Node 22.14.0.

```text
3 tills, 40 shoppers, checkout 20 to 50s, 1 in 8 slow at 120 to 180s, tills 85% busy (a shopper every 19.4s on average)
seed 1

  id  joins  checkout   shortest: till start wait   shared: till start wait
   0      5     35                   1      5     0            1      5     0
   1     29    142 slow              2     29     0            2     29     0
   2     58     20                   1     58     0            3     58     0
   3     78     33                   1     78     0            1     78     0
   4     95     27                   3     95     0            3     95     0
   5    172     30                   1    172     0            1    172     0
   6    194     26                   2    194     0            3    194     0
   7    196    139 slow              3    196     0            2    196     0
   8    199     38                   1    202     3            1    202     3
   9    208     43                   1    240    32            3    220    12
  10    260     30                   2    260     0            1    260     0
  11    339     36                   1    339     0            3    339     0
  12    351     47                   2    351     0            1    351     0
  13    375     50                   1    375     0            2    375     0
  14    378     41                   3    378     0            3    378     0
  15    381     25                   1    425    44            1    398    17
  16    398     30                   2    398     0            3    419    21
  17    399     27                   2    428    29            1    423    24
  18    433    143 slow              3    433     0            2    433     0
  19    434     24                   1    450    16            3    449    15
  20    466     24                   2    466     0            1    466     0
  21    484     48                   1    484     0            3    484     0
  22    485    180 slow              1    532    47            1    490     5
  23    517     32                   2    517     0            3    532    15
  24    539     42                   1    712   173            3    564    25   <- you
  25    552     24                   2    552     0            2    576    24
  26    597     39                   2    597     0            2    600     3
  27    614     21                   3    614     0            3    614     0
  28    625     49                   2    636    11            3    635    10
  29    633     28                   3    635     2            2    639     6
  30    680     33                   3    680     0            2    680     0
  31    691     20                   2    691     0            1    691     0
  32    712     33                   2    712     0            3    712     0
  33    725     28                   3    725     0            1    725     0
  34    726     40                   1    754    28            2    726     0
  35    728     26                   2    745    17            3    745    17
  36    733     35                   3    753    20            1    753    20
  37    751     50                   2    771    20            2    766    15
  38    764     50                   1    794    30            3    771     7
  39    789     33                   3    789     0            1    789     0

shortest  mean wait 11.8s  95th 47s  longest 173s
shared    mean wait 6.0s  95th 24s  longest 25s
shoppers who waited longer in the shortest line 10, shorter 5, same 25
shoppers overtaken by someone who joined after them: shortest 6, shared 0

you (shopper 24): shortest 173s, shared 25s; overtaken in the shortest line by 25, 26, 27, 28, 29, 30, 31

across 1000 scenarios of 200 shoppers (seeds 100001 to 101000), 200000 shoppers
mean wait       shortest 58.4s  shared 51.9s  (11% less)
95th percentile shortest 230s  shared 199s
99th percentile shortest 368s  shared 324s
waited longer in the shortest line 34.1%, shorter 31.6%
overtaken by a later shopper (first 100 scenarios) shortest 27.5%, shared 0.0%
```

## What goes on screen

| Figure                                | Value | From                          |
| ------------------------------------- | ----- | ----------------------------- |
| Your wait, shortest line              | 2:53  | shopper 24, joins 539, at 712 |
| Your wait, shared line                | 0:25  | shopper 24, joins 539, at 564 |
| Joined after you, served before, left | 7     | shoppers 25 to 31             |
| The same, right                       | 0     | by construction               |

## Why shopper 24

`RANK=1` lists seed 1's shoppers by how much longer they waited in the
shortest-line shop. Shopper 24 is first. The cut is about the bad draw and
says so; the across-scenario figures are what the claim rests on.
