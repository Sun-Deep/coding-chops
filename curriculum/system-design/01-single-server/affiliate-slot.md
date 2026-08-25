# Affiliate slot: episode 01

Status: ready, publishes with the episode

This slot follows [the affiliate and sponsor standard](../../../docs/affiliate-and-sponsor-standard.md).

**Publishing from a fork? Replace or delete the link below first.** It belongs to
one account. Publishing someone else's affiliate link as your own is fraud, not a
merge conflict.

## The arrangement

| Field    | Value                                                    |
| -------- | -------------------------------------------------------- |
| Program  | DigitalOcean affiliate program, run through AWIN         |
| Type     | Affiliate link. No sponsorship, no payment for the video |
| Link     | `https://tidd.ly/4gmpTWY`                                |
| Account  | The Coding Chops AWIN account                            |
| Created  | 2026-08-23                                               |
| Verified | 2026-08-23, redirect and click tracking                  |

The link is AWIN's shortened form. Its redirect was checked on 2026-08-23 and
expands to an AWIN tracking URL carrying DigitalOcean's merchant id, this
account's affiliate id, a per-episode click reference, and a destination of
`digitalocean.com/products/droplets`.

The expanded URL is not reproduced here. It contains the affiliate id, and an
affiliate id sitting in a public repository is an invitation to have your
traffic poisoned by someone else and your account suspended for it. Read it from
the AWIN dashboard when you need it.

Every episode gets its own click reference, so reporting can tell which video
produced a signup. This one is `sd01-single-server`.

A test click on 2026-08-23 registered in AWIN against Digital Ocean Affiliate, so click attribution works. Whether AWIN stores the clickref is still unconfirmed.

The original plan was to check that on the first real transaction. That plan has a hole in it. A first transaction on a new channel may be months away, or may not arrive at all, and episode 02 should not ship blind while waiting for an event that might never happen.

So the question to answer is narrower and answerable now. Does the clickref appear anywhere in AWIN's click-level reporting, not just on transactions? Look before assuming it does not.

If it is missing there, per-episode attribution does not have to come from AWIN at all. Point each episode's description at a redirect you own, and forward that to the affiliate link. Your own redirect counts the clicks per episode whatever AWIN records, and AWIN only has to attribute the sale, which the test click already proved it does.

Worth being honest about the scale of the problem. At a few clicks a month, knowing which episode produced them changes no decision. This matters once there is enough traffic for the answer to be actionable, and not before. Do not build the redirect until then.

Do not swap this for an `m.do.co/c/<code>` URL. That is DigitalOcean's free referral program, it pays account credit rather than commission, and it would make the narration false.

## Program facts, checked 2026-08-23

DigitalOcean runs two separate programs, and they pay differently. Confirm which one your link belongs to before locking narration.

### Referral program

Link format `m.do.co/c/<code>`, taken from the control panel under Settings, then Referrals. No application.

The referrer receives 25 dollars in DigitalOcean account credit once the referred user spends and pays 25 dollars. DigitalOcean's docs state plainly that you cannot receive referral credit as cash or transfer it to another team. There is no cap, and the program is not supported for teams inside an organization.

### Affiliate program

Runs through AWIN and requires an application. It pays 10 percent of the referred user's monthly spend, every month, for a year. That is money, not credit.

### What the viewer gets

DigitalOcean's own pages disagree. The billing docs say a new team gets an automatic 5 dollar signup credit that expires after 90 days. DigitalOcean's referral badge blog post says a user signing up through a referral link gets 200 dollars of credit for 60 days.

Observed on this account on 2026-08-24: the control panel shows a signup credit of 5 dollars, not 200. That matches the billing docs and not the blog post.

So the 200 dollar figure is a promotional offer that varies, and it is not what a viewer signing up through this link necessarily gets. Do not say it. If any number is ever spoken, check the live offer first and follow section 6 of the standard.

Droplets start at 4 dollars a month. A 2 vCPU, 4 GB, 120 GB configuration quotes 32 dollars a month, or about 5 cents an hour. Both figures will move, which is exactly why the narration stays price-free.

### Sources

- https://docs.digitalocean.com/platform/teams/how-to/refer-others/ referral terms and the cash restriction, accessed 2026-08-23
- https://docs.digitalocean.com/platform/billing/signup-credit/ the 5 dollar, 90 day signup credit, accessed 2026-08-23
- https://www.digitalocean.com/affiliates 10 percent monthly for 12 months through AWIN, accessed 2026-08-23
- https://www.digitalocean.com/blog/powered-by-digitalocean-referral-badge the 200 dollar, 60 day figure, accessed 2026-08-23

## Why this product fits this lesson

The lesson teaches one machine running an application process and a database side by side, then asks what to do when that machine runs out of room.

A DigitalOcean Droplet is one virtual machine rented by the hour. It is the cheapest way for a beginner to hold the thing the video just described. Resizing it is the same vertical scaling move the next chapter explains.

The recommendation survives the honesty test in the standard. If the referral program disappeared tomorrow, the lesson would still tell a beginner to rent one small virtual machine and put both processes on it.

## Placement

Insert as segment 05b, between the queueing failure in section 05 and the scaling decisions in section 06. That lands near 70 percent of the runtime, at a hard chapter seam, and hands straight back into the lesson.

The segment ends by setting up vertical scaling, so the viewer loses nothing by watching it.

Budget was 22 seconds. The recorded take runs 29.8 seconds and lands at 67 percent of an 8:47 runtime, so it stays inside the placement window in section 4 of the standard. Hard cut in, hard cut out.

## Narration

Lock this with the rest of the narration. Do not paraphrase it in the booth.

The same words appear as section 05b in `script.md`. Change them in both files or in neither.

> Quick disclosure before we fix this.
>
> The DigitalOcean link in the description is an affiliate link. If you sign up through it, I earn a commission and it costs you nothing extra. Nobody there paid for this video or read the script.
>
> A Droplet is one virtual machine, rented by the hour. It runs the application process and the database side by side, exactly the setup we just drew.
>
> Which matters, because of what we are about to do to it.

The sentence about nobody paying was confirmed true on 2026-08-23. Delete it if that ever changes. Do not soften it, do not move it later, and do not read it faster than the rest of the segment.

## Visual

Hero object: the same machine from sections 05 and 06. It does not move, change color, or gain a border for this segment.

Type: `DigitalOcean` set in Inter at explanation scale, not hero scale. `Droplet` gets the hero treatment, because that is the word doing the teaching.

No logo. No console recording. No signup flow. No pricing card.

Canvas stays warm paper. No cut to near-black.

### On-screen disclosure

A single editorial note holds for the whole segment, all 29.8 seconds of it.

- Text: `AFFILIATE LINK · I EARN A COMMISSION`
- Monospaced system font, 18px horizontal and 20px vertical, gray `#74767B`
- Anchored top left, well clear of the caption band
- Appears on the first frame of the segment and cuts with it

This is the scoped exception in section 3 of the standard. It is the only persistent on-screen text allowed in the episode, and it exists because the spoken disclosure alone does not reach a muted viewer.

## Description block

Line one has to survive YouTube's truncation, so the disclosure goes first and stays short. This is what was published, at 124 characters on line one.

```text
Affiliate disclosure: I earn a commission if you sign up to DigitalOcean through the link below. It costs you nothing extra.

Rent one server: https://tidd.ly/4gmpTWY

Open a photo app and a photo appears. In between, a request leaves your phone, a program reads it, a database answers, and the reply comes back. This video follows that one request the whole way, on one server, and nothing else.

No load balancers, no caches, no queues. I left them out on purpose. They make sense once you can see the problem they fix, and not before.

Then the part the diagrams skip. Is one server enough? The honest answer is that 10,000 users tells you nothing. 10,000 accounts can be easy if hardly anyone opens the app. A hundred people uploading photos at once can be hard.

Chapters
00:00 Start with one request
00:43 What one server means
01:47 Follow the request there and back
03:03 What the server spends
04:35 When requests begin to wait
05:47 Affiliate disclosure
06:17 The first scaling decisions
07:41 The question before the diagram

The animations are code. Each one lands on the frame its word is spoken, so the picture and the sentence never drift apart. All of it is open: https://github.com/Sun-Deep/coding-chops

#SystemDesign #BackendDevelopment #SoftwareEngineering
```

Chapter times are measured from `narration.ts`, not estimated. Re-derive them after any edit that changes a scene length.

The disclosure is not a sponsorship. Do not write "sponsored by" anywhere in the description.

## Pinned comment

```text
Affiliate disclosure. The DigitalOcean link is an affiliate link, so I earn a commission if you sign up through it and it costs you nothing extra. No money changed hands for this video and nobody at DigitalOcean saw it first.

If you want to follow along on one real machine: https://tidd.ly/4gmpTWY

A Droplet is one virtual machine. Put the application process and the database on it, the way the video draws it, and you have the whole system in this lesson.
```

## YouTube upload settings

Set the paid-promotion box to match the truth of the arrangement.

You joined AWIN and agreed to its terms, so a commercial relationship exists on paper even though nobody paid for this video. That is enough reason to check the box. It costs a small banner in the first seconds and it removes any argument about whether the relationship was hidden.

If DigitalOcean ever pays for a placement or hands over credit, the box stops being optional.

## Slot checklist

- [x] Real AWIN affiliate URL replaces the placeholder in every location above
- [x] The URL came from the AWIN dashboard, not the control panel referrals page
- [x] Link opens in a private window, lands on DigitalOcean, and registers in AWIN
- [ ] Clickref located in AWIN's click reporting, or a redirect you own put in front of the link instead. Only worth doing once click volume makes the answer actionable
- [x] Narration matches this file word for word
- [x] On-screen disclosure covers the whole segment and never overlaps a caption
- [x] Description line one is under 140 characters and appears before the link
- [x] Pinned comment posted and pinned
- [x] Paid-promotion setting is checked
- [x] No price, credit amount, or competitor comparison appears anywhere
- [x] The live signup offer was checked before publication if any number is spoken. No number is spoken, so nothing to check
- [x] Chapter timestamps rechecked after the edit adds gaps between scenes
