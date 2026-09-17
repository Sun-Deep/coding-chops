# Sources

The mechanism is specified rather than discovered, so the reading here was to
get the wording right rather than to learn what happens.

- IEEE Std 1003.1, POSIX.1-2017, the `chmod` utility and `<sys/stat.h>`. The
  file mode bits, their octal values, and the definition of what the execute bit
  means on a directory as against a file.
- `man 2 chmod` and `man 1 chmod` on macOS 26.5, which is the system the
  measurement ran on.
- `man 7 inode` on Linux, for the same definitions written more plainly.

The one thing worth reading twice is the directory case. POSIX calls the bit
"search permission" on a directory, not execute permission, which is the whole
catch and is clearer than the letter `x` suggests.
