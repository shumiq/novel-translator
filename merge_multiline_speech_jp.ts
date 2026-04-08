import { Glob } from "bun";
import { readFileSync, writeFileSync } from "fs";
import { isThai } from "./utils";

const glob = new Glob("books/**/*html");
const files = Array.from(glob.scanSync(".")) as string[];

function isLineCloseQuote(line: string) {
  const openQuoteCount = (line.match(/「/g) || []).length;
  const closeQuoteCount = (line.match(/」/g) || []).length;
  return openQuoteCount === closeQuoteCount;
}

files.forEach((file) => {
  const rawHTML = readFileSync(file, "utf-8");
  if (isThai(rawHTML)) return;

  const lines = rawHTML.split("\n");
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    const trimmedLine = line.trim();

    if (!isLineCloseQuote(trimmedLine)) {
      // 1. Strip the <p> tags from the first line immediately
      let mergedContent = trimmedLine.replace(/<\/?p>/g, "");
      i++;

      while (i < lines.length) {
        const nextLine = (lines[i] ?? "").trim();

        // 2. Strip tags from subsequent lines and merge
        mergedContent = mergedContent + " " + nextLine.replace(/<\/?p>/g, "");

        if (isLineCloseQuote(mergedContent)) {
          break;
        }
        i++;
      }

      // 3. Wrap the clean content in a single set of tags
      result.push(`<p>${mergedContent}</p>`);
      i++;
      continue;
    }

    result.push(line ?? "");
    i++;
  }

  writeFileSync(file, result.join("\n"));
  console.log(`Processed ${file}`);
});
