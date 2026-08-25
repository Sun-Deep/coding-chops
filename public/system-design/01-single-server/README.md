# Episode 01 cover art

## thumbnail-base.png

| Field    | Value                                                       |
| -------- | ----------------------------------------------------------- |
| Use      | Background plate for the `SD01-Thumbnail` still             |
| Origin   | Generated image, not a photograph and not third-party stock |
| Contains | The crowd, the request, and the server                      |
| Headline | Not baked in. Set in Remotion, in `Thumbnail.tsx`           |

Record the generator and the date here when the plate is replaced, the way
`public/music` and `public/sfx` record theirs. The point of those notes is that
a public repository should never contain an asset whose licence nobody can
reconstruct a year later.

## Why the headline is not part of the image

The type is set in the composition rather than baked into the plate, so the
copy stays under version control. It can be re-typeset, repositioned, or
corrected by editing a component and re-rendering, with no regeneration
involved and no risk of a different picture coming back.

That split is what makes a cover reproducible. Regenerating the plate gives a
different image every time; re-rendering the still gives the same cover with
the same words in the same place, which is what a series needs in order to look
like a series.

## Sizing

The still is 1280 by 720. The only size that decides anything is 168 by 94,
which is roughly what a thumbnail occupies in a phone feed. Check the headline
at that size before replacing anything:

```bash
npm run render:thumbnail
```

```bash
ffmpeg -i out/sd01-thumbnail.png -vf scale=168:94 /tmp/feed-size.png
```
