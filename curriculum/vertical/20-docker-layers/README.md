# Vertical 20: the order of the lines in a Dockerfile

Status: blocked

Built, rendered and reviewed. The creator understanding check is still open.

## What it claims

The same app, two Dockerfiles, the same one-line change to `server.js`.

With `COPY . .` above `RUN npm ci`, the change invalidates the copy, and every
step below a changed step runs again, so all 67 packages are reinstalled into
a new 4.37 MB layer. With the package files copied and installed first and the
code copied after, the install layer comes from the cache and only the last
copy, 30 KB, is rebuilt.

The only difference between the two files is where one line sits.

## Why this topic

The Git reel came back with 66 percent of its views from non-followers while
the QR reel was still up, so the QR theory is dead and two explanations are
left: git is a strong subject, or Facebook's side recovered on its own. This
reel separates them. It is another of the page's proven subjects (Docker
Commands did 274K) and it is not git. Over half its views from non-followers
means the drought ended on Facebook's side; back at 21 to 38 percent means
subject strength is doing the work.

It is also the git reel's sibling in shape: one change, and what the tool does
with it that people do not expect.

## What is out of scope

Multi-stage builds, `.dockerignore`, BuildKit cache mounts and remote cache.
Why `WORKDIR` reports as cached even on a no-cache build. Layer sizes on push.
The install takes under a second on this machine with a warm network, so time
is not on screen: packages and bytes are.
