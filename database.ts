import Fuse from "fuse.js";
import { writeFileSync } from "node:fs";

let terminologyData: Record<string, { description: string; alias: string[] }> =
  {};

let personaData: Record<
  string,
  {
    base_style: string;
    negative_constraints: string;
    example: string[];
    alias: string[];
  }
> = {};

const isJapanese = (text: string) => /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(text);
const isThai = (text: string) => /\p{sc=Thai}/u.test(text);

// Load from novel_data.json
const dataFile = Bun.file("novel_data.json");
if (await dataFile.exists()) {
  const dataText = await dataFile.text();
  let data;
  try {
    data = JSON.parse(dataText);
  } catch (e) {
    console.error(
      "Invalid JSON in novel_data.json. Please check the file. Error:",
      (e as Error).message,
    );
    process.exit(1);
  }
  if (Array.isArray(data.terminology)) {
    terminologyData = {};
    for (const item of data.terminology) {
      terminologyData[item.word] = {
        description: item.description,
        alias: item.alias,
      };
    }
  } else {
    terminologyData = data.terminology || {};
  }
  if (Array.isArray(data.personas)) {
    personaData = {};
    for (const item of data.personas) {
      personaData[item.name] = {
        base_style: item.base_style,
        negative_constraints: item.negative_constraints,
        example: item.example,
        alias: item.alias,
      };
    }
  } else {
    personaData = data.personas || {};
  }
}

let terminologyFuse = new Fuse(
  Object.entries(terminologyData).map(([word, data]) => ({ word, ...data })),
  {
    keys: ["word", "alias"],
  },
);

let personaFuse = new Fuse(
  Object.entries(personaData).map(([name, data]) => ({ name, ...data })),
  {
    keys: ["name", "alias"],
  },
);

const saveData = () => {
  const data = {
    terminology: terminologyData,
    personas: personaData,
  };
  writeFileSync("novel_data.json", JSON.stringify(data, null, 2), "utf8");
};

const parseArgs = (args: string[]) => {
  const result: any = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (typeof arg === "string" && arg.startsWith("--")) {
      const key = arg.slice(2);
      if (key === "overwrite") {
        result[key] = true;
      } else {
        if (i + 1 >= args.length) {
          console.error(`Missing value for --${key}`);
          process.exit(1);
        }
        const value = args[i + 1];
        if (key === "alias" || key === "example") {
          if (!result[key]) result[key] = [];
          result[key].push(value);
        } else {
          result[key] = value;
        }
        i++; // skip value
      }
    }
  }
  return result;
};

const args = process.argv.slice(2);
const command = args[0];
const subcommand = args[1];
const param = args.slice(2).join(" ");

if (command === "terminology") {
  if (subcommand === "list") {
    const result = Object.entries(terminologyData).map(
      ([word, { description, alias }]) => ({
        [word]: {
          description,
          alias,
        },
      }),
    );
    console.log(JSON.stringify(result, null, 2));
  } else if (subcommand === "add") {
    const body = parseArgs(args.slice(2));
    if (
      !body.word ||
      typeof body.word !== "string" ||
      !body.description ||
      typeof body.description !== "string" ||
      (body.alias && !body.alias.every((a: any) => typeof a === "string"))
    ) {
      console.error(
        "Invalid arguments: missing required fields or wrong types. Required: --word (string), --description (string), --alias (optional string array)",
      );
      process.exit(1);
    }
    if (!isJapanese(body.word)) {
      console.error("Invalid arguments: word must be Japanese");
      process.exit(1);
    }
    if (!isThai(body.description)) {
      console.error("Invalid arguments: description must be Thai");
      process.exit(1);
    }
    if (!body.alias || !body.alias.some(isThai)) {
      console.error("Invalid arguments: alias must include at least one Thai translation");
      process.exit(1);
    }
    for (const thai of body.alias.filter(isThai)) {
      for (const [jp, persona] of Object.entries(personaData)) {
        if (persona.alias.some(alias => alias === thai)) {
          if (jp !== body.word) {
            console.error(`Conflict: Thai alias '${thai}' is used in persona '${jp}', but terminology key is '${body.word}'`);
            process.exit(1);
          }
        }
      }
    }
    if (terminologyData[body.word]) {
      console.error(`Error: Key '${body.word}' already exists. Existing entry:`);
      console.log(JSON.stringify({ [body.word]: terminologyData[body.word] }, null, 2));
      process.exit(1);
    } else {
      terminologyData[body.word] = {
        description: body.description,
        alias: body.alias || [],
      };
    }
    terminologyFuse = new Fuse(
      Object.entries(terminologyData).map(([word, data]) => ({
        word,
        ...data,
      })),
      {
        keys: ["word", "alias"],
      },
    );
    saveData();
    console.log("Added");
  } else if (subcommand === "update") {
    const body = parseArgs(args.slice(2));
    if (!body.word || !terminologyData[body.word]) {
      console.error("Invalid arguments: word missing or not found");
      process.exit(1);
    }
    const existing = terminologyData[body.word]!;
    terminologyData[body.word] = {
      description: body.description || existing.description,
      alias: body.overwrite ? (body.alias || existing.alias) : (body.alias
        ? Array.from(new Set([...existing.alias, ...body.alias]))
        : existing.alias),
    };
    saveData();
    console.log("Updated");
  } else {
    console.error("Unknown subcommand");
  }
} else if (command === "personas") {
  if (subcommand === "list") {
    const result = Object.entries(personaData).map(
      ([name, { base_style, negative_constraints, example, alias }]) => ({
        [name]: {
          base_style,
          negative_constraints,
          example,
          alias,
        },
      }),
    );
    console.log(JSON.stringify(result, null, 2));
  } else if (subcommand === "add") {
    const body = parseArgs(args.slice(2));
    const existed = !!personaData[body.name];
    if (
      !body.name ||
      typeof body.name !== "string" ||
      !body.base_style ||
      typeof body.base_style !== "string" ||
      !body.negative_constraints ||
      typeof body.negative_constraints !== "string" ||
      (!existed && !body.example) ||
      (body.example &&
        (!Array.isArray(body.example) ||
          !body.example.every((e: any) => typeof e === "string"))) ||
      (body.alias && !body.alias.every((a: any) => typeof a === "string"))
    ) {
      console.error(
        "Invalid arguments: missing required fields or wrong types. Required: --name (string), --base_style (string), --negative_constraints (string), --example (string array, required for new), --alias (optional string array)",
      );
      process.exit(1);
    }
    if (!isJapanese(body.name)) {
      console.error("Invalid arguments: name must be Japanese");
      process.exit(1);
    }
    if (!isThai(body.base_style)) {
      console.error("Invalid arguments: base_style must be Thai");
      process.exit(1);
    }
    if (!isThai(body.negative_constraints)) {
      console.error("Invalid arguments: negative_constraints must be Thai");
      process.exit(1);
    }
    if (body.example && !body.example.every(isThai)) {
      console.error("Invalid arguments: example must be Thai");
      process.exit(1);
    }
    if (!body.alias || !body.alias.some(isThai)) {
      console.error("Invalid arguments: alias must include at least one Thai translation");
      process.exit(1);
    }
    for (const thai of body.alias.filter(isThai)) {
      for (const [jp, term] of Object.entries(terminologyData)) {
        if (term.alias.some(alias => alias === thai)) {
          if (jp !== body.name) {
            console.error(`Conflict: Thai alias '${thai}' is used in terminology '${jp}', but persona key is '${body.name}'`);
            process.exit(1);
          }
        }
      }
    }
    if (personaData[body.name]) {
      console.error(`Error: Key '${body.name}' already exists. Existing entry:`);
      console.log(JSON.stringify({ [body.name]: personaData[body.name] }, null, 2));
      process.exit(1);
    }
    personaData[body.name] = {
      base_style: body.base_style,
      negative_constraints: body.negative_constraints,
      example: body.example,
      alias: body.alias || [],
    };
    personaFuse = new Fuse(
      Object.entries(personaData).map(([name, data]) => ({ name, ...data })),
      {
        keys: ["name", "alias"],
      },
    );
    saveData();
    console.log("Added");
  } else if (subcommand === "update") {
    const body = parseArgs(args.slice(2));
    if (!body.name || !personaData[body.name]) {
      console.error("Invalid arguments: name missing or not found");
      process.exit(1);
    }
    const existing = personaData[body.name]!;
    personaData[body.name] = {
      base_style: body.base_style || existing.base_style,
      negative_constraints: body.negative_constraints || existing.negative_constraints,
      example: body.overwrite ? (body.example || existing.example) : (body.example ? Array.from(new Set([...existing.example, ...body.example])) : existing.example),
      alias: body.overwrite ? (body.alias || existing.alias) : (body.alias
        ? Array.from(new Set([...existing.alias, ...body.alias]))
        : existing.alias),
    };
    saveData();
    console.log("Updated");
  } else {
    console.error("Unknown subcommand");
  }
} else if (command === "save") {
  saveData();
  console.log("Saved to", param || "novel_data.json");
} else if (command === "import") {
  // Import from param file
  const filename = param || subcommand;
  const importFile = Bun.file(filename ?? "{}");
  if (await importFile.exists()) {
    const dataText = await importFile.text();
    let data;
    try {
      data = JSON.parse(dataText);
    } catch (e) {
      console.error(
        "Invalid JSON in import file. Please ensure the file contains valid JSON. Error:",
        (e as Error).message,
      );
      process.exit(1);
    }
    // Merge terminology
    if (Array.isArray(data.terminology)) {
      for (const item of data.terminology) {
        terminologyData[item.word] = {
          description: item.description,
          alias: item.alias,
        };
      }
    } else {
      Object.assign(terminologyData, data.terminology || {});
    }
    // Merge personas
    if (Array.isArray(data.personas)) {
      for (const item of data.personas) {
        personaData[item.name] = {
          base_style: item.base_style,
          negative_constraints: item.negative_constraints,
          example: item.example,
          alias: item.alias,
        };
      }
    } else {
      Object.assign(personaData, data.personas || {});
    }
    terminologyFuse = new Fuse(
      Object.entries(terminologyData).map(([word, data]) => ({
        word,
        ...data,
      })),
      {
        keys: ["word", "alias"],
      },
    );
    personaFuse = new Fuse(
      Object.entries(personaData).map(([name, data]) => ({ name, ...data })),
      {
        keys: ["name", "alias"],
      },
    );
    saveData();
    console.log("Imported from", filename);
  } else {
    console.error("File not found");
  }
} else if (command === "search") {
  const query = subcommand ?? "";
  // Search terminology
  const termExactMatches = Object.entries(terminologyData)
    .filter(([word, data]) => word === query || data.alias.includes(query))
    .map(([word, data]) => ({ word, ...data }));
  const termFuzzyResults =
    termExactMatches.length > 0
      ? []
      : terminologyFuse
          .search(query)
          .filter(
            (res) => !termExactMatches.some((ex) => ex.word === res.item.word),
          );
  const termResults = [
    ...termExactMatches.map((item) => ({ item })),
    ...termFuzzyResults,
  ];
  // Search personas
  const personaExactMatches = Object.entries(personaData)
    .filter(([name, data]) => name === query || data.alias.includes(query))
    .map(([name, data]) => ({ name, ...data }));
  const personaFuzzyResults =
    personaExactMatches.length > 0
      ? []
      : personaFuse
          .search(query)
          .filter(
            (res) => !personaExactMatches.some((ex) => ex.name === res.item.name),
          );
  const personaResults = [
    ...personaExactMatches.map((item) => ({ item })),
    ...personaFuzzyResults,
  ];
  // Combine results
  const result = {
    terminology: termResults.map((res) => ({
      [res.item.word]: {
        description: res.item.description,
        alias: res.item.alias,
      },
    })),
    personas: personaResults.map((res) => ({
      [res.item.name]: {
        base_style: res.item.base_style,
        negative_constraints: res.item.negative_constraints,
        example: res.item.example,
        alias: res.item.alias,
      },
    })),
  };
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log("Usage:");
  console.log("bun database.ts terminology list");
  console.log(
    'bun database.ts terminology add --word "test" --description "desc"',
  );
  console.log("bun database.ts personas list");
  console.log(
    'bun database.ts personas add --name "test" --base_style "style" --negative_constraints "constraints" --example "example"',
  );
  console.log("bun database.ts search 'query'");
  console.log("bun database.ts save [filename]");
  console.log("bun database.ts import <filename>");
}
