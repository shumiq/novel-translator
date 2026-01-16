import { Glob } from "bun";
import { existsSync, readFileSync, writeFileSync } from "fs";

const glob = new Glob("books/**/*html");
const files = Array.from(glob.scanSync(".")) as string[];
const LIMIT = 20;

const data = {} as Record<string, string>;

if (!existsSync(`result.json`)) {
  writeFileSync(`result.json`, JSON.stringify({}));
}

const result = JSON.parse(readFileSync("result.json", "utf-8")) as Record<
  string,
  string
>;

for (const file of files.toSorted()) {
  const rawHTML = readFileSync(file, "utf-8");
  const isThai = /\p{sc=Thai}/u.test(rawHTML);
  if (!isThai) continue;
  if (result[file]) {
    // Already Refined
    if (result[file] === "DONE") {
      // Already saved
      continue;
    }
    if (result[file].split("\n").length === rawHTML.split("\n").length) {
      // # Lines matched, write back to original file and not include in all_data.json
      writeFileSync(`${file}`, result[file]);
      result[file] = "DONE";
      console.log(`${file}: saved`);
    } else {
      // # Lines not matched, delete and redo
      console.log(`${file}: redo`);
      delete result[file];
      data[file] = rawHTML;
    }
  } else {
    // Included in all_data.json
    console.log(`${file}: todo`);
    data[file] = rawHTML;
  }
  if (Object.keys(data).length >= LIMIT) break;
}

writeFileSync(`result.json`, JSON.stringify(result, null, 2));
writeFileSync(`all_data.json`, JSON.stringify(data, null, 2));
