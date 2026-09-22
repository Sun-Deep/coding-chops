# Sources

What the mechanism was checked against.

- FIPS 180-4, *Secure Hash Standard*, NIST, August 2015. Section 6.2 is the
  SHA-256 algorithm the implementation in `src/vertical/16-password-hash/sha256.ts`
  is written from: the round constants, the message schedule and the padding.
- `node:crypto` `createHash("sha256")`, which is OpenSSL, used as the first
  independent check in `scripts/measure-password-hashing.mjs`.
- `shasum -a 256`, the Perl implementation shipped with macOS, used as the
  second. Every digest the reel prints was produced by all three.
- `node:crypto` `pbkdf2Sync`, for the salting section. PBKDF2 with 100,000
  iterations of SHA-256, which is a deliberately slow construction and is there
  to show that a salt separates two identical passwords, not to recommend a cost
  parameter.
- OWASP, *Password Storage Cheat Sheet*, for the claim that a password store
  should use a slow function rather than a bare hash. Nothing from it is on
  screen; it is why the README says SHA-256 is the wrong choice for a real store
  and the reel does not pretend otherwise.

`hunter2` is the password from the bash.org quote, which is the only reason it
is recognisable. It carries no other significance and nothing in the cut depends
on the choice: swapping it changes every glyph in the frame, because the frame
hashes it rather than reciting it.
