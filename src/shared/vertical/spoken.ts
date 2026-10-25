import type { Caption } from "@remotion/captions";

/**
 * Burned-in captions for a voiced vertical cut, from whisper's word times.
 *
 * Up to two lines at a time. A caption ends at a full stop, at a comma or a
 * pause once it has some length, or before it would pass two lines; a
 * sentence's last word or two may run a little over rather than be left in
 * a caption of their own; and a caption never ends on a small word like
 * "the", which moves on to the next one. Each caption is split into its two
 * lines at the space nearest the middle that does not leave a small word at
 * the end of the first. The text carries "\n" where the lines split.
 *
 * `frameOf` turns a time in the recording into the reel frame it plays on.
 */

const SMALL = new Set([
  "the",
  "a",
  "to",
  "and",
  "of",
  "is",
  "at",
  "we",
  "you",
  "it's",
  "that's",
  "with",
  "for",
  "but",
  "so",
  "if",
  "on",
  "our",
  "in",
]);
const MAX = 64;

const bare = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9']/g, "");
const join = (ws: readonly Caption[]) =>
  ws
    .map((w) => w.text)
    .join("")
    .trim();

export type SpokenLine = { from: number; to: number; text: string };

export const spokenLines = (
  c: readonly Caption[],
  frameOf: (ms: number) => number,
): SpokenLine[] => {
  const groups: Caption[][] = [];
  let words: Caption[] = [];
  c.forEach((w, i) => {
    const ends =
      /[.?!]$/.test(w.text.trim()) ||
      /[.?!]$/.test((c[i + 1]?.text ?? ".").trim());
    const over = (join(words) + w.text).length > (ends ? MAX + 12 : MAX);
    if (words.length && over) {
      const carry: Caption[] = [];
      while (words.length > 1 && SMALL.has(bare(words[words.length - 1].text)))
        carry.unshift(words.pop()!);
      groups.push(words);
      words = carry;
    }
    words.push(w);
    const next = c[i + 1];
    const pause = next ? next.startMs - w.endMs : 0;
    const len = join(words).length;
    if (/[.?!]$/.test(w.text.trim()) && len > 14) {
      groups.push(words);
      words = [];
    } else if ((/,$/.test(w.text.trim()) || pause > 280) && len > 34) {
      groups.push(words);
      words = [];
    }
  });
  if (words.length) groups.push(words);

  return groups.map((g, n) => {
    const text = join(g);
    let cut = -1;
    if (text.length > 34) {
      const okAt = (x: number) =>
        text[x] === " " && !SMALL.has(bare(text.slice(0, x).split(" ").pop()!));
      for (let d = 0; d < text.length / 2 && cut < 0; d++) {
        const a = Math.floor(text.length / 2) - d;
        const b = Math.floor(text.length / 2) + d;
        if (okAt(a)) cut = a;
        else if (okAt(b)) cut = b;
      }
    }
    const next = groups[n + 1];
    const end = frameOf(g[g.length - 1].endMs);
    return {
      from: frameOf(g[0].startMs),
      to: next ? Math.max(end, frameOf(next[0].startMs) - 2) : end + 8,
      text: cut > 0 ? `${text.slice(0, cut)}\n${text.slice(cut + 1)}` : text,
    };
  });
};
