#!/usr/bin/env bash
#
# Change one line of an app and rebuild its image: what Docker runs again.
#
# The same app, built from two Dockerfiles that differ only in the order of
# their lines. Each is built once from nothing, then one line of server.js is
# changed and it is built again. The rebuild's own output says which steps came
# from the cache and which ran, and `docker history` gives the bytes of each
# layer, so both figures are Docker's rather than ours.
#
# The app is scripts/fixtures/docker-layers: express pinned by a committed
# lockfile, so `npm ci` installs the same 69 packages every run. It needs Docker
# running, node:22-slim, and the npm registry for the installs. Times are
# printed but move with the network; counts and bytes do not.

set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
FIXTURE="$HERE/fixtures/docker-layers"
WORK="$(mktemp -d)"
TAG="cc-layers-$$"
trap 'rm -rf "$WORK"; docker image rm -f "$TAG-bad" "$TAG-good" >/dev/null 2>&1 || true' EXIT

echo "== versions"
docker version --format 'docker {{.Server.Version}}'
docker buildx version | cut -d' ' -f1-2
docker image inspect node:22-slim --format 'node:22-slim {{.Id}}'

cat > "$WORK/Dockerfile.bad" <<'EOF'
FROM node:22-slim
WORKDIR /app
COPY . .
RUN npm ci --omit=dev --no-audit --no-fund
CMD ["node", "server.js"]
EOF

cat > "$WORK/Dockerfile.good" <<'EOF'
FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY . .
CMD ["node", "server.js"]
EOF

# Report each step of a build as ran or cached, from BuildKit's plain output.
steps() {
  awk '
    /^#[0-9]+ \[[0-9]+\/[0-9]+\] / {
      id=$1; sub(/^#[0-9]+ /, ""); name[id]=$0; order[++n]=id
    }
    / CACHED$/ { cached[$1]=1 }
    / DONE [0-9.]+s$/ { t[$1]=$NF }
    END {
      for (i=1; i<=n; i++) {
        id=order[i]
        printf "  %-7s %-6s %s\n", (cached[id] ? "cached" : "ran"), (cached[id] ? "" : t[id]), name[id]
      }
    }'
}

# Bytes of each layer, newest first, with the instruction that made it.
layers() {
  docker history --no-trunc --human=false --format '{{.Size}}\t{{.CreatedBy}}' "$1" |
    head -6 | awk -F'\t' '{ printf "  %10s  %s\n", $1, substr($2, 1, 70) }'
}

for order in bad good; do
  APP="$WORK/app-$order"
  cp -R "$FIXTURE" "$APP"
  cp "$WORK/Dockerfile.$order" "$APP/Dockerfile"
  # BuildKit's cache outlives this script, so a second run's edited server.js
  # would match a layer the first run already built and every step would come
  # back cached. A per-run file, picked up only by `COPY . .`, keeps the one
  # cache a rebuild can hit to the one this run just made. Clearing the global
  # build cache instead would delete other projects' layers.
  echo "$$-$(date +%s)" > "$APP/.build-id"

  echo
  echo "== $order order"
  sed 's/^/  /' "$APP/Dockerfile"

  echo "-- first build, nothing cached"
  docker build --no-cache --pull=false --progress=plain -t "$TAG-$order" "$APP" 2>&1 | steps
  echo "-- layers"
  layers "$TAG-$order"

  # One line: the orders route now also returns a page number.
  sed -i.bak 's/res.json({ orders: \[\] });/res.json({ orders: [], page: 1 });/' "$APP/server.js"
  rm "$APP/server.js.bak"
  echo "-- the change"
  diff "$FIXTURE/server.js" "$APP/server.js" | sed 's/^/  /' || true

  echo "-- rebuild after the change"
  docker build --pull=false --progress=plain -t "$TAG-$order" "$APP" 2>&1 | steps
  echo "-- layers"
  layers "$TAG-$order"
  echo "-- packages in node_modules"
  docker run --rm "$TAG-$order" sh -c 'ls node_modules | wc -l'
done
