import { JSDOM } from "jsdom";
const file = process.argv[2];

if (!file) {
  console.error("Error: Please provide a file path");
  console.error("Usage: bun count-lines.ts <file>");
  process.exit(1);
}

try {
  const content = Bun.file(file);
  const text = await content.text();
  const document = new JSDOM(text).window.document;
  const lines: string[] = document.body.textContent
    ?.split("\n")
    .map((el) => el.trim())
    .filter(Boolean);
  console.log(lines.length);
} catch (error) {
  console.error(`Error reading file: ${error}`);
  process.exit(1);
}
