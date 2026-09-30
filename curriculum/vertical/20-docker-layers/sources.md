# Sources

Every figure was produced by `scripts/measure-docker-layers.sh`: the step
statuses are BuildKit's own plain progress output, the bytes are `docker
history`, and the package count is `ls node_modules` inside the image. The
references below document the behaviour and were not re-read while building
this cut.

- Docker docs, "Optimizing builds with cache management" and "Build cache
  invalidation".
- Docker docs, Dockerfile reference, `COPY` and `RUN`.
- npm docs, `npm ci`.
