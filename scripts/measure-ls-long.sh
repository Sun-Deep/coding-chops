#!/usr/bin/env bash
#
# One `ls -l` line, every column checked, on a real ext4 filesystem.
#
# Runs GNU ls inside a Debian 12 container, on an ext4 image created here with
# 4096-byte blocks, the default for any disk bigger than a few hundred MB. The
# container's own root is overlayfs, which would report whatever the Docker VM
# happens to use underneath, so nothing is measured there.
#
# Every column of the line the reel decodes is checked against `stat`, so the
# frame is not reading ls's own output back to itself. Then the folder: what ls
# says a folder weighs, what is actually inside it, how that number moves as
# files are added and removed, and how many of the folders in a real Debian
# /usr say 4096.
#
# Needs Docker running and the debian:bookworm-slim image. --privileged is only
# for the loop mount. Nothing is written outside the container.

set -euo pipefail

IMAGE="${IMAGE:-debian:bookworm-slim}"

docker run --rm --privileged "$IMAGE" bash -euo pipefail -c '
echo "== versions"
ls --version | head -1
. /etc/os-release && echo "$PRETTY_NAME"
uname -r

truncate -s 1G /tmp/disk.img
mkfs.ext4 -q -F -b 4096 /tmp/disk.img
mkdir /mnt/x
mount -o loop /tmp/disk.img /mnt/x
echo "filesystem: $(awk "\$2==\"/mnt/x\" {print \$3}" /proc/mounts), block size $(stat -f -c %S /mnt/x)"

useradd -M -s /usr/sbin/nologin dev
cd /mnt/x
# Pinned so the line does not change between runs. GNU ls prints the time for
# anything under six months old and the year for anything older, so a run
# after 2027-03-17 shows "2026" where the reel shows "20:53". That is the rule,
# not drift, and the date section below measures it on purpose.
STAMP="2026-09-17 20:53:00"

printf "#!/bin/sh\necho built\n" > build.sh
chmod 755 build.sh
chown dev:www-data build.sh
touch -d "$STAMP" build.sh

mkdir logs
head -c 10485760 /dev/zero > logs/app.log
chown -R dev:www-data logs
chmod 755 logs
chmod 644 logs/app.log
touch -d "$STAMP" logs/app.log logs

echo
echo "== the file"
ls -l build.sh
stat -c "mode=%A links=%h owner=%U group=%G size=%s mtime=%y name=%n" build.sh

echo
echo "== the folder"
ls -ld logs
stat -c "mode=%A links=%h owner=%U group=%G size=%s blocks=%b name=%n" logs
echo "-- inside it"
ls -l logs
du -sb logs

echo
echo "== what the folder number follows"
mkdir empty && echo "empty folder: $(stat -c %s empty)"
mkdir big && head -c 1073741 /dev/zero > big/one.bin && echo "folder holding one 1,073,741 byte file: $(stat -c %s big)"
mkdir many
n=0
for target in 50 100 200 500 1000; do
  while [ $n -lt $target ]; do : > "many/file-$(printf %04d $n).txt"; n=$((n+1)); done
  echo "folder holding $target empty files: $(stat -c %s many)"
done
rm many/*
echo "the same folder after deleting all 1000: $(stat -c %s many) ($(ls -A many | wc -l) entries left)"

echo
echo "== links"
mkdir -p nest/a nest/b nest/c
echo "folder with 3 subfolders: $(stat -c %h nest) links"
ln build.sh build-again.sh
echo "file with a second name: $(stat -c %h build.sh) links"
rm build-again.sh

echo
echo "== dates"
touch -d "5 months ago" recent.txt
touch -d "7 months ago" older.txt
ls -l recent.txt older.txt | awk "{print \$6, \$7, \$8, \$9}"

echo
echo "== a real tree: Debian /usr copied onto this ext4"
cp -a /usr /mnt/x/usr-copy
total=$(find /mnt/x/usr-copy -type d | wc -l)
four=$(find /mnt/x/usr-copy -type d -size 4096c | wc -l)
echo "folders: $total"
echo "folders that say 4096: $four"
echo "sizes of the rest:"
find /mnt/x/usr-copy -type d ! -size 4096c -printf "%s\n" | sort -n | uniq -c

cd /
umount /mnt/x
'
