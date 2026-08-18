# Coding Chops

An open-source visual curriculum for learning System Design, Data Structures and Algorithms, and Problem Solving from first principles.

The project follows one non-negotiable publishing rule:

> A lesson is not ready because the animation looks good. It is ready when the creator can explain, draw, evaluate, and apply the concept without relying on the script.

## Current status

The repository is in pilot development. Episode 1 compositions are visual prototypes and are **not publish-ready lessons**. The educational script must pass the understanding gate before release.

## System Design pilot

| Episode | Lesson                                                 | Status                        |
| ------- | ------------------------------------------------------ | ----------------------------- |
| 01      | How a Web Application Works on One Server              | Learning and visual prototype |
| 02      | How System Designers Discover Requirements             | Planned                       |
| 03      | Back-of-the-Envelope Estimation for Beginners          | Planned                       |
| 04      | Vertical Scaling vs Horizontal Scaling                 | Planned                       |
| 05      | Stateless Servers: The Secret to Horizontal Scaling    | Planned                       |
| 06      | Load Balancers Explained                               | Planned                       |
| 07      | Database Indexes: Making Reads Fast                    | Planned                       |
| 08      | Cache-Aside Explained                                  | Planned                       |
| 09      | Choosing a Database from Access Patterns               | Planned                       |
| 10      | Design a URL Shortener: Beginner Interview Walkthrough | Planned                       |

See [the System Design curriculum](curriculum/system-design/README.md) for the learning sequence and gates.

## Formats

Each approved lesson can produce:

- One horizontal YouTube master
- Three independently scripted vertical micro-lessons
- One thumbnail composition
- Learning notes, sources, understanding checks, script, and storyboard

Vertical videos are not automatic crops. They reuse the visual language while using their own hook, pacing, framing, and teaching objective.

## Quick start

Requirements:

- Node.js 22
- npm 10 or newer

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm run check
npm run compositions
npm run render:thumbnail
npm run render:short:hook
```

## Repository map

```text
curriculum/                 Learning notes, sources, scripts, and storyboards
docs/                       Production and visual-language contracts
public/                     Redistributable static assets used through staticFile()
scripts/                    Repository validation scripts
src/shared/                 Brand, primitives, layouts, and video utilities
src/tracks/                 Track and episode compositions
```

## Retention experiments

The first short-form baseline produced high early abandonment. That result is treated as a hypothesis generator, not proof that any single factor caused the outcome.

For each short, record:

- The exact first frame
- Spoken and on-screen hook
- Time until the first useful answer
- Visual changes during the first five seconds
- Three-second and five-second retention
- Average watch time and completion rate
- Shares, saves, profile visits, and outbound clicks

See [the retention experiment template](curriculum/templates/retention-experiment.md).

The production workflow is defined in [the video production standard](docs/video-production-standard.md). The visual identity is defined in [the visual-language contract](docs/visual-language.md).

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before proposing code or curriculum changes. Official lessons require sources, an understanding check, and editorial review.

## Licensing

- Source code is licensed under the [MIT License](LICENSE).
- Curriculum text and original diagrams are licensed under [CC BY 4.0](CONTENT-LICENSE.md).
- The Coding Chops name and logo are not granted under either license.
- Third-party assets retain their original licenses.
- Remotion has separate licensing terms. Users are responsible for checking the terms that apply to them.
