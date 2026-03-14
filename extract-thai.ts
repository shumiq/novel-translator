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

let count = 0;
const limit = 5;
for (const file of files.sort((a, b) =>
  a.split("\\").length > 2
    ? a.localeCompare(b)
    : Number(a.split("\\").at(-1)?.split(".")[0]) -
      Number(b.split("\\").at(-1)?.split(".")[0]),
)) {
  if (!file.endsWith("html") || filterOut.includes(file.replaceAll("\\", "/")))
    continue;
  const rawHTML = readFileSync(file, "utf-8");
  if (!isThai(rawHTML)) continue;
  const document = new JSDOM(rawHTML).window.document;
  const lines: string[] = document.body.textContent
    ?.split("\n")
    .map((el) => el.trim())
    .filter(Boolean);
  if (lines.length === 0) continue;
  if (count++ >= limit) break;
  console.log(file);
}
