# Learning notes

- A 32-bit signed int stores numbers in two's complement. The top bit,
  bit 31, is worth -2,147,483,648; the other 31 add up to at most
  2,147,483,647.
- 2,147,483,647 is 0 followed by 31 ones. Adding 1 carries through all
  31 ones, turning each to 0, and the carry lands in bit 31. Now the only
  bit set is the one worth -2,147,483,648.
- In Java this wrap is defined behaviour. In C, signed overflow is
  undefined: the compiler may assume it never happens. The measurement
  builds the C cross-check with -fwrapv so it wraps like Java.
- A long has 64 bits. The same pattern, 1 then 31 zeros, sits in its
  lower half, where bit 31 is worth +2,147,483,648, and the sign is bit 63.
- Converting 6,000,000,000 to int keeps only the low 32 bits:
  6,000,000,000 - 4,294,967,296 = 1,705,032,704. Bit 32 is the one
  dropped.
- YouTube changed the counter before it was reached. The story is that a
  view count outgrew a type somebody chose, not that a site crashed.
