# Measurements

```bash
scripts/measure-docker-layers.sh
```

## The machine

```text
Apple M5 Pro, macOS 26.5.1, Docker Desktop 29.5.2, buildx v0.34.0
node:22-slim sha256:78175922b1739c305f3832562c569a07cbc0005b39db6b97a4a3ac328b9fae94
```

The app is `scripts/fixtures/docker-layers`: express 4.21.2 pinned by a
committed lockfile, so `npm ci` installs the same 67 packages every time. The
installs need the npm registry, so times move with the network and are not on
screen.

## The run

```text
== versions
docker 29.5.2
github.com/docker/buildx v0.34.0-desktop.1
node:22-slim sha256:78175922b1739c305f3832562c569a07cbc0005b39db6b97a4a3ac328b9fae94

== bad order
  FROM node:22-slim
  WORKDIR /app
  COPY . .
  RUN npm ci --omit=dev --no-audit --no-fund
  CMD ["node", "server.js"]
-- first build, nothing cached
  ran     0.0s   [1/4] FROM docker.io/library/node:22-slim
  cached         [2/4] WORKDIR /app
  ran     0.0s   [3/4] COPY . .
  ran     0.5s   [4/4] RUN npm ci --omit=dev --no-audit --no-fund
-- layers
           0  CMD ["node" "server.js"]
     4368146  RUN /bin/sh -c npm ci --omit=dev --no-audit --no-fund # buildkit
       30183  COPY . . # buildkit
           0  WORKDIR /app
           0  CMD ["node"]
           0  ENTRYPOINT ["docker-entrypoint.sh"]
-- the change
  11c11
  <   res.json({ orders: [] });
  ---
  >   res.json({ orders: [], page: 1 });
-- rebuild after the change
  ran     0.0s   [1/4] FROM docker.io/library/node:22-slim
  cached         [2/4] WORKDIR /app
  ran     0.0s   [3/4] COPY . .
  ran     0.5s   [4/4] RUN npm ci --omit=dev --no-audit --no-fund
-- layers
           0  CMD ["node" "server.js"]
     4368154  RUN /bin/sh -c npm ci --omit=dev --no-audit --no-fund # buildkit
       30192  COPY . . # buildkit
           0  WORKDIR /app
           0  CMD ["node"]
           0  ENTRYPOINT ["docker-entrypoint.sh"]
-- packages in node_modules
67

== good order
  FROM node:22-slim
  WORKDIR /app
  COPY package.json package-lock.json ./
  RUN npm ci --omit=dev --no-audit --no-fund
  COPY . .
  CMD ["node", "server.js"]
-- first build, nothing cached
  ran     0.0s   [1/5] FROM docker.io/library/node:22-slim
  cached         [2/5] WORKDIR /app
  ran     0.0s   [3/5] COPY package.json package-lock.json ./
  ran     0.5s   [4/5] RUN npm ci --omit=dev --no-audit --no-fund
  ran     0.0s   [5/5] COPY . .
-- layers
           0  CMD ["node" "server.js"]
       30222  COPY . . # buildkit
     4368154  RUN /bin/sh -c npm ci --omit=dev --no-audit --no-fund # buildkit
       29775  COPY package.json package-lock.json ./ # buildkit
           0  WORKDIR /app
           0  CMD ["node"]
-- the change
  11c11
  <   res.json({ orders: [] });
  ---
  >   res.json({ orders: [], page: 1 });
-- rebuild after the change
  ran     0.0s   [1/5] FROM docker.io/library/node:22-slim
  cached         [2/5] WORKDIR /app
  cached         [3/5] COPY package.json package-lock.json ./
  cached         [4/5] RUN npm ci --omit=dev --no-audit --no-fund
  ran     0.0s   [5/5] COPY . .
-- layers
           0  CMD ["node" "server.js"]
       30231  COPY . . # buildkit
     4368154  RUN /bin/sh -c npm ci --omit=dev --no-audit --no-fund # buildkit
       29775  COPY package.json package-lock.json ./ # buildkit
           0  WORKDIR /app
           0  CMD ["node"]
-- packages in node_modules
67
```

## Repeats

Two runs after the per-run `.build-id` fix. Every step's ran or cached status
and the package count were identical. Layer bytes across all builds: install
4,368,146 to 4,368,529, code copy 30,166 to 30,231, package-file copy 29,775
every time.

The first attempt at a second run came back fully cached, because BuildKit had
kept the first run's edited layer. That is why the `.build-id` exists; the
notes explain it.
