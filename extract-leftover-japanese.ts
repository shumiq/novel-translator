import { Glob } from "bun";
import { readFileSync } from "fs";

const glob = new Glob("books/**/*html");
const files = Array.from(glob.scanSync(".")) as string[];

for (const file of files.toSorted()) {
  if (!file.endsWith("html")) continue;
  const rawHTML = readFileSync(file, "utf-8");
  const isEnglish = /[a-zA-Z]{3,}/.test(rawHTML);
  const isJapanese =
    /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(rawHTML);
  if (isEnglish && isJapanese) {
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
