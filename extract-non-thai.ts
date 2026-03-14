import { Glob } from "bun";
import { readFileSync } from "fs";
import { JSDOM } from "jsdom";
import { isThai } from "./utils";

const glob = new Glob("books/**/*html");
const files = Array.from(glob.scanSync(".")) as string[];

const limit = 5;
let count = 0;

for (const file of files.sort((a, b) =>
  a.split("\\").length > 2
    ? a.localeCompare(b)
    : Number(a.split("\\").at(-1)?.split(".")[0]) -
      Number(b.split("\\").at(-1)?.split(".")[0]),
)) {
  if (!file.endsWith("html")) continue;
  const rawHTML = readFileSync(file, "utf-8");
  if (isThai(rawHTML)) continue;
  const document = new JSDOM(rawHTML).window.document;
  const lines: string[] = Array.from(document.querySelectorAll("p"))
    .map((el) => el.textContent.trim())
    .filter(Boolean);
  if (lines.length === 0) continue;
  if (count++ >= limit) break;
  console.log(file);
}
