# Contributing

Thank you for helping improve Coding Chops.

## Good first contributions

- Fix animation, accessibility, or rendering defects
- Improve reusable visual primitives
- Correct a sourced technical inaccuracy
- Improve setup documentation
- Propose translations without changing technical meaning

## Official curriculum changes

An official lesson must include:

1. A precise learning objective
2. Credible primary or authoritative sources
3. A plain-language explanation
4. An understanding check
5. Tradeoffs and failure modes
6. A storyboard and script
7. A successful typecheck and composition validation

Do not add technologies merely to make a design appear more advanced. Every component must solve a stated requirement or bottleneck.

## Development

Before editing a composition, read:

- [Video production standard](docs/video-production-standard.md)
- [Visual-language contract](docs/visual-language.md)

```bash
npm install
npm run dev
npm run check
npm run compositions
```

Animations must be driven by Remotion frames, `interpolate()`, and explicit easing. Do not use CSS transitions or CSS keyframe animations because they do not render deterministically. Avoid bouncy spring motion unless a storyboard explicitly justifies it.

Keep composition IDs stable. Place redistributable assets in `public/` and reference them with `staticFile()`.

## Pull requests

- Keep changes focused.
- Explain the learning or production problem being solved.
- Include screenshots or representative frames for visual changes.
- For publish-ready video changes, confirm the complete render was watched from beginning to end.
- Confirm licenses for new assets.
- Do not commit generated videos or temporary renders.
