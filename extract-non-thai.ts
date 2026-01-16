import { Glob } from "bun";
import { readFileSync } from "fs";
import { JSDOM } from "jsdom";

const glob = new Glob("books/**/*html");
const files = Array.from(glob.scanSync(".")) as string[];

const limit = 10;
let count = 0;

for (const file of files.sort((a, b) =>
  a.split("\\").length > 2
    ? a.localeCompare(b)
    : Number(a.split("\\").at(-1)?.split(".")[0]) -
      Number(b.split("\\").at(-1)?.split(".")[0]),
)) {
  if (!file.endsWith("html")) continue;
  const rawHTML = readFileSync(file, "utf-8");
  const isThai = /\p{sc=Thai}/u.test(rawHTML);
  if (isThai) continue;
  const document = new JSDOM(rawHTML).window.document;
  const lines: string[] = Array.from(document.querySelectorAll("p"))
    .map((el) => el.textContent.trim())
    .filter(Boolean);
  if (lines.length === 0) continue;
  count++;
  console.log(file);
  if (count > limit) break;
}
