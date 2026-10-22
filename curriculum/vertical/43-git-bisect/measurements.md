# Measurements

Output of `node --experimental-strip-types scripts/measure-git-bisect.mjs`,
run twice on 2026-10-22 with identical output. Apple M5 Pro, macOS 26.5.1.

Nothing is timed. Names, emails, dates and file contents are pinned, so the
commit ids reproduce with the same git.

```text
== versions
git version 2.53.0
v22.14.0

== the repository
commits: 1000
since v1.0: 999
HEAD: 90119d5 Reword the FAQ
v1.0: 075c9fd Add free shipping over $50

== $ git bisect start HEAD v1.0 && git bisect run node test.mjs
Bisecting: 499 revisions left to test after this (roughly 9 steps)
[b32f0b706b075109ba8d368e0497fda2e3e860bb] Darken the buy button
running 'node' 'test.mjs'
ok    a $50 order ships free
Bisecting: 249 revisions left to test after this (roughly 8 steps)
[fbcfd7a9bf85f6d831bb9cf12529b939c4a8ad50] Tighten the header
running 'node' 'test.mjs'
FAIL  a $50 order paid for shipping
Bisecting: 124 revisions left to test after this (roughly 7 steps)
[aa44ce4b23f620da3e58b72fce317df8f4cc3a86] Update the returns page
running 'node' 'test.mjs'
ok    a $50 order ships free
Bisecting: 62 revisions left to test after this (roughly 6 steps)
[2601352b7660c4846f3602ae07168a697df9d58a] Add a size guide row
running 'node' 'test.mjs'
FAIL  a $50 order paid for shipping
Bisecting: 30 revisions left to test after this (roughly 5 steps)
[df45758b54b4125add0a32f53c6d286676f0160d] Reword the FAQ
running 'node' 'test.mjs'
FAIL  a $50 order paid for shipping
Bisecting: 15 revisions left to test after this (roughly 4 steps)
[3cccb39f305a4a981e3c9aa453757bed19444be3] Reword the FAQ
running 'node' 'test.mjs'
FAIL  a $50 order paid for shipping
Bisecting: 7 revisions left to test after this (roughly 3 steps)
[9f538a461630f76af446acea461db447f51b65a9] Reword the FAQ
running 'node' 'test.mjs'
ok    a $50 order ships free
Bisecting: 3 revisions left to test after this (roughly 2 steps)
[0016973e37f2cfdc935cde87ebcfe78a9dc90ce0] Darken the buy button
running 'node' 'test.mjs'
ok    a $50 order ships free
Bisecting: 1 revision left to test after this (roughly 1 step)
[3834df8466d569c5bbc9c30999e0efd3af283ad2] Tighten the header
running 'node' 'test.mjs'
ok    a $50 order ships free
Bisecting: 0 revisions left to test after this (roughly 0 steps)
[1c617b2116ede425eb77d3a1245f0bfa22719cb3] Tidy up the shipping check
running 'node' 'test.mjs'
FAIL  a $50 order paid for shipping
1c617b2116ede425eb77d3a1245f0bfa22719cb3 is the first bad commit
commit 1c617b2116ede425eb77d3a1245f0bfa22719cb3
Author: Dev <dev@example.com>
Date:   Thu Mar 26 03:00:00 2026 +0000

    Tidy up the shipping check

 shipping.js | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
bisect found first bad commit

== the checks
1. commit 500: good
2. commit 750: bad
3. commit 625: good
4. commit 687: bad
5. commit 656: bad
6. commit 640: bad
7. commit 632: good
8. commit 636: good
9. commit 638: good
10. commit 639: bad
first bad: commit 639, 1c617b2

== $ git show --format= first-bad
diff --git a/shipping.js b/shipping.js
index 91aaf8f..30b9ea0 100644
--- a/shipping.js
+++ b/shipping.js
@@ -2 +2 @@
-export const freeShipping = (total) => total >= 50;
+export const freeShipping = (total) => total > 50;

== one commit at a time, back from HEAD
checks: 362

== every possible bad commit, 2 to 1,000, bisected for real
9 checks: 25 times
10 checks: 974 times
most: 10
mean: 9.97
one at a time, most: 998

== measurements.ts matches this run
```
