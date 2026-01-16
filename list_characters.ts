import * as fs from "fs";

interface CharacterData {
  gender?: string;
  base_style?: string;
  alias?: string[];
  description?: string;
  negative_constraints?: string;
  example?: Array<{ input: string; output: string } | string>;
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
  const thaiAlias = aliases.find((alias) => /[\u0E00-\u0E7F]/.test(alias));
  return thaiAlias || aliases[0]!;
}

// Group characters by gender
const maleCharacters: Array<{
  name: string;
  alias: string;
  description: string;
}> = [];
const femaleCharacters: Array<{
  name: string;
  alias: string;
  description: string;
}> = [];
const unknownCharacters: Array<{
  name: string;
  alias: string;
  description: string;
}> = [];

characters.forEach(([key, value]) => {
  const thaiAlias = getThaiAlias(value.alias);
  const description =
    [value.description, value.base_style, value.negative_constraints]
      .filter(Boolean)
      .join(" ") || "ไม่มีคำอธิบาย";

  const characterInfo = {
    name: key,
    alias: thaiAlias,
    description: description,
  };

  if (value.gender === "ชาย") {
    maleCharacters.push(characterInfo);
  } else if (value.gender === "หญิง") {
    femaleCharacters.push(characterInfo);
  } else {
    unknownCharacters.push(characterInfo);
  }
});

// Output results
let output = "";

if (maleCharacters.length > 0) {
  output += "[ชาย]\n";
  maleCharacters.forEach((char) => {
    output += `- ${char.alias} (ชาย)\t${char.description}\n`;
  });
}

if (femaleCharacters.length > 0) {
  output += "=========================\n";
  output += "[หญิง]\n";
  femaleCharacters.forEach((char) => {
    output += `- ${char.alias} (หญิง)\t${char.description}\n`;
  });
}

if (unknownCharacters.length > 0) {
  output += "=========================\n";
  output += "[ไม่ทราบ]\n";
  unknownCharacters.forEach((char) => {
    output += `- ${char.alias} (ไม่ทราบเพศ)\t${char.description}\n`;
  });
}

console.log(output);
