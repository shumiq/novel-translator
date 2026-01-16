import { Glob } from "bun";
import { readFileSync } from "fs";

const glob = new Glob("books/**/*html");
const files = Array.from(glob.scanSync(".")) as string[];

for (const file of files.toSorted()) {
  if (!file.endsWith("html")) continue;
  const rawHTML = readFileSync(file, "utf-8");
  const isThai = /\p{sc=Thai}/u.test(rawHTML);
  const isJapanese =
    /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(rawHTML);
  if (isThai && isJapanese) {
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
