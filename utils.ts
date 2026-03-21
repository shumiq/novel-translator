import { readFileSync, writeFileSync } from "fs";
import { JSDOM } from "jsdom";

export const isJapanese = (text: string) =>
  /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(text);

export const isThai = (text: string) =>
  /\p{Script=Thai}/u.test(text) &&
  text.split(/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u).length <
    100;

export const isEnglish = (text: string) => {
  return (
    text
      .replaceAll(/\p{Script=Latin}{3,}/gu, "this-is-english")
      .split("this-is-english").length > 100
  );
};

export const sanitize = (filePath: string): boolean => {
  if (!filePath.endsWith("html")) return false;
  const rawHTML = readFileSync(filePath, "utf-8");
  if (!isThai(rawHTML)) return false;
  const body = new JSDOM(rawHTML).window.document.body.textContent;
  const lines: string[] = body
    .split("\n")
    .map((el) => el.trim())
    .filter(Boolean);
  if (lines.length === 0) return false;
  console.log(`Sanitizing ${filePath}`);
  writeFileSync(
    filePath,
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
            .replaceAll("\u201C", '"')
            .replaceAll("\u201D", '"')
            .replaceAll("\u2018", "'")
            .replaceAll("\u2019", "'")
            .replaceAll("【", '"')
            .replaceAll("】", '"')
            .replaceAll("（", " (")
            .replaceAll("）", ") ")
            .replaceAll(", ", " ")
            .replaceAll("๑", "1")
            .replaceAll("๒", "2")
            .replaceAll("๓", "3")
            .replaceAll("๔", "4")
            .replaceAll("๕", "5")
            .replaceAll("๖", "6")
            .replaceAll("๗", "7")
            .replaceAll("๘", "8")
            .replaceAll("๙", "9")
            .replaceAll("๐", "0")
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
      .join("\n")
      .replaceAll(/<p>[0-9]{1,3}: /g, "<p>")
      .replaceAll("<p>Side:", "<p>มุมมอง:"),
  );
  return true;
};
