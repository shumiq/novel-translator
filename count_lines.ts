const file = process.argv[2];

if (!file) {
  console.error("Error: Please provide a file path");
  console.error("Usage: bun count_lines.ts <file>");
  process.exit(1);
}

try {
  const content = Bun.file(file);
  const text = await content.text();
  const lines = text.split("\n").filter((line) => line.trim()).length;
  console.log(lines);
} catch (error) {
  console.error(`Error reading file: ${error}`);
  process.exit(1);
}
