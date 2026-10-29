# Script

Status: published

No voice; the narration is burned in, 29 words, under three a second.
Each line sits over the thing it says.

```text
0.1 s   YouTube counted views in 32 bits.
2.5 s   Its ceiling: 2,147,483,647.
4.9 s   One more view flips every bit.
7.3 s   -2,147,483,648 views.                  (payoff, orange)
9.6 s   So YouTube went 64-bit in 2014.
11.7 s  It's past 6 billion views now.
```

## On screen

```text
headline   Gangnam Style vs / a 32-bit counter.
player     a dancer in a blue suit and round sunglasses, facing the
           viewer, the horse dance with the reins pumped on every beat;
           he slumps while the count is negative; the lasso at the end
title      PSY - GANGNAM STYLE (강남스타일) M/V
views      2,147,483,610 up to 2,147,483,647 views, then -2,147,483,648
           in orange, then 2,147,483,648, then the race to 6,000,000,000
bits       the 32 bits, the sign marked; then bits 63-32 above
code       int views = 2147483647; views = views + 1;
           System.out.println(views);  // -2147483648
           the same with long  // 2147483648
           long views = 6000000000L;
           System.out.println((int) views);  // 1705032704
conditions Java 26 · YouTube's post, Dec 2014 · 6 billion: 17 Jul 2026
```
