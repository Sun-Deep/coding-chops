# Coding Chops project instructions

## Writing

Applies to scripts, titles, descriptions, captions, documentation, code
comments, review feedback, and anything else with words in it.

- Write plainly. No marketing register, no filler, no em dashes, no title-case headings.
- Cut any sentence that would read the same in another project's docs. If it says nothing about this one, it says nothing.
- Prefer the plain word, the active voice, and the concrete number over the adjective.
- Before saving written copy, reread it and remove whatever sounds generated.

- Before planning, scripting, or changing any video composition, read `docs/video-production-standard.md` and `docs/visual-language.md` completely.
- Before touching anything under `src/vertical/` or `src/shared/vertical/`, read `docs/vertical-format-standard.md` completely. It is 9:16, the canvas is dark whatever the track, no element a viewer has to read leaves y 190 to 1500, and nothing below y 1000 crosses x 930.
- Vertical cuts carry two recorded exceptions, and both are vertical only. The channel mark is in every frame, against item 8 of section 5 of the production standard. The brand orange is the teaching accent and cobalt is not used, against the accent section of `docs/visual-language.md`. Horizontal episodes keep both original rules. Do not port either exception the other way.
- A vertical cut still gets exactly one accent and it still has to mean something. `src/shared/vertical/palette.ts` holds it. Do not add a second colour to a teaching frame because the first one is now warm.
- A vertical cut is written for the format and carries its own script and understanding check. Do not produce one by cropping a horizontal master.
- Every number on screen in a vertical cut is measured on a machine and the run is committed beside it. Do not put a plausible figure in a frame.
- Do not use em dashes in video titles, descriptions, captions, scripts, thumbnails, or other channel copy.
- A lesson is not publish-ready until its understanding check is passed.
- Do not treat draft copy in a composition as an approved script.
- Lock narration before final animation. Treat narration audio and timestamped caption JSON as the production timing source of truth.
- Use Remotion frame-driven animation. Do not use CSS transitions or CSS keyframes.
- Give each shot one hero object and preserve that object's continuity between shots whenever possible.
- Use one clear idea per shot. Every visible element must have an understandable teaching purpose.
- Do not add an architecture component without a stated requirement, bottleneck, or tradeoff.
- Before adding, moving, or rewording any affiliate link, sponsor mention, or paid segment, read `docs/affiliate-and-sponsor-standard.md` completely.
- Never write "sponsored by" for a plain affiliate link. Name the arrangement accurately.
- Never remove or shorten a disclosure to improve pacing.
- Keep every real affiliate link in the episode's `affiliate-slot.md`. Do not paste links into scripts, descriptions, compositions, or the README.
- Keep generated renders out of Git.
- The brand changed at `problem-solving/01-best-time-to-buy-and-sell-stock`. That episode and everything after it uses the CC mark, the Archivo wordmark and the orange accent. `system-design/01-single-server` is published and keeps the prompt mark, the Inter wordmark and cobalt. Do not port the new brand backwards. Read the brand cutover section of `docs/visual-language.md` before touching either.
- Keep the orange accent out of teaching frames. It is for the mark, the end card, thumbnails and social assets. Colour inside a lesson has to mean something.
- Preserve the visual language established by the How AI Generates Text video. Use the shared palette, Inter typography, warm paper scenes, near-black interstitials, cobalt blue accent, oversized editorial type, sparse diagrams, and restrained material depth.
- Do not introduce a generic dashboard aesthetic, multi-color infrastructure palette, glassmorphism, neon cyberpunk styling, or decorative grid unless the user explicitly changes the channel visual identity.
- Keep System Design horizontal masters on the warm paper canvas by default. Do not switch to black merely to make a system bottleneck feel technical.
- Problem Solving and DSA run on the near-black canvas. See section 25 of `docs/problem-solving-visual-language.md` for why, and do not change a track's canvas without the same four answers.
- Prefer typography-led flows and minimal objects over boxed infrastructure cards.
- Do not mark a video publish-ready until the complete render has been watched from beginning to end.
