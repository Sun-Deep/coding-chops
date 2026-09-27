# Sources

Every figure was produced by `scripts/measure-git-storage.sh` and read back
from git itself (`cat-file`, `count-objects`, `verify-pack`). The references
below are where the object model and pack format are documented. They were not
re-read while building this cut.

- _Pro Git_, chapter 10, "Git Internals": Git Objects, and Packfiles.
- `gitformat-pack(5)`, the pack format and delta encoding.
- `git-gc(1)`, `git-verify-pack(1)`, `git-cat-file(1)`.
