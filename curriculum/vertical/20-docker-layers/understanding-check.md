# Understanding check

The creator gate. Answer each without the notes, the script or the render.

- [ ] Say what decides whether a Dockerfile step comes from the cache.
- [ ] Explain why a change to server.js makes `npm ci` run again in the code-first file.
- [ ] Explain why the same change leaves `npm ci` cached in the packages-first file.
- [ ] Say what does make the install run again in the packages-first file, and why that is correct.
- [ ] Say how many packages were reinstalled and what the rebuilt layers weigh in each case.
- [ ] Explain why a README edit costs the same as a code edit in the code-first file.
- [ ] Say why the frame shows 4.37 MB and not the exact byte count.
- [ ] Explain why the script writes a per-run `.build-id`, and what went wrong without it.
- [ ] Say why the script does not clear Docker's build cache to get a clean run.
- [ ] Explain what this reel is testing about the page, and what result would mean what.
