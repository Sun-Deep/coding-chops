import {
  FILE_LINE,
  FOLDER_LINE,
  FOLDER_SIZE,
  INSIDE_LINE,
  INSIDE_SIZE,
} from "./measurements";

/**
 * The seven columns of a long listing, read out of the line itself.
 *
 * Split on runs of spaces, with the date kept as its three fields. Each column
 * carries where it starts in the line, so a token can leave from exactly the
 * characters it was cut from.
 */

export type ColumnKey =
  | "mode"
  | "links"
  | "owner"
  | "group"
  | "size"
  | "date"
  | "name";

export const KEYS: readonly ColumnKey[] = [
  "mode",
  "links",
  "owner",
  "group",
  "size",
  "date",
  "name",
];

export type Column = {
  readonly key: ColumnKey;
  readonly text: string;
  /** Index of its first character in the line. */
  readonly at: number;
};

export const split = (line: string): readonly Column[] => {
  const fields: { text: string; at: number }[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) fields.push({ text: m[0], at: m.index });
  if (fields.length !== 9) {
    throw new Error(
      `"${line}" has ${fields.length} fields, a long listing has 9`,
    );
  }
  const date = {
    text: line.slice(fields[5].at, fields[7].at + fields[7].text.length),
    at: fields[5].at,
  };
  const parts = [...fields.slice(0, 5), date, fields[8]];
  return parts.map((p, i) => ({ key: KEYS[i], ...p }));
};

export const FILE = split(FILE_LINE);
export const FOLDER = split(FOLDER_LINE);
export const INSIDE = split(INSIDE_LINE);

export const column = (cols: readonly Column[], key: ColumnKey) => {
  const found = cols.find((c) => c.key === key);
  if (!found) throw new Error(`no ${key}`);
  return found.text;
};

// The figures a frame reads must be the ones the lines say.
if (Number(column(FOLDER, "size")) !== FOLDER_SIZE) {
  throw new Error("the folder line and FOLDER_SIZE disagree");
}
if (Number(column(INSIDE, "size")) !== INSIDE_SIZE) {
  throw new Error("the inside line and INSIDE_SIZE disagree");
}
if (column(FOLDER, "mode")[0] !== "d" || column(FILE, "mode")[0] !== "-") {
  throw new Error("the file and folder lines are the wrong way round");
}

/** A permission triplet's value, the chmod digit. */
export const digitOf = (triplet: string) =>
  (triplet[0] === "r" ? 4 : 0) +
  (triplet[1] === "w" ? 2 : 0) +
  (triplet[2] === "x" ? 1 : 0);

export const TRIPLETS = [1, 4, 7].map((i) =>
  column(FILE, "mode").slice(i, i + 3),
);
