import { Glob } from "bun";
import { readFileSync, writeFileSync } from "fs";
import { isThai } from "./utils";

const glob = new Glob("books/**/*html");
const files = Array.from(glob.scanSync(".")) as string[];

files.forEach((file) => {
  const rawHTML = readFileSync(file, "utf-8");
  if (!isThai(rawHTML)) return;

  const lines = rawHTML.split("\n");
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    const trimmedLine = line.trim();
    const openQuoteCount = (trimmedLine.match(/"/g) || []).length;
    if (openQuoteCount % 2 !== 0) {
      // 1. Strip the <p> tags from the first line immediately
      let mergedContent = trimmedLine.replace(/<\/?p>/g, "");
      i++;

      while (i < lines.length) {
        const nextLine = (lines[i] ?? "").trim();

        // 2. Strip tags from subsequent lines and merge
        mergedContent = mergedContent + " " + nextLine.replace(/<\/?p>/g, "");

        const mergedQuoteCount = (mergedContent.match(/"/g) || []).length;
        if (mergedQuoteCount % 2 === 0) {
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
