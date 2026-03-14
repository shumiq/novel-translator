import { Glob } from "bun";
import { readFileSync, writeFileSync } from "fs";
import { JSDOM } from "jsdom";
import { isEnglish } from "./utils";

const glob = new Glob("books/**/*html");
const files = Array.from(glob.scanSync(".")) as string[];

files.toSorted().forEach(async (file) => {
  if (!file.endsWith("html")) return;
  const rawHTML = readFileSync(file, "utf-8");
  if (!isEnglish(rawHTML)) return;
  const body = new JSDOM(rawHTML).window.document.body.textContent;
  const lines: string[] = body
    .split("\n")
    .map((el) => el.trim())
    .filter(Boolean);
  if (lines.length === 0) return;
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
            .replaceAll(/\.\.\.\.+/g, "...")
            .trim()}</p>`,
      )
      .join("\n"),
  );
});
