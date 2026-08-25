# Coding Chops affiliate and sponsor standard

This document controls how paid links and paid mentions appear in Coding Chops videos, descriptions, and repository files. It sits under [the video production standard](video-production-standard.md) and does not override it.

The channel teaches beginners. A viewer who cannot yet tell a good tool from a bad one is exactly the viewer most likely to buy on our word. That is the reason for every rule below.

## 1. What we will and will not take money for

We accept affiliate commissions and sponsorships only for a product the lesson would already mention if no money existed.

We do not accept money to:

- add a component to an architecture that the requirements do not justify
- change a technical recommendation
- remove a limitation, cost, or failure mode from the script
- review a script before publication

If a company asks for script approval, the answer is no. Say so and walk.

## 2. Naming the relationship correctly

Use the word that matches the actual arrangement. Do not upgrade it for flattery or downgrade it to sound independent.

An affiliate link pays a commission when a viewer signs up. Nobody commissioned the video. Call it an affiliate link.

A sponsorship means the company paid for the placement. Call it a sponsorship, and check the paid-promotion box on YouTube.

A free account, credit, or hardware is value received. Disclose it in the same breath as the recommendation, even when no cash changed hands.

Never say "sponsored by" for a plain affiliate link. That claim is false and it is the kind of thing viewers check.

## 3. Disclosure contract

Every paid link needs all four of these. Any one of them alone is not enough.

### Spoken

The disclosure is spoken before the recommendation, not after it, and not at the end of the video. Use plain words. "This is an affiliate link and I earn a commission" beats any softened version of the same sentence.

### On screen

A disclosure line stays visible for the entire paid segment. It does not fade in for two seconds and leave.

Format it as an editorial note in the monospaced system font, quiet gray, placed away from the caption band so it cannot read as a second subtitle line. This is a scoped exception to the rule against persistent on-screen text, and it applies only to paid segments.

### Description

The disclosure sits in the first three lines of the description, above the fold, before the link appears. YouTube truncates the description, so a disclosure below the truncation point has not been made.

### Pinned comment

Pin a comment repeating the disclosure and the link. Viewers read comments before they read descriptions.

## 4. Where a paid segment can sit

Put the paid segment at a chapter seam where it hands back into the lesson, around 60 to 75 percent of the way through. Cut in hard, cut out hard, and let the viewer feel both edges.

Do not put a paid segment in the first 60 seconds. Do not put one immediately before the closing payoff, because the payoff is what the viewer stayed for.

Keep it under 30 seconds in a lesson under 12 minutes.

The segment must connect to the concept on screen. If the only link is that both involve computers, cut the segment.

## 5. Visual rules for a paid segment

The palette, typography, canvas, and motion rules do not relax for money.

Set the company name in Inter like any other word in the video. Do not show a company logo. Do not show a product dashboard, console recording, or signup flow, because those break the visual language and date the video within a year.

Keep the hero object from the surrounding shots. A paid segment that reuses the machine, request, or record already on screen costs the viewer nothing to follow.

## 6. Claims we are allowed to make

State only what stays true for years and what a viewer can verify in a minute.

Safe: what the product is, what unit it sells, and how it maps to the concept being taught.

Unsafe: prices, free credit amounts, performance numbers, and comparisons against named competitors. Prices change and the video does not.

If a price genuinely helps the lesson, say the date out loud and put the same date on screen.

## 7. Repository policy

This repository is public and MIT licensed, so anyone can fork it.

Keep every real affiliate link in one file per episode, named `affiliate-slot.md`. Do not scatter links through scripts, compositions, or the README.

Record the program name, the account the link belongs to, the date it was created, and the disclosure text approved for that episode.

Anyone publishing from a fork must replace or delete those links. Publishing someone else's affiliate link as your own is fraud, not a merge conflict.

## 8. Release checklist for a paid episode

- [ ] The recommendation is one the lesson would make for free
- [ ] The relationship is named accurately, affiliate or sponsorship
- [ ] Spoken disclosure lands before the recommendation
- [ ] On-screen disclosure covers the whole segment
- [ ] Disclosure appears in the first three description lines, before the link
- [ ] Pinned comment is written and ready to post
- [ ] YouTube paid-promotion setting matches the real arrangement
- [ ] The segment sits at a chapter seam and hands back into the lesson
- [ ] No logo, console recording, or dashboard appears
- [ ] Every product claim is verifiable and free of prices
- [ ] The link resolves to the right account and the right landing page
- [ ] The link is recorded in the episode's `affiliate-slot.md`
