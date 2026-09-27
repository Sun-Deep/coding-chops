/**
 * The listing, from `scripts/measure-ls-long.sh`.
 *
 * GNU ls 9.1 on Debian 12, on an ext4 filesystem created by the script with
 * 4096-byte blocks. The lines below are pasted exactly as ls printed them, and
 * `columns.ts` splits them at load, so the frame shows what the machine said
 * rather than a retyped copy of it. Every column was checked against `stat` in
 * the same run.
 */

export const FILE_LINE = "-rwxr-xr-x 1 dev www-data 21 Sep 17 20:53 build.sh";
export const FILE_COMMAND = "ls -l build.sh";

export const FOLDER_LINE = "drwxr-xr-x 2 dev www-data 4096 Sep 17 20:53 logs";
export const FOLDER_COMMAND = "ls -ld logs";

export const INSIDE_LINE =
  "-rw-r--r-- 1 dev www-data 10485760 Sep 17 20:53 app.log";
export const INSIDE_COMMAND = "ls -l logs";

/** What the folder says it weighs, and what is actually in it. */
export const FOLDER_SIZE = 4_096;
export const INSIDE_SIZE = 10_485_760;

/**
 * Debian 12's /usr, copied onto the same ext4.
 *
 * The two that do not say 4096 say 12288: folders holding enough names to need
 * a third block.
 */
export const USR_FOLDERS = 363;
export const USR_FOLDERS_4096 = 361;
export const USR_OTHER_SIZE = 12_288;

/**
 * What the folder number follows, which is names rather than bytes.
 *
 * Not on screen. It is the catch in the caption and the reason the number is
 * the size of a list: it grows with how many names the folder holds, and it
 * does not shrink when they go.
 */
export const GROWTH = [
  { files: 0, size: 4_096 },
  { files: 100, size: 4_096 },
  { files: 200, size: 12_288 },
  { files: 500, size: 20_480 },
  { files: 1_000, size: 36_864 },
] as const;
export const AFTER_DELETING_ALL = 36_864;

export const CONDITIONS = "GNU ls 9.1 · Debian 12 · ext4, 4096-byte blocks";
