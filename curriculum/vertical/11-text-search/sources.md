# Sources

- Boyer and Moore, "A Fast String Searching Algorithm", Communications of the
  ACM, 1977. The original, and the source of the good-suffix rule that is the
  difference between this and Horspool.
- Horspool, "Practical Fast Searching in Strings", Software: Practice and
  Experience, 1980. The simplification that drops the good-suffix table and
  keeps almost all of the benefit, which is this cut's catch.
- Knuth, Morris and Pratt, "Fast Pattern Matching in Strings", SIAM Journal on
  Computing, 1977, for the failure function and the guarantee that the text
  pointer never goes backwards.
- Karp and Rabin, "Efficient randomized pattern-matching algorithms", IBM
  Journal of Research and Development, 1987.
- Sunday, "A Very Fast Substring Search Algorithm", Communications of the ACM,
  1990, for the idea of looking at the character one past the window.
- Cormen, Leiserson, Rivest and Stein, _Introduction to Algorithms_, fourth
  edition, chapter 32, for the shared framing and for the naive matcher.

The good-suffix table is the one piece here that is genuinely easy to get
subtly wrong, and it is the reason every matcher in the script is checked
against a scan of the text rather than against each other.
