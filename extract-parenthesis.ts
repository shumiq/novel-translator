import { Glob } from "bun";
import { readFileSync, writeFileSync } from "fs";
import { JSDOM } from "jsdom";

const glob = new Glob("books/**/*html");
const files = Array.from(glob.scanSync(".")) as string[];
const checked = readFileSync("check.txt", "utf-8")
  .split("\n")
  .map((file) => file.trim());

for (const file of files.toSorted()) {
  if (!file.endsWith("html") || checked.includes(file)) continue;
  const rawHTML = readFileSync(file, "utf-8");
  const isThai = /\p{sc=Thai}/u.test(rawHTML);
  const isParenthesis = /\([^\)]*\)/u.test(rawHTML);
  if (isThai && isParenthesis) {
    console.log(file);
    rawHTML.split("\n").forEach((line, index) => {
      if (/\([^\)]*\)/u.test(line)) {
        console.log(`    line ${index + 1}: ${line}`);
      }
    });
    break;
  }
}
