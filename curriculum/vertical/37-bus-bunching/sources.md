# Sources

- [MIT OpenCourseWare, transit service reliability, Gabriel Sanchez-Martinez](https://ocw.mit.edu/courses/1-258j-public-transportation-systems-spring-2017/1c8dd257fa37b76fab4d53a19b7d13e4_I2K5WnG_TLs.pdf).
  The lecture explains how a smaller headway reduces passenger boardings and
  dwell time while a longer headway increases them, leading buses to bunch.
  Consulted on 2026-10-15.
- [Model](../../../src/vertical/37-bus-bunching/simulation.ts) and
  [measurement script](../../../scripts/measure-bus-bunching.mjs).
  These establish this cut's queues, movement and departure gap. The MIT
  lecture does not establish the numerical settings of this simulation.
