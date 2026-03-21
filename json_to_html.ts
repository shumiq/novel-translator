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

jsonFiles.forEach(async (file) => {
  if (
    file === "meta.json" ||
    existsSync(`./books/${file.replace(".json", ".html")}`)
  )
    return;
  const data = JSON.parse(readFileSync(`./json/${file}`, "utf-8")) as {
    title: string;
    content: string;
  };
  // if (isThai(data.content)) return;
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
});
