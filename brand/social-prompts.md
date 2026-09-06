# Image generation prompts

Copy-paste prompts for generating the YouTube thumbnail and the vertical cover
cards. Both assume the brand files are attached to the conversation.

## What to attach

| File                  | What it is                                        |
| --------------------- | ------------------------------------------------- |
| `brand/cc-orange.svg` | The mark in brand orange, for light grounds       |
| `brand/cc-chalk.svg`  | The mark in chalk, for the near-black ground      |
| `brand/cc-ink.svg`    | The mark in near-black, one colour                |
| `out/brand/*.png`     | Rendered avatars and banners, if a reference help |

The mark is two angular C forms with square corners and flat terminals, offset
on a 5-across-2-down slope, never touching. It is one flat path. Nothing should
round it, bevel it, add a gradient to it or put it in a container.

## Type

| Role                        | Face           | Weights            |
| --------------------------- | -------------- | ------------------ |
| Logotype only               | Archivo        | 600, 700, 800      |
| Headlines and all UI text   | Inter          | 400, 600, 700, 800 |
| Numbers, code, array values | JetBrains Mono | 400, 500, 700      |

All three are on Google Fonts. Archivo is locked to the logotype and never used
for a headline.

## Colour

| Token        | Hex       | Use                                 |
| ------------ | --------- | ----------------------------------- |
| black        | `#050505` | The ground                          |
| blackSoft    | `#101113` | Panels on the ground, if any        |
| chalk        | `#E9E4D8` | Type and strokes on the dark ground |
| grayDark     | `#8A8B8F` | Labels, secondary type              |
| orange       | `#E4571B` | Brand accent on light grounds       |
| orangeBright | `#FF7A33` | Brand accent on the dark ground     |
| gain         | `#3FBF87` | A profit, and only a profit         |
| loss         | `#E8635D` | A loss, and only a loss             |
| buy          | `#4D9BFF` | A buy marker                        |
| sell         | `#EFC94C` | A sell marker                       |

Colour carries meaning. A frame with no trade in it has no green or red in it.

---

## Prompt 1: YouTube thumbnail

```text
Create a 1280x720 YouTube thumbnail. Flat 2D vector poster art, not a photo,
not a 3D render, no perspective, no depth.

GROUND
Solid near-black #050505, edge to edge. A single very soft radial lift toward
the centre, no more than 6% lighter at its brightest. No gradients anywhere
else, no vignette, no texture, no noise, no glow, no light rays, no bokeh.

LAYOUT, left 55% of the frame
Headline in Inter ExtraBold (800), colour #E9E4D8, tight letter-spacing around
-0.04em, line height 0.95, left aligned, starting 70px from the left edge and
optically centred vertically. Three lines, all caps off, sentence case:

  5 billion
  checks, or
  100,000

Set "5 billion" and "100,000" in JetBrains Mono Bold (700) instead, and colour
"100,000" #FF7A33. Cap height of the largest line must be at least 95px so the
whole thing survives being scaled to 210px wide.

LAYOUT, right 45% of the frame
A minimal line chart, flat vector, drawn in #E9E4D8 at 3px stroke on the black
ground. Six points at these relative heights, left to right: high, lowest,
mid-high, mid-low, highest, mid. Small filled circles at each point, 9px radius.
A thin horizontal axis line in #8A8B8F under the points. No grid, no axis
numbers, no labels, no shading under the line.
One curved arrow in #3FBF87, 4px stroke, arcing from the lowest point up to the
highest point, arrowhead landing on the highest point. This is the only green
in the image.

BRAND
Place the attached mark SVG (cc-chalk.svg) at the bottom left, 64px tall,
70px from the left edge and 54px from the bottom. Do not add the wordmark. Do
not put the mark in a box or circle.

FORBIDDEN
No human faces, no hands, no arrows pointing at the viewer, no circles or
rings around anything, no red overlay arrows, no drop shadows, no outer glow,
no bevels, no emoji, no stock photo elements, no "LeetCode" logo, no borders,
no rounded corner panels. Nothing should look like a slide template.

The whole image must read as one idea at 210x118 pixels.
```

Swap the three headline lines for the episode. Keep it to four words or two
numbers. If a line needs a fifth word it belongs in the title, not the
thumbnail.

---

## Which cover to generate

PS01 uploads horizontal, as four feed video posts rather than reels. So the
part covers are 16:9 at 1280x720, the same canvas as the YouTube thumbnail.

Use prompt 3 for those. Prompt 4 is the 1080x1920 version, for a future
episode that ships as native vertical cuts. Do not use it for a horizontal
upload: the platform will letterbox the video inside a portrait card and the
thumbnail will not match what plays.

## Prompt 3: horizontal part cover, one per part

```text
Create a 1280x720 cover image. Flat 2D vector poster art, not a photo, not a
3D render, no perspective, no depth.

GROUND
Solid near-black #050505, edge to edge. One very soft radial lift toward the
centre, no more than 6% lighter. No other gradient, no texture, no noise, no
glow, no vignette.

PART BADGE, top left
The word PART in Inter SemiBold (600), 26px, letter-spaced 0.3em, colour
#8A8B8F, left edge at x=70, baseline at y=86.
Directly under it, the number 01 in JetBrains Mono Bold (700), 92px, colour
#FF7A33, left aligned to the same x=70, baseline at y=176.

TITLE, left 55% of the frame
Inter ExtraBold (800), colour #E9E4D8, 76px, letter-spacing -0.04em, line
height 1.02, left aligned, left edge at x=70, block starting at y=270. Two or
three lines, taken from the per-part table below:

  Six prices.
  Five billion
  checks.

HERO, right 45% of the frame
A minimal flat line chart in #E9E4D8, 3px stroke, centred in that half. Six
points, left to right at these relative heights: high, lowest, mid-high,
mid-low, highest, mid. Filled circles at each point, 9px radius. A thin
horizontal axis line in #8A8B8F beneath. No grid, no numbers, no labels, no
shading under the line.
One curved arrow in #3FBF87, 4px stroke, arcing from the lowest point to the
highest point with the arrowhead landing on the highest point. This is the only
green in the image.

BRAND
Place the attached mark SVG (cc-chalk.svg) at the bottom left, 56px tall,
70px from the left edge and 48px from the bottom. No wordmark, no container.

FORBIDDEN
No faces, no hands, no emoji, no red arrows, no circles around anything, no
drop shadows, no glow, no bevels, no rounded panels, no borders, no play button
graphic, no platform logos, no progress bars.

The whole image must read at 400px wide.
```

For each part, change the number after PART and the three title lines. Nothing
else moves, so the four read as one series in a feed.

Title lines per part. Each one leads with the same idea its caption leads with,
so the cover and the text under it point at one thing rather than two.

```text
01   Six prices. / Five billion / checks.
02   Keep one / price.
03   Two numbers, / one pass.
04   Wrong answer, / no error.
```

An earlier version of this table read `01 Try every pair`, `03 One pass, two
numbers`, `04 What it cost`. Each of those named one act out of the two or
three in its part, and part 04's named the middle one rather than the hook. The
cover and the caption were arguing for different things in the same feed slot.

The problem name is not on any cover. It is in the part 01 caption and in the
YouTube title, and a cover that spends its largest type on a name the caption
directly beneath it already carries is a wasted cover.

## Prompt 4: vertical cover card, one per part

```text
Create a 1080x1920 vertical cover image for a short-form video. Flat 2D vector
poster art, not a photo, not a 3D render.

GROUND
Solid near-black #050505, edge to edge. One very soft radial lift toward the
centre, no more than 6% lighter. No other gradient, no texture, no noise, no
glow.

SAFE AREAS, treat as hard margins
Nothing but the ground in the top 190px or the bottom 420px.
Left and right margins 96px.
Below y=1000, keep everything left of x=930: the platform's like and share
column sits there.

PART BADGE, top of the safe area
The word PART in Inter SemiBold (600), 34px, letter-spaced 0.3em, colour
#8A8B8F, horizontally centred, baseline at y=250.
Directly under it, the number 01 in JetBrains Mono Bold (700), 132px, colour
#FF7A33, horizontally centred, baseline at y=390.

TITLE
Inter ExtraBold (800), colour #E9E4D8, 96px, letter-spacing -0.04em, line
height 1.05, centred, at most three lines, block centred at y=640:

  Best Time to
  Buy and Sell
  Stock

HERO, centred between y=900 and y=1400
A minimal flat line chart in #E9E4D8, 4px stroke, 900px wide, centred at
x=540. Six points, left to right at these relative heights: high, lowest,
mid-high, mid-low, highest, mid. Filled circles at each point, 11px radius. A
thin horizontal axis line in #8A8B8F beneath. No grid, no numbers, no labels.
One curved arrow in #3FBF87, 5px stroke, arcing from the lowest point to the
highest point with the arrowhead landing on the highest point.

BRAND
Place the attached mark SVG (cc-chalk.svg) horizontally centred, 78px tall,
with its bottom edge at y=1460.

FORBIDDEN
No faces, no hands, no emoji, no red arrows, no circles around anything, no
drop shadows, no glow, no bevels, no rounded panels, no borders, no progress
bars, no play button graphic, no platform logos.
```

For each subsequent part, change only the number after PART and, if the part
covers a different beat, the three title lines. Everything else stays identical
so the set reads as one series in a feed.

### Part numbering

Set the number in JetBrains Mono with a leading zero through 09, then drop it:
`01` through `09`, then `10`. A cover that reads `010` looks like a bug.

PS01 ships as four parts, so the set is `01` to `04`. The title lines change per
part; everything else on the card stays identical so the four read as one series
in a feed.
