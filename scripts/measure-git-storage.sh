#!/usr/bin/env bash
#
# What git stores when you change one line.
#
# Builds a throwaway repository, commits a 10,240 byte text file, changes one
# line, commits again, and reports what is on disk at each step: the objects,
# their sizes before and after zlib, and then what `git gc` turns them into.
#
# Everything that feeds a hash is pinned (names, emails, dates, the file's
# contents), so the object ids reproduce on any machine running the same git.
# Nothing is timed. The repository is created in a temp directory and removed.

set -euo pipefail

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
cd "$WORK"

export GIT_AUTHOR_NAME="dev" GIT_AUTHOR_EMAIL="dev@example.com"
export GIT_COMMITTER_NAME="dev" GIT_COMMITTER_EMAIL="dev@example.com"
export GIT_AUTHOR_DATE="2026-09-27T20:00:00+0000"
export GIT_COMMITTER_DATE="2026-09-27T20:00:00+0000"
export GIT_CONFIG_NOSYSTEM=1 HOME="$WORK"

echo "== versions"
git --version
uname -sm

git init -q -b main repo
cd repo
git config core.compression -1
git config gc.auto 0

# 10,240 bytes of config: 160 lines of 64 bytes each, every line different,
# so zlib cannot flatten the file to nothing and the stored size is
# representative of a real text file rather than of a repeated pattern.
: > config.txt
for i in $(seq 1 160); do
  printf 'setting_%03d = %s # %03d\n' "$i" "$(printf '%s' "value-$i" | shasum -a 256 | cut -c1-43)" "$i" >> config.txt
done
echo
echo "== the file"
wc -c < config.txt | tr -d ' '
wc -l < config.txt | tr -d ' '

git add config.txt
git commit -q -m "add config"
V1_BLOB="$(git rev-parse HEAD:config.txt)"

# Change one line: line 80's value.
LINE80="$(sed -n 80p config.txt)"
sed -i.bak '80s/= [0-9a-f]\{43\}/= 0000000000000000000000000000000000000000000/' config.txt && rm config.txt.bak
echo
echo "== the change"
echo "before: $LINE80"
echo "after:  $(sed -n 80p config.txt)"
git diff --stat | tail -1
git diff | grep -E '^[-+][^-+]' | wc -c | tr -d ' ' | sed 's/^/bytes of +\/- lines in the diff: /'

git add config.txt
git commit -q -m "change line 80"
V2_BLOB="$(git rev-parse HEAD:config.txt)"

loose_size() { stat -f %z ".git/objects/${1:0:2}/${1:2}" 2>/dev/null || stat -c %s ".git/objects/${1:0:2}/${1:2}"; }

echo
echo "== loose, before packing"
echo "blob v1 $V1_BLOB: $(git cat-file -s "$V1_BLOB") bytes, $(loose_size "$V1_BLOB") on disk"
echo "blob v2 $V2_BLOB: $(git cat-file -s "$V2_BLOB") bytes, $(loose_size "$V2_BLOB") on disk"
echo "every object:"
git cat-file --batch-all-objects --batch-check='%(objecttype) %(objectname) %(objectsize)' | sort
git count-objects -v | grep -E '^(count|size)'

echo
echo "== the stored v2 blob, first line, as git has it"
git cat-file -p "$V2_BLOB" | head -1

echo
echo "== after git gc"
git gc -q
git count-objects -v | grep -E '^(count|size-pack|in-pack)'
PACK="$(ls .git/objects/pack/*.idx)"
echo "verify-pack (type size size-in-pack offset [depth base]):"
git verify-pack -v "$PACK" | grep -E '^[0-9a-f]{40} ' | sort -k1,1
echo "which blob is whole and which is a delta:"
git verify-pack -v "$PACK" | awk -v a="$V1_BLOB" -v b="$V2_BLOB" '
  $1==a {print "v1 blob: " (NF>5 ? "delta, " $4 " bytes in pack, against " $7 : "whole, " $4 " bytes in pack")}
  $1==b {print "v2 blob: " (NF>5 ? "delta, " $4 " bytes in pack, against " $7 : "whole, " $4 " bytes in pack")}'
