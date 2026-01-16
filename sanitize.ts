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
  const lines: string[] = document.body.textContent
    ?.split("\n")
    .map((el) => el.trim())
    .filter(Boolean);
  if (lines.length === 0) continue;
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
            .replaceAll("】", '"')}</p>`,
      )
      .join("\n"),
  );
}
