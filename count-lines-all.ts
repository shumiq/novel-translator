import { Glob } from "bun";
import { readFileSync, writeFileSync } from "fs";
import { JSDOM } from "jsdom";

const glob = new Glob("books/**/*html");
const files = Array.from(glob.scanSync(".")) as string[];

const countLines = {} as Record<string, number>;

await Promise.all(
  files.toSorted().map(async (file) => {
    if (!file.endsWith("html")) return;
    const rawHTML = readFileSync(file, "utf-8");
    const document = new JSDOM(rawHTML).window.document;
    const lines: string[] = document.body.textContent
      ?.split("\n")
      .map((el) => el.trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    countLines[file] = lines.length;
  }),
);

writeFileSync("count-lines.json", JSON.stringify(countLines, null, 2));
