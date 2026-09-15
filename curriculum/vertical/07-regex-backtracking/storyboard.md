# Storyboard

Fifteen seconds, three shots, one input.

## Shot 1, 0 to 6 seconds

Frame zero shows `WHY THIS REGEX FREEZES`, `^(a+)+$`, and `aaaaaX`. The teaching
block starts 80 pixels below the corner lockup instead of crowding it. Both plus
signs use the orange accent. The first attempt is already moving.

Four rows reuse the same five `a` characters with different boundaries:

```text
[aaaaa] X
[aaaa] [a] X
[aaa] [aa] X
[aaa] [a] [a] X
```

An orange cursor crosses each row, strikes `X`, and leaves the failed grouping
behind. The next row starts before the previous one disappears. This is the
retry loop the old tree assumed the viewer already understood.

Hero event: the same input gets a new split after every failure.

## Shot 2, 6 to 10 seconds

The input expands from 29 to 30 `a` characters. The added character lands in
orange. Two measured lanes resolve at 2 seconds and 4 seconds, then the `2.0×`
relationship lands below them.

The timing lanes are evidence for the mechanism from shot 1. They do not ask
the viewer to read an axis or decode a chart.

Hero event: one added character doubles the retry time.

## Shot 3, 10 to 15 seconds

The outer `+` leaves `^(a+)+$`. The now-unneeded parentheses leave with it, so
the visible pattern becomes `^a+$`.

The four failed grouping rows collapse into one line. One orange scan crosses
the same input, reaches `X`, and stops. The measured control time lands as
`0.0002 ms`. The line is labelled as a linear scan, not as zero backtracking.

Hero event: exponential retries collapse into linear work.

## Loop

The last 0.9 seconds rebuild frame zero. The linear result fades as the nested
pattern, opening headline, input, and first grouping return. Frame 449 matches
frame zero, including the first cursor position.

The audio stays silent across the boundary. The first cue starts four frames
into the next pass, so the restart has no click or repeated impact.

## Sound

Each failed grouping gets one reject cue. New attempts get a restrained send
cue. The added character gets an arrival and a landing. The rewrite gets one
dissolve, the collapsed path gets one settle, and the final scan ends with one
reject. The sustained scan source is trimmed to the visible scan.

There is no music bed. The loop bridge and replay boundary are silent.

## Colour

Orange marks the active cause or path: the two quantifiers, the current retry,
the added character, and the final single pass. Everything else stays neutral.
