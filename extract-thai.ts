import { Glob } from "bun";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { JSDOM } from "jsdom";

const glob = new Glob("books/**/*html");
const files = Array.from(glob.scanSync(".")) as string[];

// Filter out
const filterOutFile = "grooming_progress.txt";
const filterOut = existsSync(filterOutFile)
  ? readFileSync(filterOutFile, "utf-8")
  : "";

let count = 0;
const limit = 10;
for (const file of files.toSorted()) {
  if (!file.endsWith("html") || filterOut.includes(file)) continue;
  const rawHTML = readFileSync(file, "utf-8");
  const isThai = /\p{sc=Thai}/u.test(rawHTML);
  if (!isThai) continue;
  const document = new JSDOM(rawHTML).window.document;
  const lines: string[] = document.body.textContent
    ?.split("\n")
    .map((el) => el.trim())
    .filter(Boolean);
  if (lines.length === 0) continue;
  if (count++ > limit) break;
  console.log(file);
}
