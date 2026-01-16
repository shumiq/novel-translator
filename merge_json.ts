import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { JSDOM } from "jsdom";

const folder = `json`;
const LIMIT = 20;

const data = {} as Record<string, string[]>;

if (!existsSync(`result.json`)) {
  writeFileSync(`result.json`, JSON.stringify({}));
}

const result = JSON.parse(readFileSync("result.json", "utf-8")) as Record<
  string,
  string[]
>;

for (const file of readdirSync(folder).sort(
  (a, b) => Number(a.split(".")[0]) - Number(b.split(".")[0]),
)) {
  if (file === "meta.json") continue;
  const { title, content } = JSON.parse(
    readFileSync(`${folder}/${file}`, "utf-8"),
  ) as { title: string; content: string };
  const isThai = /\p{sc=Thai}/u.test(content);
  if(!isThai) continue;
  const document = new JSDOM(content).window.document;
  const lines: string[] = Array.from(document.querySelectorAll("p"))
    .map((el) => el.textContent.trim())
    .filter(Boolean);
  if (result[file]) {
    // Already Refined
    if (result[file]?.[0] === "DONE") {
      // Already saved
      continue;
    }
    if (result[file]?.length === lines.length) {
      // # Lines matched, write back to original file and not include in all_data.json
      const newContent = {
        title,
        content: result[file].map((line) => `<p>${line}</p>`).join("\n"),
      };
      writeFileSync(`${folder}/${file}`, JSON.stringify(newContent, null, 2));
      result[file] = ["DONE"];
      console.log(`${file}: saved`);
    } else {
      // # Lines not matched, delete and redo
      console.log(`${file}: redo`);
      delete result[file];
      data[file] = lines;
    }
  } else {
    // Included in all_data.json
    console.log(`${file}: todo`);
    data[file] = lines;
  }
  if (Object.keys(data).length >= LIMIT) break;
}

writeFileSync(`result.json`, JSON.stringify(result, null, 2));
writeFileSync(`all_data.json`, JSON.stringify(data, null, 2));
