# Understanding check

The creator gate. Answer each without the notes, the script or the render.

- [ ] Say what a commit stores for a file you changed one line of, and why it is not the diff.
- [ ] Explain what a blob is and why changing one byte makes a new one.
- [ ] Say why the two loose copies are each about 5,100 bytes and not 10,240.
- [ ] Explain why 159 identical lines are paid for twice before packing.
- [ ] Say what `git diff` is computed from, and whether git stored it.
- [ ] Explain what `git gc` does to the two copies.
- [ ] Say which copy stays whole after packing and which becomes the delta, and why git chooses that way round.
- [ ] Explain what the 68-byte delta contains, and how git rebuilds the old version from it.
- [ ] Say what else triggers packing besides running `git gc` yourself.
- [ ] Explain why the object ids in this cut reproduce on another machine.
