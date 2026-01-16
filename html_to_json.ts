import { readdirSync, readFileSync, writeFileSync } from "fs";
import { JSDOM } from "jsdom";

const meta = JSON.parse(readFileSync("./json/meta.json", "utf-8")) as {
  id: string;
  title: string;
  chapters: {
    ch: number;
    name: string;
  }[];
};

const htmlFiles = readdirSync("./books");

for (const file of htmlFiles) {
  const ch = Number(file.split(".")[0]);
  if (isNaN(ch)) continue;
  const rawHtml = readFileSync(`./books/${file}`, "utf-8");
  const isThai = /\p{sc=Thai}/u.test(rawHtml);
  if (!isThai) continue;
  const title =
    new JSDOM(rawHtml).window.document.querySelector("p")?.textContent || "";
  const json = {
    title,
    content: rawHtml.split("\n").slice(1).join("\n"),
  };
  writeFileSync(`./json/${ch}.json`, JSON.stringify(json, null, 2));
  console.log(`Converted ${file} to JSON`);
  meta.chapters.find((c) => c.ch === ch)!.name = title;
}
writeFileSync("./json/meta.json", JSON.stringify(meta, null, 2));
