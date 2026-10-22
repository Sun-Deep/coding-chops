import { CHECKS, FOUND_AT, SHOW_FROM } from "./beats";
import { DIFF, RUN } from "./measurements";

/**
 * The terminal, line by line, on the reel's clock. Every line is one git
 * printed in the committed run, in order; this only decides the frame it
 * appears on. Each line is checked against what it should be as it is
 * scheduled, so a transcript that drifts from the checks throws here.
 */

export type Kind = "cmd" | "out" | "commit" | "ok" | "fail" | "left" | "found";

export type Line = {
  readonly at: number;
  readonly text: string;
  readonly kind: Kind;
  /** Frames a command takes to type. */
  readonly typing?: number;
};

const expect = (text: string, re: RegExp, where: string) => {
  if (!re.test(text))
    throw new Error(`transcript.ts: ${where} is "${text}", expected ${re}`);
  return text;
};

const kindOf = (text: string): Kind => {
  if (text.startsWith("ok ")) return "ok";
  if (text.startsWith("FAIL ")) return "fail";
  if (text.startsWith("Bisecting:")) return "left";
  if (/^\[[0-9a-f]{40}\]/.test(text)) return "commit";
  if (/is the first bad commit$/.test(text)) return "found";
  return "out";
};

export const LINES: readonly Line[] = (() => {
  const t = RUN.transcript;
  const out: Line[] = [
    { at: 0, text: "$ git bisect start HEAD v1.0", kind: "cmd" },
  ];
  let i = 0;
  const take = (at: number, re: RegExp, where: string) => {
    const text = expect(t[i++], re, where);
    out.push({ at, text, kind: kindOf(text) });
  };
  take(5, /^Bisecting: \d+ revisions left/, "start");
  take(9, /^\[[0-9a-f]{40}\] /, "first checkout");
  out.push({
    at: 13,
    text: "$ git bisect run node test.mjs",
    kind: "cmd",
    typing: 16,
  });
  for (const c of CHECKS) {
    take(c.from, /^running /, `check ${c.k}`);
    take(
      c.resultAt,
      c.result === "good" ? /^ok / : /^FAIL /,
      `check ${c.k} result`,
    );
    if (c.k < CHECKS.length) {
      take(c.cutAt, /^Bisecting: \d+ revisions? left/, `check ${c.k} cut`);
      take(c.cutAt + 3, /^\[[0-9a-f]{40}\] /, `check ${c.k + 1} checkout`);
    }
  }
  take(FOUND_AT, new RegExp(`^${RUN.hash}[0-9a-f]{33} is the first`), "found");
  // The commit git names, as it prints it.
  let at = FOUND_AT + 2;
  while (i < t.length && !t[i].startsWith("bisect found")) {
    if (t[i].trim() !== "") out.push({ at, text: t[i], kind: "out" });
    i++;
    at += 2;
  }
  out.push({
    at: SHOW_FROM,
    text: `$ git show --format= --unified=0 ${RUN.hash}`,
    kind: "cmd",
    typing: 14,
  });
  return out;
})();

/** The first bad commit's change, under `git show`, as git printed it. */
export const DIFF_LINES: readonly string[] = DIFF.show;
export const DIFF_AT = SHOW_FROM + 18;
/** The changed line comes up big once git show has printed it. */
export const CHANGE_AT = DIFF_AT + DIFF_LINES.length * 2 + 4;

/** The hash git checked out for each test, shortened as a person would. */
export const TESTED: readonly string[] = (() => {
  const ids = RUN.transcript
    .filter((l) => /^\[[0-9a-f]{40}\] /.test(l))
    .map((l) => l.slice(1, 8));
  if (ids.length !== CHECKS.length)
    throw new Error("transcript.ts: one checkout per check");
  return ids;
})();

/** "Bisecting: N revisions left", in order. */
export const LEFT: readonly number[] = RUN.transcript
  .filter((l) => l.startsWith("Bisecting:"))
  .map((l) => Number(l.match(/(\d+) revision/)![1]));
if (JSON.stringify(LEFT) !== JSON.stringify(RUN.left))
  throw new Error("transcript.ts: the Bisecting lines disagree with RUN.left");
