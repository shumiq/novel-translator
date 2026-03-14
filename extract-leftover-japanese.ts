import { Glob } from "bun";
import { readFileSync } from "fs";
import { JSDOM } from "jsdom";
import { isEnglish, isJapanese } from "./utils";

const glob = new Glob("books/**/*html");
const files = Array.from(glob.scanSync(".")) as string[];

for (const file of files.toSorted()) {
  if (!file.endsWith("html")) continue;
  const rawHTML = readFileSync(file, "utf-8");
  const text = new JSDOM(rawHTML).window.document.body.textContent ?? "";
  if (isJapanese(rawHTML) && isEnglish(rawHTML)) {
    console.log(file);
    rawHTML.split("\n").forEach((line, index) => {
      if (
        /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(line)
      ) {
        console.log(`    line: ${index + 1}`);
      }
    });
  }
}
