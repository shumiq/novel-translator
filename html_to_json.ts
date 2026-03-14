import { readdirSync, readFileSync, writeFileSync } from "fs";
import { JSDOM } from "jsdom";
import { isEnglish } from "./utils";

const meta = JSON.parse(readFileSync("./json/meta.json", "utf-8")) as {
  id: string;
  title: string;
  chapters: {
    ch: number;
    name: string;
  }[];
};

const htmlFiles = readdirSync("./books");

await Promise.all(
  htmlFiles.map(async (file) => {
    const ch = Number(file.split(".")[0]);
    if (isNaN(ch)) return;
    const rawHtml = readFileSync(`./books/${file}`, "utf-8");
    const document = new JSDOM(rawHtml).window.document;
    const text = document.body.textContent ?? "";
    if (!isEnglish(text)) return;
    const title = document.querySelector("p")?.textContent || "";
    const json = {
      title,
      content: rawHtml.split("\n").slice(1).join("\n"),
    };
    writeFileSync(`./json/${ch}.json`, JSON.stringify(json, null, 2));
    console.log(`Converted ${file} to JSON`);
    meta.chapters.find((c) => c.ch === ch)!.name = title;
  }),
);
writeFileSync("./json/meta.json", JSON.stringify(meta, null, 2));
