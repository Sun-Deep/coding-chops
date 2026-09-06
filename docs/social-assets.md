# Social assets

Every profile and cover image is a Remotion still, so the sizes live in code and
a change to the mark re-renders all of them. Render with:

```bash
npm run render:brand
```

Output lands in `out/brand/`, which is not committed.

## Sizes

Checked against each platform's current guidance in September 2026. Where a
platform publishes a safe area, the layout is driven by that rather than by the
canvas, because every one of these crops differently.

| Asset             | Upload      | Ratio  | Safe area  | Crop                                                  |
| ----------------- | ----------- | ------ | ---------- | ----------------------------------------------------- |
| YouTube avatar    | 800 x 800   | 1:1    | centre     | circle                                                |
| YouTube banner    | 2560 x 1440 | 16:9   | 1546 x 423 | phone shows the safe area, television shows all of it |
| X profile         | 400 x 400   | 1:1    | centre     | circle                                                |
| X header          | 1500 x 500  | 3:1    | 1200 x 360 | avatar covers the lower left on desktop               |
| Facebook profile  | 1080 x 1080 | 1:1    | centre     | circle                                                |
| Facebook cover    | 1640 x 624  | 205:78 | 1280 x 480 | mobile trims the sides, avatar covers the lower left  |
| Instagram profile | 1080 x 1080 | 1:1    | centre     | circle                                                |

Facebook's own recommendation is 820 x 312. The file here is exactly twice that,
which keeps the ratio and holds up on a retina display.

Instagram and Facebook profiles render at 1080 rather than the 320 Instagram
asks for, for the same reason. Every platform downsamples; none of them
upsample.

## Why the avatar is the mark alone

At the size a feed actually renders an avatar, between 32 and 110 pixels, a
wordmark is unreadable. The mark is set to 60 percent of the width, which puts
the corners of its bounding box at 0.38 of the width from the centre, inside
the 0.5 the circular crop allows.

Near black ground rather than orange, because the avatar has to hold its own in
a column of mostly white ones.

## Sources

- [YouTube banner size and safe area](https://www.b2w.tv/blog/youtube-banner-size-guidelines)
- [YouTube profile picture size](https://www.imagine.art/blogs/youtube-profile-picture-size)
- [X header and profile sizes](https://socialsizes.io/twitter-cover-photo-size/)
- [Facebook cover photo size and safe zone](https://socialsizes.io/facebook-cover-photo-size/)
- [Instagram profile picture size](https://socialsizes.io/instagram-profile-picture-size/)
