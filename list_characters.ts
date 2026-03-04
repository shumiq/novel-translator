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

// Function to find English alias from alias array
function getEnglishAlias(aliases: string[] | undefined): string {
  if (!aliases || aliases.length === 0) return "No name";

  // Find the first English alias (contains Latin letters)
  const englishAlias = aliases.find((alias) => /[a-zA-Z]{2,}/.test(alias));
  return englishAlias || aliases[0]!;
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
  const englishAlias = getEnglishAlias(value.alias);
  const description =
    [value.description, value.base_style, value.negative_constraints]
      .filter(Boolean)
      .join(" ") || "No description";

  const characterInfo = {
    name: key,
    alias: englishAlias,
    description: description,
  };

  if (value.gender === "male") {
    maleCharacters.push(characterInfo);
  } else if (value.gender === "female") {
    femaleCharacters.push(characterInfo);
  } else {
    unknownCharacters.push(characterInfo);
  }
});

// Output results
let output = "";

if (maleCharacters.length > 0) {
  output += "[Male]\n";
  maleCharacters.forEach((char) => {
    output += `- ${char.alias} (Male)\t${char.description}\n`;
  });
}

if (femaleCharacters.length > 0) {
  output += "=========================\n";
  output += "[Female]\n";
  femaleCharacters.forEach((char) => {
    output += `- ${char.alias} (Female)\t${char.description}\n`;
  });
}

if (unknownCharacters.length > 0) {
  output += "=========================\n";
  output += "[Unknown]\n";
  unknownCharacters.forEach((char) => {
    output += `- ${char.alias} (Unknown)\t${char.description}\n`;
  });
}

console.log(output);
