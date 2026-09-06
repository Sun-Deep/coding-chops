# Coding Chops visual language

The visual source of truth is the style established by the **How AI Generates Text** video. New tracks should feel like chapters from the same publication, not separate visual brands. The full workflow and quality gates are defined in [the video production standard](video-production-standard.md).

## Brand cutover

The mark, the wordmark and the accent changed once, at a fixed point.

`system-design/01-single-server` keeps what it shipped with: the prompt mark in
`Logo.tsx`, the cobalt Inter wordmark in `Wordmark.tsx`, and the cobalt accent.
That episode is published. Re-cutting it would make the file on YouTube and the
file in this repository disagree, which is worse than a channel whose first
episode looks like its first episode.

`problem-solving/01-best-time-to-buy-and-sell-stock` and everything after it
uses the CC mark in `Mark.tsx`, the Archivo wordmark in `Lockup.tsx`, the orange
accent, and the end card in `Outro.tsx`.

Do not port the new brand backwards, and do not start a new episode on the old
one.

## Two accents, and where each one is allowed

Orange is the brand. It appears on the mark, the wordmark, the end card, the
thumbnail furniture, and every avatar and banner. It never appears inside a
teaching frame.

Cobalt and the Problem Solving semantic colours stay exactly as they were, and
they are the only colours allowed inside a teaching frame. The rule that makes
the diagrams readable is that colour means something, so a frame with no trade
in it has no colour in it. A brand accent leaking into that frame would be the
first colour on screen that means nothing.

The sell colour moved for this. It was `#F2A73B`, an amber sitting right next
to the brand accent at `#FF7A33`. The two never share a frame, but a viewer who
has learned the channel as orange reads an amber SELL label as brand colour
inside a teaching frame, which is the one thing the rule above forbids. Sell is
now `#EFC94C`, clearly yellow, and still warm against the cool buy blue.

Check any new semantic colour against `#E4571B` and `#FF7A33` before adding it.

Vertical cuts are the exception, and only vertical cuts. There the brand
orange is the teaching accent and cobalt is not used, because a reel arrives
mid-scroll with no title attached and recognition has to happen before
reading does. The rule that colour means something is unchanged: there is
still one accent and everything that means nothing is still neutral. The
argument, the tone and the test are in the accent section of
`docs/vertical-format-standard.md`. Horizontal work keeps cobalt.

## Palette

| Role                        | Value     |
| --------------------------- | --------- |
| Near-black                  | `#050505` |
| Soft black                  | `#101113` |
| Warm paper                  | `#F4F2EC` |
| Bright paper                | `#FBFAF7` |
| Ink                         | `#111214` |
| Gray                        | `#74767B` |
| Light gray                  | `#C8C7C2` |
| Cobalt blue                 | `#1769E0` |
| Bright blue                 | `#4D9BFF` |
| Brand orange                | `#E4571B` |
| Brand orange, on near black | `#FF7A33` |
| White                       | `#FFFFFF` |

Blue is the only recurring semantic accent inside a lesson. Orange is the brand accent and stays out of teaching frames, per the section above. Explain overload, selection, focus, and data movement through density, scale, contrast, and timing before adding another color.

## Typography

- Inter, weights 400, 600, 700, and 800
- Oversized editorial headlines
- Tight headline tracking, usually between `-0.05em` and `-0.075em`
- Compact line height, usually between `0.88` and `1.0`
- Sentence case for explanatory copy
- Uppercase for short editorial hooks and chapter statements

Typography should often be the primary visual object, not a label placed above a decorative interface.

## Scene language

Warm paper is the default environment for the System Design curriculum. It should carry explanations, diagrams, comparisons, scale, and failure states without switching to a dark dashboard treatment.

Problem Solving and DSA run on the near-black canvas instead. That is a deliberate split recorded in section 25 of the problem-solving visual language, not a licence to alternate. What holds the tracks together is Inter, the cobalt accent, the restraint and the motion language. The ground is the only thing that differs.

Near-black remains part of the wider channel palette, but it is optional. Use it only when a specific concept benefits from a cinematic interstitial and the episode's approved storyboard calls for it.

Use cinematic changes in scale and position, but keep each frame visually sparse. Motion should reveal state, causality, or hierarchy.

## System diagrams

- Prefer typographic stages and minimal objects over bordered component cards
- Use minimal nodes with clear hierarchy when a node is genuinely necessary
- Use thin neutral connectors
- Use one cobalt signal to show the active request or selected path
- Prefer typography, spacing, and motion over status-color dashboards
- Use soft paper depth or restrained dark contrast
- Keep labels readable without requiring a legend

## Avoid

- Generic cloud-dashboard styling
- Cyan, green, amber, and red status palettes by default
- Glassmorphism as the primary material
- Neon cyberpunk infrastructure scenes
- Decorative grids with no teaching function
- Continuous movement added only to reset attention
