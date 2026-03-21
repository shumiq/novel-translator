import { readdirSync, readFileSync, writeFileSync } from "fs";
import { JSDOM } from "jsdom";
import { isThai } from "./utils";

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
    if (!isThai(rawHtml)) return;
    const title =
      new JSDOM(rawHtml).window.document.querySelector("p")?.textContent || "";
    const json = {
      title,
      content: rawHtml.split("\n").slice(1).join("\n").replaceAll("\r\n", "\n"),
    };
    writeFileSync(`./json/${ch}.json`, JSON.stringify(json, null, 2));
    console.log(`Converted ${file} to JSON`);
    const chapter = meta.chapters.find((c) => c.ch === ch);
    if (chapter) {
      chapter.name = title;
    } else {
      meta.chapters.push({
        ch: ch,
        name: title,
      });
    }
    meta.chapters = meta.chapters.toSorted((a, b) => a.ch - b.ch);
  }),
);
writeFileSync("./json/meta.json", JSON.stringify(meta, null, 2));
