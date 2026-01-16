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
  const body = new JSDOM(rawHTML).window.document.body.textContent;
  const lines: string[] = body
    .split("\n")
    .map((el) => el.trim())
    .filter(Boolean);
  if (lines.length === 0) continue;
  console.log(`Sanitizing ${file}`);
  writeFileSync(
    file,
    lines
      .map(
        (line) =>
          `<p>${line
            .trim()
            .replaceAll("」", '"')
            .replaceAll("「", '"')
            .replaceAll("『", '"')
            .replaceAll("』", '"')
            .replaceAll("[", '"')
            .replaceAll("]", '"')
            .replaceAll("“", '"')
            .replaceAll("”", '"')
            .replaceAll("‘", "'")
            .replaceAll("’", "'")
            .replaceAll("【", '"')
            .replaceAll("】", '"')
            .replaceAll("（", " (")
            .replaceAll("）", ") ")
            .replaceAll("๑", "1")
            .replaceAll("๒", "2")
            .replaceAll("๓", "3")
            .replaceAll("๔", "4")
            .replaceAll("๕", "5")
            .replaceAll("๖", "6")
            .replaceAll("๗", "7")
            .replaceAll("๘", "8")
            .replaceAll("๙", "9")
            .replaceAll("๐", "0")
            .replaceAll("１", "1")
            .replaceAll("２", "2")
            .replaceAll("３", "3")
            .replaceAll("４", "4")
            .replaceAll("５", "5")
            .replaceAll("６", "6")
            .replaceAll("７", "7")
            .replaceAll("８", "8")
            .replaceAll("９", "9")
            .replaceAll("０", "0")
            .replaceAll("…", "...")
            .replaceAll("—", "—")
            .trim()}</p>`,
      )
      .join("\n"),
  );
}
