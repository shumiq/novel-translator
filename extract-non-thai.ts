import { Glob } from "bun";
import { existsSync, readFileSync } from "fs";
import { JSDOM } from "jsdom";
import { isThai } from "./utils";

const glob = new Glob("books/**/*html");
const files = Array.from(glob.scanSync(".")) as string[];

// Parse command line arguments for --progress flag
const args = process.argv.slice(2);
const progressArgIndex = args.indexOf("--progress");
const progressFileArg =
  progressArgIndex !== -1 ? args[progressArgIndex + 1] : undefined;
const filterOutFile = progressFileArg
  ? `${progressFileArg}_progress.txt`
  : "progress.txt";

// Filter out
const filterOut = existsSync(filterOutFile)
  ? readFileSync(filterOutFile, "utf-8").replaceAll("\\", "/")
  : "";

const limit = 1;
let count = 0;

for (const file of files.sort((a, b) =>
  a.split("\\").length > 2
    ? a.localeCompare(b)
    : Number(a.replaceAll(/[^0-9]/g, "")) - Number(b.replaceAll(/[^0-9]/g, "")),
)) {
  if (!file.endsWith("html") || filterOut.includes(file.replaceAll("\\", "/")))
    continue;
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
