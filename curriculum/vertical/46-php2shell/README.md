# Vertical 46: PHP2Shell

Status: built, not posted

## What it claims

Two critical flaws in PHP itself, CVE-2026-109618 and CVE-2026-109619
("PHP2Shell"), both rated 9.2 (CVSS v4.0), let one HTTP request with no
login run the attacker's code on the server. On Apache mod_php the
demonstrated attack runs before any of the site's own code. Every PHP
install serving web requests was exposed, governments took sites offline
as a precaution, and the fix is updating PHP to 8.5.12, 8.4.27, 8.3.36 or
8.2.35, released 21 October 2026.

## Why this topic

The creator asked for it: news people are seeing, with nobody explaining
what actually happened. Code-adjacent and current, for the page's coding
audience.

## How the reel is built

News first, then the mechanism, then what to do. It opens on what viewers
saw in the headlines: a field of servers with four named government sites
(Netherlands, Finland, France, Denmark) switching off, and the timeline:
17 October first attack seen, 20 October details leaked, 21 October PHP
fixed it. Then it dives into one server for the how, and ends on three
steps: check your PHP version, update PHP itself, and if you can't, take
the site offline.

The close-up follows CVE-2026-109618, the out-of-memory flaw, because it
is the one with a demonstrated pre-application exploit and the one that
can be drawn: a crafted upload request (multipart) is unpacked into
memory, PHP runs out of memory partway, and request cleanup then trusts
data that was only half initialised. The cleanup bar stops on the
half-built part and the camera closes on it, so the cause is the thing
on screen when the takeover starts. The picture is a simplification:
memory is not a grid of slots, and the step from corrupted memory to
running code is not shown because no source describes it publicly. The
second flaw (stale state reused between requests) is counted ("2 flaws
in PHP") but not drawn.

## Scope and honesty

Every figure is from a source read on 23 October 2026, listed in
`src/vertical/46-php2shell/facts.ts`. Nothing is measured on this machine,
which is a deliberate exception for a news cut: there is nothing to
measure without running an exploit, and the reel does not do that.

"Every PHP server on the web was exposed" is PHP's own wording: "all PHP
installations serving web requests". The field of servers is an
illustration, not a count. The four named sites are from the reporting;
which other servers go dark is random, seeded, not data. They were
switched off by their owners as a precaution, and the reel says so.

69% is W3Techs's share of websites whose server-side language is known,
as quoted by Tenable (69.3%); other outlets give 70% to 75%.

Exploitation: Amazon saw an attempt on 17 October; watchTowr saw
exploitation in the wild on 21 October; on 22 October Rapid7 said public
proofs of concept were not broadly reliable. The reel does not claim mass
compromise, only exposure and attacks.

## Files

- `src/vertical/46-php2shell/`: the sourced facts, overlays and reel
- `scripts/blender/php/`: the server, the field and the render
