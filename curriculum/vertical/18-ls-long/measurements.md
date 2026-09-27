# Measurements

```bash
scripts/measure-ls-long.sh
```

Needs Docker running and `debian:bookworm-slim`. `--privileged` is only for the
loop mount. Nothing is written outside the container.

## The machine

```text
Apple M5 Pro, macOS 26.5.1, Docker 29.5.2, kernel 6.12.76-linuxkit
GNU ls 9.1, Debian 12 (bookworm), ext4 with 4096-byte blocks on a 1 GB loop image
```

## The run

```text
== versions
ls (GNU coreutils) 9.1
Debian GNU/Linux 12 (bookworm)
6.12.76-linuxkit
filesystem: ext4, block size 4096

== the file
-rwxr-xr-x 1 dev www-data 21 Sep 17 20:53 build.sh
mode=-rwxr-xr-x links=1 owner=dev group=www-data size=21 mtime=2026-09-17 20:53:00.000000000 +0000 name=build.sh

== the folder
drwxr-xr-x 2 dev www-data 4096 Sep 17 20:53 logs
mode=drwxr-xr-x links=2 owner=dev group=www-data size=4096 blocks=8 name=logs
-- inside it
total 10240
-rw-r--r-- 1 dev www-data 10485760 Sep 17 20:53 app.log
10489856	logs

== what the folder number follows
empty folder: 4096
folder holding one 1,073,741 byte file: 4096
folder holding 50 empty files: 4096
folder holding 100 empty files: 4096
folder holding 200 empty files: 12288
folder holding 500 empty files: 20480
folder holding 1000 empty files: 36864
the same folder after deleting all 1000: 36864 (0 entries left)

== links
folder with 3 subfolders: 5 links
file with a second name: 2 links

== dates
Feb 25 2026 older.txt
Apr 25 12:12 recent.txt

== a real tree: Debian /usr copied onto this ext4
folders: 363
folders that say 4096: 361
sizes of the rest:
      2 12288
```

## Repeats

Run twice, about twenty minutes apart. Identical line for line except the two
date lines, which are made "5 months ago" and "7 months ago" at run time, so
the clock time on the recent one moves with the run. That is the six-month rule
being measured, not drift. Everything on screen comes from pinned inputs: the
file's content, mode, owner, group and timestamp are set by the script, and the
folder figures are properties of ext4.

The date on the line is pinned to 2026-09-17 20:53. A run after 2027-03-17
prints `2026` in place of `20:53`, by the same rule.

## What goes on screen

| Figure                                                    | Where it comes from                                    |
| --------------------------------------------------------- | ------------------------------------------------------ |
| `-rwxr-xr-x 1 dev www-data 21 Sep 17 20:53 build.sh`      | `ls -l build.sh`, checked against `stat`               |
| `drwxr-xr-x 2 dev www-data 4096 Sep 17 20:53 logs`        | `ls -ld logs`                                          |
| `-rw-r--r-- 1 dev www-data 10485760 Sep 17 20:53 app.log` | `ls -l logs`                                           |
| 361 of 363                                                | folders in a copy of Debian 12's /usr on the same ext4 |

The two /usr folders that do not say 4096 say 12288. The lines are pasted into
`measurements.ts` exactly as printed, and `columns.ts` splits them and checks
the sizes against the constants at module load.
