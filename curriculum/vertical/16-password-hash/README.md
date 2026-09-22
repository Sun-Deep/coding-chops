# Vertical 16: a site never stores your password

Status: blocked

Built, rendered and reviewed. The creator understanding check is still open.

## What it claims

A site does not keep your password. It keeps a SHA-256 digest of it: sixty-four
characters, the same sixty-four characters whatever went in.

Change one character of the password and the digest is a different sixty-four
characters. `hunter2` and `hunter3` share three of theirs, and across five
thousand one-character edits a mean of exactly half the 256 bits move.

That is why logging in still works and recovery does not. The site hashes what
you typed and compares, so it can recognise you without ever holding what you
typed. It also means nobody there can send your password back to you, which is
the thing a viewer can use tomorrow on any service they log into.

## Why this topic

Two cuts missed in a row before this one, and the rule that explains both is
sharper than the one in [[clarity-needs-a-checkable-moment]]. A decoding key is
not enough on its own. VR15 handed over a real one and still did 6.3K, because
most of the audience has never written a cron line and the ones who have already
knew what five stars meant. The key has to open a lock the viewer is already
standing in front of.

Everybody has clicked "forgot password" and been offered a reset rather than
their password. Nobody has been told why. That is the lock, and almost nobody on
the feed is exempt from it, programmer or not.

It is also chmod's shape, which is the shape that did 137K: an object with a
fixed number of positions, and a key that lets you read any of them.

## What is out of scope

Salting, and the whole business of how a real password store is built. A stolen
database of unsalted hashes cracks once for everybody, which is the catch, and
it is named in the caption rather than animated. Fitting it into fourteen
seconds would have meant either dropping the verification pass or explaining two
mechanisms at once, and VR10 already proved what happens when a fourteen second
cut carries two claims.

SHA-256 is the wrong function to hash a password with for exactly that reason:
it is fast, so it is cheap to guess against. Real stores use bcrypt, scrypt or
argon2, the measurement script uses PBKDF2 with 100,000 iterations for the
salting section, and none of that is on screen. The reel is about what a digest
is, not about how to choose one, and saying "SHA-256" while drawing a login box
is honest about the mechanism without pretending to be a deployment guide.

Rainbow tables, credential stuffing and password strength are all one step
further out again.
