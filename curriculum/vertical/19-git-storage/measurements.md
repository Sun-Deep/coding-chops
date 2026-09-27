# Measurements

```bash
scripts/measure-git-storage.sh
```

## The machine

```text
Apple M5 Pro, macOS 26.5.1, git 2.53.0, default core.compression
```

Nothing is timed. Names, emails, dates and the file's contents are pinned, so
the object ids reproduce with the same git.

## The run

```text
== versions
git version 2.53.0
Darwin arm64

== the file
10240
160

== the change
before: setting_080 = 44a7db096b15d190b7f0b1be1950bfd32203a8d0f5c # 080
after:  setting_080 = 0000000000000000000000000000000000000000000 # 080
 1 file changed, 1 insertion(+), 1 deletion(-)
bytes of +/- lines in the diff: 130

== loose, before packing
blob v1 f40bcc85b34147c002f088ae794dde09fadc63a6: 10240 bytes, 5138 on disk
blob v2 05e7cf5bc8d7cfb6bc8e0383af92111017cc0d66: 10240 bytes, 5119 on disk
every object:
blob 05e7cf5bc8d7cfb6bc8e0383af92111017cc0d66 10240
blob f40bcc85b34147c002f088ae794dde09fadc63a6 10240
commit 28a90456228842ebdc04b45afab6616c3856e086 153
commit 65eadd3d850c75c41b81f1256db0996c31a64cac 205
tree 08dabab18872addc67f5bdfcc6df3a68f2781acf 38
tree f5f96aedaed6c736f2f7d9c5f23a78f9203f8479 38
count: 6
size: 32
size-pack: 0
size-garbage: 0

== the stored v2 blob, first line, as git has it
setting_001 = eff9eb68b7eaa494bc421f36109b0c996249389c692 # 001

== after git gc
count: 0
in-pack: 6
size-pack: 6
verify-pack (type size size-in-pack offset [depth base]):
05e7cf5bc8d7cfb6bc8e0383af92111017cc0d66 blob   10240 5112 271
08dabab18872addc67f5bdfcc6df3a68f2781acf tree   38 49 5383
28a90456228842ebdc04b45afab6616c3856e086 commit 153 113 158
65eadd3d850c75c41b81f1256db0996c31a64cac commit 205 146 12
f40bcc85b34147c002f088ae794dde09fadc63a6 blob   56 68 5481 1 05e7cf5bc8d7cfb6bc8e0383af92111017cc0d66
f5f96aedaed6c736f2f7d9c5f23a78f9203f8479 tree   38 49 5432
which blob is whole and which is a delta:
v2 blob: whole, 5112 bytes in pack
v1 blob: delta, 68 bytes in pack, against 05e7cf5bc8d7cfb6bc8e0383af92111017cc0d66
```

## Repeats

Run twice back to back; the output was byte identical, object ids included.
There is nothing in the script that could drift: no clock, no network, no
randomness.

## What goes on screen

| Figure                                  | Where it comes from                           |
| --------------------------------------- | --------------------------------------------- |
| 10,240 bytes, 160 lines                 | `wc` on the fixture                           |
| 130 bytes                               | the + and - lines of `git diff`               |
| 5,138 and 5,119                         | loose object files on disk, `stat`            |
| 159 of 160 lines same                   | counted in `file.ts`, which rebuilds the file |
| 5,112 whole, 68 delta against `05e7cf5` | `git verify-pack -v` after `git gc`           |

`file.ts` rebuilds the 160 lines with the SHA-256 from VR16 and checks the
total and line 80 against the script's output at load.
