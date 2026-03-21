import * as fs from "fs";
import { isThai } from "./utils";

interface CharacterData {
  gender?: string;
  base_style?: string;
  alias?: string[];
  description?: string;
  negative_constraints?: string;
  example?: Array<{ input: string; output: string } | string>;
  invalid_translation?: string[];
}

interface NovelData {
  [key: string]: CharacterData;
}

// Read novel_data.json
const data: NovelData = JSON.parse(fs.readFileSync("novel_data.json", "utf-8"));

// Filter entries that have base_style field
const characters = Object.entries(data).filter(
  ([_, value]) => value.base_style,
);

// Function to find Thai alias from alias array
function getThaiAlias(aliases: string[] | undefined): string {
  if (!aliases || aliases.length === 0) return "ไม่มีชื่อ";

  // Find the first Thai alias (contains Thai characters)
  const thaiAlias = aliases.find((alias) => isThai(alias));
  return thaiAlias || aliases[0]!;
}

// Group characters by gender
const allCharacters: Array<{
  originalJapanese: string;
  alias: string;
  gender: string;
  description: string;
  style: string;
  invalidTranslation?: string[];
}> = [];

characters.forEach(([key, value]) => {
  const thaiAlias = getThaiAlias(value.alias);
  const style =
    [value.base_style, value.negative_constraints].filter(Boolean).join(" ") ||
    "ไม่ระบุ";

  const characterInfo = {
    originalJapanese: key,
    alias: thaiAlias,
    gender: value.gender || "ไม่ระบุ",
    description: value.description || "ไม่มีข้อมูล",
    style: style,
    invalidTranslation: value.invalid_translation,
  };

  allCharacters.push(characterInfo);
});

// Output results
let output = "# Characters\n\n";

function createTable(
  characters: Array<{
    originalJapanese: string;
    alias: string;
    gender: string;
    description: string;
    style: string;
    invalidTranslation?: string[];
  }>,
): string {
  if (characters.length === 0) return "";

  let table =
    "| Original Japanese | Thai Alias | Gender | Description | Style | Invalid Translation |\n";
  table +=
    "|-------------------|------------|--------|-------------|-------|---------------------|\n";

  characters.forEach((char) => {
    const invalid =
      char.invalidTranslation && char.invalidTranslation.length > 0
        ? char.invalidTranslation.join(", ")
        : "-";
    table += `| ${char.originalJapanese} | ${char.alias} | ${char.gender} | ${char.description} | ${char.style} | ${invalid} |\n`;
  });

  table += "\n";
  return table;
}

output += createTable(allCharacters);

// Write to .gemini/CHARACTERS.md
fs.writeFileSync(".gemini/CHARACTERS.md", output);

console.log("Character list updated in .gemini/CHARACTERS.md");
