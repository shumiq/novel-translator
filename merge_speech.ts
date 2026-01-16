import { Glob } from "bun";
import { readFileSync, writeFileSync } from "fs";
import { JSDOM } from "jsdom";

const glob = new Glob("books/**/*html");
const files = Array.from(glob.scanSync(".")) as string[];

for (const file of files.toSorted()) {
  if (!file.endsWith("html")) continue;
  const rawHTML = readFileSync(file, "utf-8");
  const isThai = /\p{sc=Thai}/u.test(rawHTML);
  if (!isThai) continue;
  const document = new JSDOM(rawHTML).window.document;
  const lines: string[] = Array.from(document.querySelectorAll("p"))
    .map((el) => el.textContent.trim())
    .filter(Boolean);
  // Count the number of quotes in a string
  function countQuotes(str: string): number {
    return (str.match(/"/g) || []).length;
  }

  // Merge lines with odd quote counts until balanced (even)
  const mergedLines: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const currentLine = lines[i]!;
    const quoteCount = countQuotes(currentLine);

    if (quoteCount % 2 === 1) {
      // Odd quotes - start merging with next lines
      let merged = currentLine;
      let j = i + 1;

      // Keep merging until we find another odd quote line (odd + odd = even)
      while (j < lines.length && countQuotes(lines[j]!) % 2 === 0) {
        merged += " " + lines[j]!;
        j++;
      }

      // Include the balancing odd quote line if exists
      if (j < lines.length) {
        merged += " " + lines[j]!;
        j++;
      }

      mergedLines.push(merged);
      i = j;
    } else {
      // Even quotes - no merging needed
      mergedLines.push(currentLine);
      i++;
    }
  }

  if (lines.length === mergedLines.length) continue;

  console.log(
    `Processed ${file}: ${lines.length} -> ${mergedLines.length} lines`,
  );

  writeFileSync(
    file,
    mergedLines.map((line) => `<p>${line}</p>`).join("\n"),
    "utf-8",
  );
}
