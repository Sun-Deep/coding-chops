# Learning notes

## Every instruction is a layer, and the cache is a chain

Docker builds a Dockerfile top to bottom. Each step's cache key depends on the
step itself and on the result of every step above it. For `COPY`, the key
includes a checksum of the files copied. So when a copied file changes, that
step misses the cache, and so does every step below it, whatever they are.

## Code first

```text
COPY . .
RUN npm ci
```

Any change to any file in the build context changes `COPY . .`, and `npm ci`
sits below it, so it runs again: 67 packages, a new 4.37 MB layer. A one-line
change to server.js is enough. So is a README edit.

## Packages first

```text
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
```

The install now depends only on the two package files. Change server.js and
the first `COPY` still matches, so `npm ci` is cached and only the last
`COPY . .`, 30 KB, runs. Change the lockfile and the install runs again, which
is what should happen.

## Measuring it without lying about the cache

BuildKit's cache outlives a build. A second run of the script produced an edit
whose bytes a previous run had already built, and every step came back cached.
The script now writes a per-run `.build-id` into the context, picked up only by
`COPY . .`, so the only cache a rebuild can hit is the one the same run made.
Clearing the global build cache instead would delete other projects' layers.

The install layer's bytes move by a few hundred across builds, from 4,368,146
to 4,368,529, because npm writes logs into it, so the frame shows 4.37 MB.
Which steps ran and the package count did not move at all.
