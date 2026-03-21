import { Glob } from "bun";
import { readFileSync } from "fs";
import { isJapanese, isThai } from "./utils";

const glob = new Glob("books/**/*html");
const files = Array.from(glob.scanSync(".")) as string[];

const limit = 1;
let count = 0;

for (const file of files.toSorted()) {
  if (!file.endsWith("html")) continue;
  const rawHTML = readFileSync(file, "utf-8");
  if (isThai(rawHTML) && isJapanese(rawHTML)) {
    if (count++ >= limit) break;
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
