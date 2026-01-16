import { Glob } from "bun";
import { readFileSync, writeFileSync } from "fs";
import { JSDOM } from "jsdom";

const glob = new Glob("books/**/*html");
const files = Array.from(glob.scanSync(".")) as string[];

const countLines = {} as Record<string, number>;

for (const file of files.toSorted()) {
  if (!file.endsWith("html")) continue;
  const rawHTML = readFileSync(file, "utf-8");
  //   const isThai = /\p{sc=Thai}/u.test(rawHTML);
  //   if (!isThai || rawHTML.startsWith("<p>")) continue;
  const document = new JSDOM(rawHTML).window.document;
  const lines: string[] = document.body.textContent
    ?.split("\n")
    .map((el) => el.trim())
    .filter(Boolean);
  if (lines.length === 0) continue;
  countLines[file] = lines.length;
}

writeFileSync("count_lines.json", JSON.stringify(countLines, null, 2));
