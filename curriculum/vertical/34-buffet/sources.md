# Sources

- [RFC 9113, sections 1 and 2](https://www.rfc-editor.org/rfc/rfc9113.html#section-1).
  HTTP/2 multiplexes exchanges and addresses application ordering, but does
  not address TCP head-of-line blocking.
- [RFC 9114, section 2](https://www.rfc-editor.org/rfc/rfc9114.html#section-2).
  HTTP/3 streams progress independently when another stream is blocked or
  suffers loss.
- [Simulation](../../../src/vertical/34-buffet/simulation.ts) and
  [measurement script](../../../scripts/measure-buffet.mjs).
  These establish the buffet numbers. No networking specification establishes
  a real buffet's serving time or fairness percentage.

Read on 2026-10-12. The analogy is an inference from the queue mechanism.
