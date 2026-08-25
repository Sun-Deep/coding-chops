import type { Caption } from "@remotion/captions";
import { FPS } from "./timing";

export type CaptionLine = {
  text: string;
  startFrame: number;
  endFrame: number;
};

/**
 * Group word-level whisper output into readable lines.
 *
 * The caption contract says show only the currently spoken sentence, so the
 * token stream from whisper is not directly renderable. Lines break on terminal
 * punctuation, which is what the narrator's pauses follow.
 *
 * Whisper sometimes returns an unpunctuated run-on, so length and pause length
 * are backstops. Without them a thirty second segment becomes one caption.
 */
export const toSentences = (
  captions: readonly Caption[],
  { maxWords = 13, gapMs = 420 }: { maxWords?: number; gapMs?: number } = {},
): CaptionLine[] => {
  const lines: CaptionLine[] = [];
  let words: Caption[] = [];

  const flush = () => {
    if (words.length === 0) return;
    lines.push({
      text: words
        .map((w) => w.text)
        .join("")
        .trim(),
      startFrame: Math.round((words[0].startMs / 1000) * FPS),
      endFrame: Math.round((words[words.length - 1].endMs / 1000) * FPS),
    });
    words = [];
  };

  for (const caption of captions) {
    // Whisper does not always punctuate. When it returns a run-on, fall back to
    // breathing room and length, otherwise a whole segment renders as one wall
    // of text across the bottom of the frame.
    const gap =
      words.length > 0 ? caption.startMs - words[words.length - 1].endMs : 0;
    if (words.length >= maxWords && gap >= gapMs) flush();

    words.push(caption);
    if (/[.!?]"?$/.test(caption.text.trim())) flush();
    else if (words.length >= maxWords * 2) flush();
  }
  flush();

  return lines;
};

/** Frame at which a given word starts. Use it to anchor a visual to speech. */
export const wordFrame = (
  captions: readonly Caption[],
  word: string,
  occurrence = 1,
): number => {
  const normalise = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z']/g, "");
  let seen = 0;

  for (const caption of captions) {
    if (normalise(caption.text) !== normalise(word)) continue;
    seen += 1;
    if (seen === occurrence) return Math.round((caption.startMs / 1000) * FPS);
  }

  throw new Error(
    `Word "${word}" (occurrence ${occurrence}) is not in the captions.`,
  );
};

/**
 * Frame at which a run of words starts.
 *
 * `wordFrame` cannot address a boundary that falls on a common word — there are
 * eleven "the"s in a segment and no useful ordinal among them. A phrase is
 * unambiguous, which is what cutting a reel out of the episode needs.
 */
export const phraseFrame = (
  captions: readonly Caption[],
  phrase: string,
  { end = false }: { end?: boolean } = {},
): number => {
  const bare = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9']/g, "");
  const words = phrase.split(/\s+/).map(bare);

  for (let i = 0; i <= captions.length - words.length; i += 1) {
    if (words.some((word, k) => bare(captions[i + k].text) !== word)) continue;
    const token = captions[end ? i + words.length - 1 : i];
    return Math.round(((end ? token.endMs : token.startMs) / 1000) * FPS);
  }

  throw new Error(`Phrase "${phrase}" is not in the captions.`);
};
