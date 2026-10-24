#!/usr/bin/env node
/* global console, process, setTimeout */

// Two people buy the last ticket, raced 1,000 times on real Postgres.
//
// Starts a throwaway Postgres cluster in a temp directory. Each race is one
// show with one seat left and two buyers, each a separate psql session. A
// buyer reads how many seats are left; if one is, the app spends 50 ms on
// the payment, then takes the seat and writes a ticket. The two buyers tap
// within 0.2 s of each other, a seeded random gap for each race, and both
// sessions wait on the database clock so the gap is real.
//
// Run twice: once reading with a plain SELECT, once with SELECT ... FOR
// UPDATE, which locks the row so the second buyer waits for the first to
// finish. The same gaps are used both times. Counted: races where the seat
// was sold twice, and where seats_left went below zero.
//
// Then checks src/vertical/47-last-ticket/measurements.ts and exits 1 if a
// plain run falls outside the recorded band, if FOR UPDATE ever sells twice,
// or if the race the reel plays did not sell twice. Needs PostgreSQL 15 (PG_BIN, default Homebrew postgresql@15).
//
// Usage: node --experimental-strip-types scripts/measure-last-ticket.mjs

import { execFileSync, spawn, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const RACES = 1000;
const PAYMENT_MS = 50;
const SPREAD_MS = 200;
const BATCH = 25;

const BIN = process.env.PG_BIN ?? "/opt/homebrew/opt/postgresql@15/bin";
const PORT = "5547";
const work = mkdtempSync(join(tmpdir(), "ticket-"));
const data = join(work, "data");
const env = { ...process.env, LC_ALL: "C", PGTZ: "UTC" };
const args = [
  "-h",
  work,
  "-p",
  PORT,
  "-U",
  "postgres",
  "-d",
  "box",
  "-X",
  "-q",
];

const run = (cmd, a, input) =>
  execFileSync(join(BIN, cmd), a, {
    env,
    input,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
const sql = (text, extra = []) =>
  run("psql", [...args, "-v", "ON_ERROR_STOP=1", ...extra], text);

/** A small seeded generator (mulberry32). */
const random = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const rng = random(47);
const GAPS = Array.from({ length: RACES }, () => Math.round(rng() * SPREAD_MS));

/** One buyer's session, exactly as it runs. */
export const buyer = (show, who, at, lock) => `SELECT pg_sleep_until('${at}');
BEGIN;
SELECT seats_left > 0 AS ok FROM shows WHERE id = ${show}${lock ? " FOR UPDATE" : ""} \\gset
\\if :ok
  SELECT pg_sleep(${PAYMENT_MS / 1000});
  UPDATE shows SET seats_left = seats_left - 1 WHERE id = ${show};
  INSERT INTO tickets (show, buyer) VALUES (${show}, '${who}');
\\endif
COMMIT;
`;

const session = (text) =>
  new Promise((resolve, reject) => {
    const p = spawn(join(BIN, "psql"), [...args, "-v", "ON_ERROR_STOP=1"], {
      env,
      stdio: ["pipe", "ignore", "pipe"],
    });
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(err))));
    p.stdin.end(text);
  });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const race = async (lock) => {
  sql(`TRUNCATE shows, tickets;
INSERT INTO shows (id, seats_left) SELECT g, 1 FROM generate_series(1, ${RACES}) g;`);
  for (let b = 0; b < RACES; b += BATCH) {
    const start = Date.now() + 600;
    const jobs = [];
    for (let i = b; i < Math.min(RACES, b + BATCH); i++) {
      const show = i + 1;
      const a = new Date(start).toISOString();
      const c = new Date(start + GAPS[i]).toISOString();
      jobs.push(
        session(buyer(show, "A", a, lock)),
        session(buyer(show, "B", c, lock)),
      );
    }
    await Promise.all(jobs);
    await sleep(20);
  }
  const rows = sql(
    `SELECT s.id, s.seats_left, count(t.*) FROM shows s
     LEFT JOIN tickets t ON t.show = s.id GROUP BY s.id ORDER BY s.id;`,
    ["-tA", "-F", ","],
  )
    .trim()
    .split("\n")
    .map((l) => l.split(",").map(Number));
  const twice = rows.filter((r) => r[2] === 2).map((r) => r[0]);
  const below = rows.filter((r) => r[1] < 0).length;
  const none = rows.filter((r) => r[2] === 0).length;
  return { twice, below, none };
};

const lines = [];
const say = (s = "") => {
  lines.push(s);
  console.log(s);
};

try {
  run("initdb", [
    "-D",
    data,
    "-U",
    "postgres",
    "-A",
    "trust",
    "-E",
    "UTF8",
    "--no-locale",
  ]);
  run("pg_ctl", [
    "-D",
    data,
    "-w",
    "-l",
    join(work, "log"),
    "-o",
    `-k ${work} -p ${PORT} -c listen_addresses='' -c max_connections=200`,
    "start",
  ]);
  run("createdb", ["-h", work, "-p", PORT, "-U", "postgres", "box"]);
  sql(`CREATE TABLE shows (id int PRIMARY KEY, seats_left int NOT NULL);
CREATE TABLE tickets (show int NOT NULL, buyer text NOT NULL);`);

  say("== versions");
  say(sql("SELECT version();", ["-tA"]).trim());
  say();
  say(
    `== ${RACES} races: one seat left, two buyers ${SPREAD_MS} ms apart at most, ${PAYMENT_MS} ms of payment between the read and the write`,
  );
  say("buyer session, plain SELECT:");
  for (const l of buyer("<show>", "<A|B>", "<tap time>", false)
    .trim()
    .split("\n"))
    say("  " + l);

  const plain = await race(false);
  const locked = await race(true);
  const hero = plain.twice[0];
  const gap = GAPS[hero - 1];
  say();
  say("== plain SELECT");
  say(`sold twice: ${plain.twice.length}`);
  say(`seats_left below zero: ${plain.below}`);
  say(`no ticket at all: ${plain.none}`);
  say();
  say("== SELECT ... FOR UPDATE");
  say(`sold twice: ${locked.twice.length}`);
  say(`seats_left below zero: ${locked.below}`);
  say(`no ticket at all: ${locked.none}`);
  say();
  say(`== the race the reel plays: show ${hero}, taps ${gap} ms apart`);
  // The largest tap gap that still sold twice, and the smallest that did not.
  const sold = new Set(plain.twice);
  const twiceGaps = plain.twice.map((s) => GAPS[s - 1]);
  const safeGaps = GAPS.filter((_, i) => !sold.has(i + 1));
  say(
    `largest gap sold twice: ${Math.max(...twiceGaps)} ms; smallest gap sold once: ${Math.min(...safeGaps)} ms`,
  );

  const { RUN } =
    await import("../src/vertical/47-last-ticket/measurements.ts");
  const lo = Math.min(...RUN.plainTwice) - 20;
  const hi = Math.max(...RUN.plainTwice) + 20;
  const problems = [];
  if (plain.twice.length < lo || plain.twice.length > hi)
    problems.push(
      `plain sold twice ${plain.twice.length}, outside ${lo} to ${hi}`,
    );
  if (locked.twice.length !== RUN.lockedTwice)
    problems.push(`FOR UPDATE sold twice ${locked.twice.length}`);
  if (hero !== RUN.hero.show || gap !== RUN.hero.gapMs)
    problems.push(`the first race sold twice is show ${hero} (${gap} ms)`);
  if (
    RUN.races !== RACES ||
    RUN.paymentMs !== PAYMENT_MS ||
    RUN.spreadMs !== SPREAD_MS
  )
    problems.push("the conditions in measurements.ts differ from this script");
  say();
  if (problems.length) {
    for (const p of problems) say(`== MISMATCH: ${p}`);
    process.exitCode = 1;
  } else
    say(
      `== measurements.ts matches this run (plain ${plain.twice.length}, recorded ${RUN.plainTwice.join(", ")})`,
    );
} finally {
  spawnSync(join(BIN, "pg_ctl"), ["-D", data, "-m", "fast", "-w", "stop"], {
    env,
    stdio: "ignore",
  });
  rmSync(work, { recursive: true, force: true });
}
