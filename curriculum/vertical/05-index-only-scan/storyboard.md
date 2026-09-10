# Storyboard

Thirty seconds, 900 frames at 30 fps, five shots, no hook card. The copy is in
`script.md` and the figures are in `src/vertical/05-index-only-scan/
measurements.ts`.

## The spine

One question asked three times: does Postgres open the table.

```text
shot 1   yes, across most of it        69,211 pages
shot 2   no, not once                     281 pages
shot 3   yes again, and nothing changed 70,103 pages
```

The hero of each of the first three shots is the table lighting up or staying
dark. That is the visual event carrying the idea, it is different in each, and
it is the reason the cut does not need a card to state the claim.

## Shot map

```text
shot 1   the index that still reads the table     0 to 230    230f   7.7s
shot 2   the covering index                     230 to 430    200f   6.7s
shot 3   the catch                              430 to 620    190f   6.3s
shot 4   verdict                                620 to 770    150f   5.0s
shot 5   end card                               770 to 900    130f   4.3s
```

## Shot 1. The index that still reads the table

The table is a field of tiles, one per page, running the full 1080 of horizontal
bleed and standing between the reserves. The query and the `CREATE INDEX` hold
at the top.

The index object sits small at the left and lights briefly: 88 page reads, done
almost instantly. Then the fetches start, and tiles light up all over the field
rather than in a band. The counter climbs to 69,211 of 123,457.

The hero is the field going bright across its whole span while the index sits
there having already finished. That contrast is the shot: the index did its job
in 88 reads and the query still cost 69,211.

Receipts carry `correlation 0.006` and the recheck count, because the number has
two causes and the cut names both.

## Shot 2. The covering index

Same field, same query, same position on screen, so the comparison is the point
and the layout may repeat. This is the one place two shots share a layout.

The index object is visibly taller now, and it is the only thing that lights.
281 tiles of it. The table field stays dark for the whole shot and the counter
stops at 281.

The hero is the absence: the field never lights. Nothing crosses it.

## Shot 3. The catch

The `UPDATE` runs and 100,000 tiles go stale across the field, drawn as the
visibility bit clearing rather than as the rows changing, because the rows are
not the point.

Then the same query runs again and the field lights up exactly as it did in shot
one. The counter goes 281 to 70,103.

The hero is the light coming back. The viewer has just spent seven seconds
learning that the table stays dark, and it does not.

## Shot 4. Verdict

Three lanes, pages and time. The sequential scan row is VR01's number and
appears here only, so the two cuts join up without this one re-teaching it.

`246x` set large, on the accent.

## Shot 5. End card

The cost, following VR01. The index size, and the contiguous lane as a receipt
so the 246x is not left sounding general. Then the lockup.

## Colour note

One accent, from `palette.ts`, and it belongs to the covering index. The plain
index and the table field are the neutral greys. Shot 3 is the exception: when
the field lights up again it uses the same treatment shot 1 used, not the
accent, because it is the old behaviour returning rather than a new state.

## Cue map

Deferred to step 6. Effects only, no music, roughly one cue every second and a
half, levels per section 11 of the standard. The three events that must land are
the fetches starting in shot 1, the silence where shot 2's fetches would be, and
the field relighting in shot 3.

## Safe areas

Every shot puts a counter and a payoff line in the narration band, so
`Vertical-Safe-Area` has to be overlaid on a frame from all five before this is
believed. The tile field runs the full width and stands between 190 and 1500,
with no tile root in the header band and no value-carrying tip under the caption.
