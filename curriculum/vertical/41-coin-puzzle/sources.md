# Sources

- [Wim Ruitenburg, Marquette University, one lighter coin and a balance](https://www.mscsnet.mu.edu/~wim/oldClasses2/20072.025/1130coin.html).
  Describes the known-lighter variant, three outcomes per weighing, and the
  nine-coin solution. Accessed 19 October 2026. The nine-coin paragraph's
  right-pan range has a typo; its following cases and outcome table use the
  correct equal groups. Our implementation weighs three against three.
- `src/vertical/41-coin-puzzle/simulation.ts` and
  `scripts/measure-coin-puzzle.mjs`. Exhaust every possible lighter coin and
  check the strategy across different masses and larger powers of three.

The set, balance and coins are built in `scripts/blender/coins/scene.py`.
No downloaded models, textures, real coin designs or external footage are used.

The portrait and wreath are invented and identical on every coin. The small
ONE inscription uses the local Times New Roman font when present, with Blender's
built-in font as a fallback. Neither a real currency nor a weight is depicted.
