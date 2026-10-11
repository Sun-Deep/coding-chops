# Learning notes

## Why the gaps add up

Each group that keeps a seat from strangers turns one free run into two
shorter ones with a single seat between. Do that across a room and most
free seats end up as runs of one, two or three. Nothing is wrong with any
one choice; the waste only shows when someone needs a long run.

## Fragmentation

A program asks for memory in blocks of different sizes and gives them back
in a different order. If the allocator places blocks with space around
them, the free memory ends up as many small holes. A large request can then
fail while plenty of memory is free in total. That is external
fragmentation.

## Packing

Allocators fight it by placing a block against existing ones (first fit,
best fit) so free space stays in large pieces, and garbage collectors
compact memory by moving blocks together. Sitting right beside whoever is
already there is the cinema version.

## The cost, and the twist

Packing means sitting beside a stranger from the start. Keeping gaps only
delays that: once the room is full, the single gaps are taken by strangers
anyway, so more people end up beside one, not fewer.
