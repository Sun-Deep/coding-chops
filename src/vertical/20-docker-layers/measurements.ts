/**
 * What Docker ran again, from `scripts/measure-docker-layers.sh`.
 *
 * Docker 29.5.2 with BuildKit, node:22-slim, and an app whose one dependency,
 * express 4.21.2, is pinned by a committed lockfile. Two runs, each building
 * both Dockerfiles from nothing and then again after the same one-line change.
 * Which steps ran and which were cached, and the package count, were identical
 * across both runs.
 *
 * Layer bytes are not exactly repeatable: the install layer measured between
 * 4,368,146 and 4,368,529 across eight builds, because npm writes log files
 * into it. So bytes go on screen at the precision every build agrees on.
 */

/** Packages in node_modules after `npm ci`. */
export const PACKAGES = 67;

/** The install layer, rounded to where all eight builds agree. */
export const INSTALL_LAYER = "4.37 MB";

/** The last `COPY . .` layer: the app's own files. 30,166 to 30,231 bytes. */
export const CODE_LAYER = "30 KB";

/** The line that changes, server.js line 11. */
export const LINE_BEFORE = "  res.json({ orders: [] });";
export const LINE_AFTER = "  res.json({ orders: [], page: 1 });";
export const LINE_NUMBER = 11;

export type Step = {
  readonly text: string;
  /** What the first build did, then what the rebuild after the change did. */
  readonly rebuild: "base" | "cached" | "ran";
  readonly bytes: string;
  readonly install?: boolean;
  /** The build context files a COPY takes in. Its cache key is their contents. */
  readonly inputs?: readonly FileName[];
};

/**
 * The build context, as the frame draws it. The two package files are one chip
 * because both Dockerfiles only ever copy them together, the way the second
 * one's `COPY package*.json` names them.
 */
export type FileName = "package*.json" | "server.js";
export const FILES: readonly FileName[] = ["package*.json", "server.js"];
/** The file the one-line change is in. */
export const CHANGED: FileName = "server.js";

/** Code first: `COPY . .` sits above the install, so the install reruns. */
export const CODE_FIRST: readonly Step[] = [
  { text: "FROM node:22-slim", rebuild: "base", bytes: "" },
  { text: "WORKDIR /app", rebuild: "cached", bytes: "0 B" },
  {
    text: "COPY . .",
    rebuild: "ran",
    bytes: CODE_LAYER,
    inputs: ["package*.json", "server.js"],
  },
  { text: "RUN npm ci", rebuild: "ran", bytes: INSTALL_LAYER, install: true },
];

/** Package files first: the install sits above the code, so it is cached. */
export const PACKAGES_FIRST: readonly Step[] = [
  { text: "FROM node:22-slim", rebuild: "base", bytes: "" },
  { text: "WORKDIR /app", rebuild: "cached", bytes: "0 B" },
  {
    text: "COPY package*.json ./",
    rebuild: "cached",
    bytes: CODE_LAYER,
    inputs: ["package*.json"],
  },
  {
    text: "RUN npm ci",
    rebuild: "cached",
    bytes: INSTALL_LAYER,
    install: true,
  },
  {
    text: "COPY . .",
    rebuild: "ran",
    bytes: CODE_LAYER,
    inputs: ["package*.json", "server.js"],
  },
];

export const CONDITIONS =
  "docker 29.5.2 · node:22-slim · express 4.21.2 · 67 packages";
