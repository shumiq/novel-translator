import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { JSDOM } from "jsdom";

const jsonFiles = readdirSync("./json");

if (!existsSync("./books")) mkdirSync("./books");

for (const file of jsonFiles) {
  if (
    file === "meta.json" ||
    existsSync(`./books/${file.replace(".json", ".html")}`)
  )
    continue;
  const data = JSON.parse(readFileSync(`./json/${file}`, "utf-8")) as {
    title: string;
    content: string;
  };
  const isThai = /\p{sc=Thai}/u.test(data.content);
  if (isThai) continue;
  const document = new JSDOM(data.content).window.document;
  const lines: string[] = Array.from(document.body.querySelectorAll("p"))
    .map((el) => el.textContent.trim())
    .filter(Boolean);
  writeFileSync(
    `./books/${file.replace(".json", ".html")}`,
    [data.title || "(empty)", ...lines]
      .map((line) => `<p>${line.trim()}</p>`)
      .join("\n"),
  );
}
