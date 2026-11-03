# Third-party assets

Downloaded on demand and kept out of Git (`third_party/*/` in `.gitignore`).

## quaternius-characters

Quaternius, Ultimate Animated Character Pack (November 2019), glTF files.
Licence: CC0 1.0 Universal, public domain dedication. Used by the Blender
scenes in `scripts/blender/`.

Files used: Casual_Male, Casual_Female, Casual2_Male, Casual2_Female,
Casual3_Male, Casual3_Female, Casual_Bald, Suit_Male, Suit_Female (and
OldClassy and Worker, downloaded but not used). Source: the pack's glTF
folder on Google Drive, linked from quaternius.com/packs/ultimatedanimatedcharacter.html.

## osm-nyc

OpenStreetMap extract around Manhattan, downloaded 3 November 2026 through
the Overpass API. Licence: ODbL; every reel that shows it credits
"© OpenStreetMap contributors" in its caption. Used by
`scripts/measure-delivery-route.mjs` and `scripts/blender/manhattan/`.

- `streets.json` (53 MB, snapshot 2026-11-03T08:28Z): ways tagged highway
  trunk, primary, secondary, tertiary, unclassified, residential,
  living_street, cycleway and the link roads, in the box 40.685,-74.115 to
  40.940,-73.780, with geometry. The box reaches 13.8 km from Harlem in every
  direction, further than the 13.2 km route, so Dijkstra's count is not cut
  off by it.
- `buildings.json` (121 MB, snapshot 2026-11-03T07:56Z): every way tagged
  building in the box 40.690,-74.022 to 40.882,-73.905, tags and geometry.
  162,242 footprints, 122,227 with a height or level count. Drawn only;
  no number comes from it.
