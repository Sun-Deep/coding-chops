/**
 * What the reel states about PHP2Shell, each with where it comes from.
 *
 * This cut reports news rather than a measurement, so its figures are the
 * sources' own, read on 23 October 2026. Nothing here is a plausible
 * stand-in: if a source changes, the figure changes with it.
 */

export const SOURCES = {
  php: "https://www.php.net/archive/2026.php (21 Oct 2026)",
  oom: "https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w",
  stale:
    "https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp",
  cisa: "https://www.cisa.gov/news-events/alerts/2026/10/21/critical-vulnerabilities-php-require-immediate-patching",
  rapid7:
    "https://www.rapid7.com/blog/post/etr-cve-2026-109618-and-cve-2026-109619-critical-unauthenticated-remote-code-execution-in-php/",
  tenable:
    "https://www.tenable.com/blog/php2shell-cve-2026-109618-cve-2026-109619-frequently-asked-questions-about-critical-php-remote",
  wiki: "https://en.wikipedia.org/wiki/PHP2Shell",
} as const;

export const FACTS = {
  name: "PHP2Shell",
  /** php.net and both GitHub advisories. */
  cves: ["CVE-2026-109618", "CVE-2026-109619"],
  /** "both rated CVSS v4.0 9.2" (php.net, 20 Oct). */
  severity: 9.2,
  /** "unauthenticated remote code execution" (php.net, 21 Oct). */
  login: false,
  /** Highest risk on mod_php, "before any application code runs" (php.net). */
  beforeAppCode: "Apache mod_php",
  /** "all PHP installations serving web requests" (php.net). */
  affected: "every PHP serving web requests",
  /** The four releases of 21 Oct 2026 (php.net). */
  fixed: ["8.5.12", "8.4.27", "8.3.36", "8.2.35"],
  released: "21 Oct 2026",
  /** No official release for 8.1 and older; source backports only (php.net). */
  oldest: "8.1",
  /** 69.3% of sites whose server-side language is known, W3Techs (Tenable). */
  share: 69.3,
} as const;

/**
 * When: from the reporting. Amazon saw an exploitation attempt on its
 * honeypots on 17 October (Tenable, Wikipedia); details leaked on 20
 * October (Tenable, Wikipedia); PHP released the fix on 21 October
 * (php.net).
 */
export const TIMELINE = [
  { day: "17 Oct", what: "first attack seen" },
  { day: "20 Oct", what: "details leaked" },
  { day: "21 Oct", what: "PHP fixed it" },
] as const;

/**
 * Government sites taken offline as a precaution, named on Wikipedia's
 * PHP2Shell page (following CERT-EU and UK NCSC advice) and in CNBC's
 * reporting of 21 October. Switched off by their owners, not hacked.
 */
export const OFFLINE = [
  { country: "Netherlands", site: "overheid.nl" },
  { country: "Finland", site: "government services" },
  { country: "France", site: "Interior Ministry" },
  { country: "Denmark", site: "school platform" },
] as const;

/**
 * What to do, from php.net ("updating is the only safe choice") and CISA
 * (anyone who cannot update should "take PHP-based systems offline").
 * The check is the PHP the web server runs, which can differ from the
 * command line's (watchTowr).
 */
export const STEPS = [
  {
    title: "Check your PHP version",
    detail: "the one your web server runs, or ask your host",
  },
  { title: "Update PHP itself", detail: FACTS.fixed.join(" · ") },
  { title: "Can't update yet?", detail: "take the site offline until you can" },
] as const;

export const CONDITIONS = `php.net advisory · ${FACTS.released}`;
