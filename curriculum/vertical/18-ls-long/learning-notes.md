# Learning notes

## The seven columns

`-rwxr-xr-x 1 dev www-data 21 Sep 17 20:53 build.sh`

1. Mode. One character of type, `-` a file, `d` a folder, `l` a link. Then
   nine characters of permissions in three groups of rwx: owner, group,
   everyone else. Each group is one chmod digit, 4 for r, 2 for w, 1 for x.
   `rwxr-xr-x` is 755.
2. Links. How many names point at this inode. A plain file has 1. A second
   name made with `ln` makes it 2. A folder has 2 plus one per subfolder,
   because its own `.` and each child's `..` point at it; measured, a folder
   with three subfolders has 5.
3. Owner. The user whose rights are the first rwx.
4. Group. The group whose rights are the middle rwx.
5. Size in bytes, from the inode's `st_size`.
6. Last modified, from `st_mtime`. GNU ls prints the time for anything under
   about six months old and the year for anything older or in the future.
   Measured: a file touched 7 months ago shows `Feb 25 2026`, one 5 months ago
   shows `Apr 25 12:12`.
7. Name.

The script checks every column against `stat` in the same run.

## Why a folder says 4096

A folder is a file whose contents are a list: names, and the inode number each
name points at. `st_size` for a folder is the size of that list as stored. On
ext4 the list lives in whole blocks, and the default block is 4096 bytes, so a
folder with a few names is one block and says 4096 whatever the files it names
weigh.

Measured on the fixture: empty, 4096. Holding one 1 MB file, 4096. Holding
100 empty files, 4096. At 200 names it needs more blocks and says 12288, at
1,000 it says 36864. The figure follows how many names, not how many bytes.

Deleting every file leaves it at 36864. ext4 does not shrink a folder's list
when entries go; the blocks stay allocated to the folder until it is removed or
the filesystem is rebuilt with `e2fsck -D`.

Other filesystems say other things. On macOS APFS the same folders measured 64
and 96. The reel names GNU ls on ext4 on every frame for that reason.

## Why the fixture is on a loop mount

The container's own root is overlayfs, which reports whatever the Docker VM's
disk underneath happens to be. The script makes a real ext4 image with 4096
byte blocks and mounts it, so the figures are ext4's own. A small image lets
mkfs pick 1024-byte blocks, which the first probe hit; the script forces 4096.
