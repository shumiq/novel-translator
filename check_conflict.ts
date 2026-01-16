import { readFileSync } from "node:fs";

const isThai = (text: string) => /\p{sc=Thai}/u.test(text);

const dataFile = "novel_data.json";
const dataText = readFileSync(dataFile, "utf-8");
let data;
try {
  data = JSON.parse(dataText);
} catch (e) {
  console.error("Invalid JSON in novel_data.json. Error:", (e as Error).message);
  process.exit(1);
}

console.log("Entries with more than 1 Thai alias in terminology:");
for (const [key, item] of Object.entries(data.terminology as Record<string, { description: string; alias: string[] }>)) {
  const thaiAliases = item.alias.filter(isThai);
  if (thaiAliases.length > 1) {
    console.log(`- ${key}: ${thaiAliases.join(", ")}`);
  }
}

console.log("\nEntries with more than 1 Thai alias in personas:");
for (const [key, item] of Object.entries(data.personas as Record<string, { base_style: string; negative_constraints: string; example: string[]; alias: string[] }>)) {
  const thaiAliases = item.alias.filter(isThai);
  if (thaiAliases.length > 1) {
    console.log(`- ${key}: ${thaiAliases.join(", ")}`);
  }
}