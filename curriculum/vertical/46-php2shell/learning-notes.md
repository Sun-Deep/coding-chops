# Learning notes

## What it is

Two bugs in PHP itself, not in WordPress or any other app. One request,
no login, and the attacker's code runs with the web server's account.
Rated 9.2 of 10.

## The out-of-memory flaw (CVE-2026-109618)

Before your PHP code runs, PHP builds the request: it unpacks form fields
and file uploads into memory. A crafted multipart upload can make it run
out of memory partway through, even inside the configured size limits.
PHP stops by jumping straight out (longjmp), leaving some request data
only half set up. On Apache mod_php the cleanup step still runs and reads
that half-built data as if it were valid. That corrupted memory is what
the demonstrated exploit turns into running code, all before the site's
own code starts.

## The stale-state flaw (CVE-2026-109619)

A PHP worker serves many requests in turn. Some global state can still
point at memory that was freed when an earlier request ended, and a later
request on the same worker uses it before it is reset: a use after free.
Confirmed through session upload progress (on by default) and PHP 8.5's
fatal error backtraces.

## Who was at risk

Every PHP serving web requests: PHP-FPM, mod_php, php-cgi, FrankenPHP,
LiteSpeed. Highest on mod_php. PHP 8.1 and older get no official release,
only source patches; 7.3 and older none.

## Being safe

Update PHP to 8.5.12, 8.4.27, 8.3.36 or 8.2.35 (or your distribution's
patched package) and restart every worker. Check the version the web
server runs, not just `php -v` on the command line. If you cannot update
yet, PHP lists stopgaps (memory_limit=-1 set by the admin,
session.upload_progress.enabled=0, a lower post_max_size, request limits
at the proxy, a WAF) and says none is complete; CISA says take the site
offline. Then look for signs of compromise from 17 October on.
