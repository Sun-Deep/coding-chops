# Coding Chops video production standard

This document defines the non-negotiable production rules for all Coding Chops videos. It is derived from the final implementation and production handoff for **How AI Actually Generates Text**.

The reference video is evidence of the intended quality bar. Future videos must preserve its visual grammar, production discipline, and beginner-first clarity without copying its LLM-specific scenes.

## 1. The two release gates

A lesson must pass both gates before publication.

### Understanding gate

The creator can explain, draw, evaluate, compare, and apply the concept without depending on the script.

### Production gate

The narration, visuals, captions, and audio have been synchronized, rendered, and watched from beginning to end.

A polished animation cannot compensate for an unpassed understanding gate. Correct research cannot compensate for an unclear production.

## 2. Beginner-first story rule

Each lesson needs one concrete story that a beginner can follow from the first shot to the last.

Choose one continuous hero object:

- System Design: one request, record, message, file, or user action
- DSA: one value, pointer, node, subarray, or search target
- Problem Solving: one constraint, state, decision, invariant, or example input

The hero object should end one shot and begin the next whenever possible. Do not replace it with a new metaphor at every stage.

The concise creative test is:

> One clear idea per shot, one continuous hero object, motion synchronized to speech, premium restraint, and no decorative technical clutter.

## 3. Source-of-truth order

Use separate source-of-truth chains for learning and production.

### Learning truth

1. Authoritative sources
2. Verified learning notes
3. Passed understanding check
4. Approved script

### Production truth

1. Locked narration audio
2. Timestamped caption JSON
3. Approved shot map or storyboard
4. Current Remotion composition
5. Older planning documents

If the narration, captions, storyboard, and composition disagree, stop and reconcile them. Do not guess which timing is intended.

Draft copy in a composition is not an approved script.

## 4. Format contract

- Frame rate: 30 fps unless an episode documents a justified exception
- Horizontal: compose natively for the registered horizontal resolution
- Thumbnail: a dedicated still composition

Keep composition IDs stable after publication.

## 5. Visual identity

The style is quiet, premium product-film clarity. Restraint is the whole of it: one hero object, one accent, and nothing on screen that cannot justify itself.

### Exact palette

| Role         | Value     |
| ------------ | --------- |
| Near-black   | `#050505` |
| Soft black   | `#101113` |
| Warm paper   | `#F4F2EC` |
| Bright paper | `#FBFAF7` |
| Ink          | `#111214` |
| Gray         | `#74767B` |
| Light gray   | `#C8C7C2` |
| Cobalt blue  | `#1769E0` |
| Bright blue  | `#4D9BFF` |
| White        | `#FFFFFF` |

Blue is the only meaningful accent color. Do not introduce orange, green, red, purple, rainbow gradients, generic neon colors, or status palettes unless technical accuracy makes another color essential and the storyboard explicitly approves it.

### Canvas rule

Warm paper is the default canvas for System Design, DSA, and Problem Solving.

Near-black is available for a justified cinematic interstitial or a concept that genuinely benefits from light emerging from darkness. Do not add a black scene merely to make a topic feel technical. Do not alternate canvases mechanically.

### Typography

- Inter
- Weights 400, 600, 700, and 800
- Hero phrases are very large, short, heavy, and tightly tracked
- Hero tracking is usually `-0.05em` to `-0.075em`
- Use sentence case for explanation
- Use uppercase only for brief chapter statements or editorial labels
- Editorial notes use a monospaced system font, quiet gray, 18px horizontal, and 20px vertical

Use only two primary text hierarchies in a shot: huge hero type and quiet editorial notes. Captions are a separate subtitle layer.

### Composition

1. Give every shot one hero object.
2. Use edge-to-edge composition, not dashboards or floating application windows.
3. Let narration explain while the visual demonstrates.
4. Use negative space deliberately.
5. Treat important words or values as physical material when it improves understanding.
6. Use restrained directional lighting and shadows.
7. Do not add persistent top-left scene titles.
8. Do not keep the channel logo visible throughout the lesson. It appears once, locked up with the wordmark in the outro, in the episode's own accent rather than its native colour.
9. Do not put every concept inside a card, capsule, node, or panel.
10. Do not show a decorative element whose meaning cannot be explained in one sentence.

## 6. Motion language

All animation must be deterministic and driven by Remotion frames.

Never use CSS animations, CSS transitions, or Tailwind animation classes.

### Standard easing

```ts
const EASE_OUT = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.bezier(0.16, 1, 0.3, 1),
};

const EASE_IN_OUT = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.bezier(0.45, 0, 0.55, 1),
};
```

### Preferred motion

- Slow optical scaling
- Controlled translation
- Match cuts
- Hard cuts at clear idea changes
- Smooth object-to-object transformations
- Directional lighting sweeps
- Brief, restrained fades
- Motion that lasts long enough for a beginner to understand

### Avoid

- Bouncy spring animation
- Constant floating
- Random particles
- HUD scanning effects
- Light-beam interfaces
- Decorative network diagrams
- Excessive blur
- Motion that finishes before narration explains it
- Animation added only because the screen feels empty

Readable hero content must remain readable throughout a lighting sweep or transformation.

## 7. Narration-first timing

Lock narration before final animation.

For every spoken sentence:

1. Record or generate the final narration.
2. Measure the exact audio duration.
3. Create or update timestamped caption JSON.
4. Identify the important noun, action, or change.
5. Make the relevant visual appear at or slightly before that phrase.
6. Hold it long enough for a beginner to understand.
7. Transition only when the narration changes ideas.

Do not show a later concept while the narrator is still explaining the previous one.

Use `Caption` from `@remotion/captions` for caption data:

```ts
type Caption = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
};
```

## 8. Caption contract

Captions are subtitles, not part of the main visual hierarchy.

### Placement

- Font size: 28px
- Bottom: 42px
- Left and right margins: approximately 280px

### Rules

- Use white captions on dark scenes.
- Use near-black captions on paper scenes.
- Add a soft shadow only on dark backgrounds.
- Never use low-contrast gray captions.
- Keep captions unboxed.
- Fade captions over only a few frames.
- Show only the currently spoken sentence.
- Do not place editorial notes where they can be mistaken for a second subtitle line.
- Check the start, midpoint, and end of every caption interval.

## 9. Audio contract

Narration is always the loudest and clearest layer.

- Use one licensed music bed with documented source and license.
- Duck music smoothly during narration.
- Fade music in and out deliberately.
- Use sound effects only for semantic events.
- Do not add a sound to every animated property.

Good semantic uses include:

- Whoosh for a major transition
- Low impact for an idea landing
- Click for placement or selection
- Reject sound for a blocked or invalid path
- Riser for expansion or controlled acceleration
- Chime for a successful match or selection

Every committed audio asset must include its source and redistribution terms.

## 10. Thumbnail contract

The thumbnail is one clear promise, not a summary slide.

- Warm paper background by default
- Oversized black headline
- One cobalt focal signal
- One obvious selected object, value, or outcome
- No subtitle, episode summary, or unnecessary qualifier
- No robots, brains, generic circuit boards, dashboards, or decorative technical imagery

## 11. Rejected patterns

Do not repeat these patterns:

- Persistent scene titles
- Editorial text that resembles subtitles
- Low-contrast captions
- Visuals arriving out of sync with narration
- Unexplained analytical bars
- Company logos when typography can communicate the name
- Dashboard-like interfaces
- Dense network illustrations
- Light beams behind important text
- Cropped hero words, labels, nodes, or values
- Abrupt transformations that break object continuity
- Generic music with no relationship to the edit
- Orange channel branding
- Overcrowded frames
- Decorative robots, brains, circuit boards, HUDs, or cloud icons

## 12. Required quality-control process

Before a lesson can be marked publish-ready:

1. Pass the understanding gate.
2. Lock narration before final animation.
3. Measure every narration file.
4. Generate or update timestamped caption JSON.
5. Align every meaningful visual change to speech.
6. Inspect the start, midpoint, and end of every caption.
7. Confirm captions do not overlap editorial text.
8. Confirm every element has an understandable teaching purpose.
9. Confirm technical simplifications are labeled.
10. Confirm illustrative numbers are labeled.
11. Confirm hero objects and words remain readable and uncropped.
12. Review the full audio mix with headphones.
13. Run typecheck, lint, formatting, curriculum validation, and composition discovery.
14. Render the complete composition.
15. Watch the complete render from beginning to end.
16. Review the thumbnail at feed size, not only at full size.

Representative stills are useful during development, but they do not replace full-render review.

## 13. Track-specific application

The standard controls the visual and production grammar, not the metaphor for every topic.

### System Design

Follow one request or piece of data through the system. Introduce a component only when a requirement, bottleneck, or tradeoff creates the need for it.

### DSA

Follow one value, pointer, or invariant. Preserve its identity through comparisons, swaps, recursion, and state changes.

### Problem Solving

Follow one example input and one decision at a time. Reveal constraints before abstractions, and show why a rejected approach fails before replacing it.

## 14. Rule changes

Do not silently change this production language during an episode.

A proposed exception must state:

1. Which rule changes
2. What learning or platform problem the change solves
3. How the change will be tested
4. Whether the exception applies to one shot, one episode, or the whole channel

Retention data can motivate an experiment, but it does not prove a visual rule failed. Record the exact hook, first frame, spoken promise, time to useful information, and retention curve before drawing a conclusion.
