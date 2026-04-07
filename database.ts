import Fuse from "fuse.js";
import { writeFileSync } from "node:fs";
import readline from "node:readline";
import { isJapanese, isThai } from "./utils";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const confirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    rl.question(`${message} (Y/N): `, (answer) => {
      resolve(answer.trim().toUpperCase() === "Y");
      rl.close();
    });
  });
};

type Persona = {
  gender?: string;
  description: string;
  base_style: string;
  negative_constraints: string;
  example: string[];
  alias: string[];
  invalid_translation: string[];
};

type Terminology = {
  description: string;
  alias: string[];
  invalid_translation: string[];
};

let data = {} as Record<string, Persona | Terminology>;

// Load from novel_data.json
const dataFile = Bun.file("novel_data.json");
if (await dataFile.exists()) {
  const dataText = await dataFile.text();
  try {
    data = JSON.parse(dataText) as Record<string, Persona | Terminology>;
  } catch (e) {
    console.error(
      "Invalid JSON in novel_data.json. Please check the file. Error:",
      (e as Error).message,
    );
    process.exit(1);
  }
}

let fuse = new Fuse(
  Object.entries(data).map(([name, data]) => ({ name, ...data })),
  {
    keys: ["name", "alias", "invalid_translation"],
    includeScore: true,
  },
);

const saveData = () => {
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
          console.error(`Error: Missing value for flag '--${key}'. Please provide a value after the flag.`);
          process.exit(1);
        }
        const value = args[i + 1];
        if (
          key === "alias" ||
          key === "example" ||
          key === "invalid-translation"
        ) {
          const finalKey =
            key === "invalid-translation" ? "invalid_translation" : key;
          if (!result[finalKey]) result[finalKey] = [];
          result[finalKey].push(value);
        } else {
          result[key] = value;
        }
        i++; // skip value
      }
    }
  }
  return result;
};

const printHelp = () => {
  console.log("Usage: bun database.ts <command> [subcommand] [options]");
  console.log("");
  console.log("Commands:");
  console.log("  help                      Show this help message");
  console.log("  terminology <add|update>  Manage terminology entries");
  console.log("  personas <add|update>     Manage persona entries");
  console.log("  search <query>            Search the database");
  console.log("  save [filename]           Save data to file");
  console.log("");
  console.log("terminology add [options]");
  console.log("  Required:");
  console.log("    --word <Japanese>         Japanese term");
  console.log("    --description <Thai>      Thai description");
  console.log("    --alias <Thai>            Thai translation (exactly one)");
  console.log("  Optional:");
  console.log("    --invalid-translation <text>  Invalid translation (repeatable)");
  console.log("    --overwrite               Force overwrite existing entry");
  console.log("");
  console.log("terminology update [options]");
  console.log("  Required:");
  console.log("    --word <Japanese>         Japanese term (must exist)");
  console.log("  Optional:");
  console.log("    --description <Thai>      New Thai description");
  console.log("    --alias <text>            Non-Thai alias (repeatable)");
  console.log("    --invalid-translation <text>  Invalid translation (repeatable)");
  console.log("");
  console.log("personas add [options]");
  console.log("  Required:");
  console.log("    --name <Japanese>           Character name");
  console.log("    --gender <ชาย|หญิง|ไม่ระบุ>  Gender");
  console.log("    --description <Thai>        Thai description");
  console.log("    --base_style <Thai>         Thai speaking style");
  console.log("    --negative_constraints <Thai>  Thai constraints");
  console.log("    --example <Thai>            Thai example (repeatable, required for new)");
  console.log("    --alias <Thai>              Thai translation (exactly one)");
  console.log("  Optional:");
  console.log("    --invalid-translation <text>  Invalid translation (repeatable)");
  console.log("    --overwrite               Force overwrite existing entry");
  console.log("");
  console.log("personas update [options]");
  console.log("  Required:");
  console.log("    --name <Japanese>           Character name (must exist)");
  console.log("  Optional:");
  console.log("    --gender <ชาย|หญิง|ไม่ระบุ>  New gender");
  console.log("    --description <Thai>        New Thai description");
  console.log("    --base_style <Thai>         New speaking style");
  console.log("    --negative_constraints <Thai>  New constraints");
  console.log("    --example <Thai>            New example (repeatable)");
  console.log("    --alias <text>              Non-Thai alias (repeatable)");
  console.log("    --invalid-translation <text>  Invalid translation (repeatable)");
  console.log("");
  console.log("Examples:");
  console.log('  bun database.ts terminology add --word "魔法" --description "เวทมนตร์" --alias "เวทมนตร์" --invalid-translation "magic"');
  console.log('  bun database.ts personas add --name "田中" --gender "ชาย" --description "เด็กหนุ่มขี้อาย" --base_style "พูดสุภาพ ใช้ ครับ" --negative_constraints "ไม่ใช้คำหยาบ" --example "สวัสดีครับ" --alias "ทานากะ"');
  console.log('  bun database.ts search "魔法"');
};

const args = process.argv.slice(2);
const command = args[0];
const subcommand = args[1];
const param = args.slice(2).join(" ");

if (!command || command === "help" || command === "--help" || command === "-h") {
  printHelp();
  process.exit(command ? 0 : 1);
} else if (command === "terminology") {
  if (subcommand === "add") {
    const body = parseArgs(args.slice(2));
    
    if (!body.word || typeof body.word !== "string") {
      console.error("Error: Missing or invalid '--word'. You must provide a Japanese string (e.g., --word \"魔法\").");
      process.exit(1);
    }
    if (!body.description || typeof body.description !== "string") {
      console.error("Error: Missing or invalid '--description'. You must provide a Thai string (e.g., --description \"เวทมนตร์\").");
      process.exit(1);
    }
    if (body.alias && !body.alias.every((a: any) => typeof a === "string")) {
      console.error("Error: Invalid '--alias'. All aliases must be strings.");
      process.exit(1);
    }

    if (!isJapanese(body.word)) {
      console.error(`Error: The value for --word ("${body.word}") is invalid. It must contain Japanese characters.`);
      process.exit(1);
    }
    if (!isThai(body.description)) {
      console.error(`Error: The value for --description ("${body.description}") is invalid. It must contain Thai characters.`);
      process.exit(1);
    }
    if (!body.alias || !body.alias.some(isThai)) {
      console.error("Error: Missing Thai alias. You must provide at least one Thai translation using '--alias'.");
      process.exit(1);
    }
    if (body.alias.filter(isThai).length > 1) {
      console.error(`Error: Too many Thai aliases provided (${body.alias.filter(isThai).join(", ")}). You must provide exactly ONE Thai translation in '--alias'.`);
      process.exit(1);
    }

    if ((data[body.word] as Terminology)?.description) {
      if (!body.overwrite) {
        console.error(`Error: Key '${body.word}' already exists. To overwrite, you must explicitly provide the '--overwrite' flag.`);
        console.error("Existing entry:");
        console.log(JSON.stringify({ [body.word]: data[body.word] }, null, 2));
        process.exit(1);
      } else {
        // Confirm overwrite
        const confirmed = await confirm(
          `Warning: Key '${body.word}' already exists. Overwriting may cause inconsistencies with previous chapter translations. Do you want to continue?`,
        );
        if (!confirmed) {
          console.log("Operation canceled.");
          process.exit(0);
        }
      }
    } else if (
      Array.from(
        new Set([...(data[body.word]?.alias || []), ...body.alias]),
      ).filter(isThai).length > 1
    ) {
      if (!body.overwrite) {
        console.error(`Error: Key '${body.word}' already has a Thai alias. Please use the same alias, or use '--overwrite' to force update.`);
        console.error("Existing entry:");
        console.log(JSON.stringify({ [body.word]: data[body.word] }, null, 2));
        process.exit(1);
      } else {
        // Confirm overwrite
        const confirmed = await confirm(
          `Warning: Key '${body.word}' already has a Thai alias. Overwriting may cause inconsistencies with previous chapter translations. Do you want to continue?`,
        );
        if (!confirmed) {
          console.log("Operation canceled.");
          process.exit(0);
        }
      }
    }

    data[body.word] = {
      ...data[body.word],
      description: body.description,
      alias: Array.from(
        new Set([...(data[body.word]?.alias || []), ...body.alias]),
      ),
      invalid_translation: Array.from(
        new Set([
          ...(data[body.word]?.invalid_translation || []),
          ...(body.invalid_translation || []),
        ]),
      ),
    };
    fuse = new Fuse(
      Object.entries(data).map(([name, data]) => ({
        name,
        ...data,
      })),
      {
        keys: ["name", "alias", "invalid_translation"],
      },
    );
    saveData();
    console.log("Added");
  } else if (subcommand === "update") {
    const body = parseArgs(args.slice(2));
    
    if (!body.word || typeof body.word !== "string") {
      console.error("Error: Missing '--word'. You must specify which terminology to update.");
      process.exit(1);
    }
    if (!isJapanese(body.word)) {
      console.error(`Error: The value for --word ("${body.word}") is invalid. It must contain Japanese characters.`);
      process.exit(1);
    }
    
    const existing = data[body.word] as Terminology;
    if (!existing?.description) {
      console.error(`Error: Terminology '${body.word}' does not exist in the database. Use 'terminology add' to create it first.`);
      process.exit(1);
    }
    
    // Validate description if provided
    if (body.description && !isThai(body.description)) {
      console.error(`Error: The value for --description ("${body.description}") is invalid. It must contain Thai characters.`);
      process.exit(1);
    }
    // Validate examples if provided
    if (body.example) {
      console.error("Error: Terminology entries do not support the '--example' field. Did you mean to use 'personas update'?");
      process.exit(1);
    }
    // Validate aliases - only NON-THAI allowed for update
    if (body.alias) {
      if (!body.alias.every((a: any) => typeof a === "string")) {
        console.error("Error: Invalid '--alias'. All aliases must be strings.");
        process.exit(1);
      }
      if (body.alias.some(isThai)) {
        console.error(`Error: Cannot add Thai alias ("${body.alias.filter(isThai).join(", ")}") via 'update'. The primary Thai alias can only be set during 'add'.`);
        process.exit(1);
      }
    }
    
    // Update fields
    const updated: Terminology = {
      description: body.description || existing.description,
      alias: Array.from(
        new Set([...(existing.alias || []), ...(body.alias || [])]),
      ),
      invalid_translation: Array.from(
        new Set([
          ...(existing.invalid_translation || []),
          ...(body.invalid_translation || []),
        ]),
      ),
    };
    data[body.word] = updated;
    fuse = new Fuse(
      Object.entries(data).map(([name, data]) => ({ name, ...data })),
      {
        keys: ["name", "alias", "invalid_translation"],
      },
    );
    saveData();
    console.log("Updated");
  } else {
    console.error(`Error: Unknown subcommand '${subcommand}' for 'terminology'. Valid subcommands are 'add' and 'update'.`);
    process.exit(1);
  }
} else if (command === "personas") {
  if (subcommand === "add") {
    const body = parseArgs(args.slice(2));
    const existed = !!data[body.name];
    
    if (!body.name || typeof body.name !== "string") {
      console.error("Error: Missing or invalid '--name'. You must provide a Japanese string.");
      process.exit(1);
    }
    if (!body.description || typeof body.description !== "string") {
      console.error("Error: Missing or invalid '--description'. You must provide a Thai string.");
      process.exit(1);
    }
    if (!body.base_style || typeof body.base_style !== "string") {
      console.error("Error: Missing or invalid '--base_style'. You must provide a Thai string.");
      process.exit(1);
    }
    if (!body.negative_constraints || typeof body.negative_constraints !== "string") {
      console.error("Error: Missing or invalid '--negative_constraints'. You must provide a Thai string.");
      process.exit(1);
    }
    if (!existed && !body.example) {
      console.error("Error: Missing '--example'. At least one example is required when adding a new persona.");
      process.exit(1);
    }
    if (body.example && (!Array.isArray(body.example) || !body.example.every((e: any) => typeof e === "string"))) {
      console.error("Error: Invalid '--example'. All examples must be strings.");
      process.exit(1);
    }
    if (body.alias && !body.alias.every((a: any) => typeof a === "string")) {
      console.error("Error: Invalid '--alias'. All aliases must be strings.");
      process.exit(1);
    }

    if (!isJapanese(body.name)) {
      console.error(`Error: The value for --name ("${body.name}") is invalid. It must contain Japanese characters.`);
      process.exit(1);
    }
    if (["ชาย", "หญิง", "ไม่ระบุ"].indexOf(body.gender) === -1) {
      console.error(`Error: Invalid gender "${body.gender}". Must be exactly one of: ชาย, หญิง, ไม่ระบุ`);
      process.exit(1);
    }
    if (!isThai(body.description)) {
      console.error(`Error: The value for --description ("${body.description}") is invalid. It must contain Thai characters.`);
      process.exit(1);
    }
    if (!isThai(body.base_style)) {
      console.error(`Error: The value for --base_style ("${body.base_style}") is invalid. It must contain Thai characters.`);
      process.exit(1);
    }
    if (!isThai(body.negative_constraints)) {
      console.error(`Error: The value for --negative_constraints ("${body.negative_constraints}") is invalid. It must contain Thai characters.`);
      process.exit(1);
    }
    if (body.example && !body.example.every(isThai)) {
      console.error("Error: Invalid '--example'. All examples must contain Thai characters.");
      process.exit(1);
    }
    if (!body.alias || !body.alias.some(isThai)) {
      console.error("Error: Missing Thai alias. You must provide at least one Thai translation using '--alias'.");
      process.exit(1);
    }
    if (body.alias.filter(isThai).length > 1) {
      console.error(`Error: Too many Thai aliases provided (${body.alias.filter(isThai).join(", ")}). You must provide exactly ONE Thai translation in '--alias'.`);
      process.exit(1);
    }

    if ((data[body.name] as Persona)?.base_style) {
      if (!body.overwrite) {
        console.error(`Error: Key '${body.name}' already exists. To overwrite, you must explicitly provide the '--overwrite' flag.`);
        console.error("Existing entry:");
        console.log(JSON.stringify({ [body.name]: data[body.name] }, null, 2));
        process.exit(1);
      } else {
        // Confirm overwrite
        const confirmed = await confirm(
          `Warning: Key '${body.name}' already exists. Overwriting may cause inconsistencies with previous chapter translations. Do you want to continue?`,
        );
        if (!confirmed) {
          console.log("Operation canceled.");
          process.exit(0);
        }
      }
    } else if (
      Array.from(
        new Set([...(data[body.name]?.alias || []), ...body.alias]),
      ).filter(isThai).length > 1
    ) {
      if (!body.overwrite) {
        console.error(`Error: Key '${body.name}' already has a Thai alias. Please use the same alias, or use '--overwrite' to force update.`);
        console.error("Existing entry:");
        console.log(JSON.stringify({ [body.name]: data[body.name] }, null, 2));
        process.exit(1);
      } else {
        // Confirm overwrite
        const confirmed = await confirm(
          `Warning: Key '${body.name}' already has a Thai alias. Overwriting may cause inconsistencies with previous chapter translations. Do you want to continue?`,
        );
        if (!confirmed) {
          console.log("Operation canceled.");
          process.exit(0);
        }
      }
    }

    data[body.name] = {
      ...data[body.name],
      gender: body.gender,
      description: body.description,
      base_style: body.base_style,
      negative_constraints: body.negative_constraints,
      example: body.example,
      alias: Array.from(
        new Set([...(data[body.name]?.alias || []), ...body.alias]),
      ),
      invalid_translation: Array.from(
        new Set([
          ...(data[body.name]?.invalid_translation || []),
          ...(body.invalid_translation || []),
        ]),
      ),
    };
    fuse = new Fuse(
      Object.entries(data).map(([name, data]) => ({ name, ...data })),
      {
        keys: ["name", "alias", "invalid_translation"],
      },
    );
    saveData();
    console.log("Added");
  } else if (subcommand === "update") {
    const body = parseArgs(args.slice(2));
    
    if (!body.name || typeof body.name !== "string") {
      console.error("Error: Missing '--name'. You must specify which persona to update.");
      process.exit(1);
    }
    if (!isJapanese(body.name)) {
      console.error(`Error: The value for --name ("${body.name}") is invalid. It must contain Japanese characters.`);
      process.exit(1);
    }
    
    const existing = data[body.name] as Persona;
    if (!existing) {
      console.error(`Error: Persona '${body.name}' does not exist in the database. Use 'personas add' to create it first.`);
      process.exit(1);
    }
    
    // Validate description if provided
    if (body.description) {
      if (typeof body.description !== "string" || !isThai(body.description)) {
        console.error(`Error: The value for --description ("${body.description}") is invalid. It must be a string containing Thai characters.`);
        process.exit(1);
      }
    }
    // Validate gender if provided
    if (
      body.gender &&
      (typeof body.gender !== "string" || ["ชาย", "หญิง", "ไม่ระบุ"].indexOf(body.gender) === -1)
    ) {
      console.error(`Error: Invalid gender "${body.gender}". Must be exactly one of: ชาย, หญิง, ไม่ระบุ`);
      process.exit(1);
    }
    // Validate base_style if provided
    if (body.base_style && !isThai(body.base_style)) {
      console.error(`Error: The value for --base_style ("${body.base_style}") is invalid. It must contain Thai characters.`);
      process.exit(1);
    }
    // Validate negative_constraints if provided
    if (body.negative_constraints && !isThai(body.negative_constraints)) {
      console.error(`Error: The value for --negative_constraints ("${body.negative_constraints}") is invalid. It must contain Thai characters.`);
      process.exit(1);
    }
    // Validate examples if provided - must all be Thai
    if (body.example && !body.example.every(isThai)) {
      console.error("Error: Invalid '--example'. All examples must contain Thai characters.");
      process.exit(1);
    }
    // Validate aliases - only NON-THAI allowed for update
    if (body.alias) {
      if (!body.alias.every((a: any) => typeof a === "string")) {
        console.error("Error: Invalid '--alias'. All aliases must be strings.");
        process.exit(1);
      }
      if (body.alias.some(isThai)) {
        console.error(`Error: Cannot add Thai alias ("${body.alias.filter(isThai).join(", ")}") via 'update'. The primary Thai alias can only be set during 'add'.`);
        process.exit(1);
      }
    }
    
    // Update fields
    const updated: Persona = {
      ...existing,
      gender: body.gender || existing.gender,
      description: body.description || existing.description,
      base_style: body.base_style || existing.base_style,
      negative_constraints:
        body.negative_constraints || existing.negative_constraints,
      example: Array.from(
        new Set([...(existing.example || []), ...(body.example || [])]),
      ),
      alias: Array.from(
        new Set([...(existing.alias || []), ...(body.alias || [])]),
      ),
      invalid_translation: Array.from(
        new Set([
          ...(existing.invalid_translation || []),
          ...(body.invalid_translation || []),
        ]),
      ),
    };
    data[body.name] = updated;
    fuse = new Fuse(
      Object.entries(data).map(([name, data]) => ({ name, ...data })),
      {
        keys: ["name", "alias", "invalid_translation"],
      },
    );
    saveData();
    console.log("Updated");
  } else {
    console.error(`Error: Unknown subcommand '${subcommand}' for 'personas'. Valid subcommands are 'add' and 'update'.`);
    process.exit(1);
  }
} else if (command === "save") {
  saveData();
  console.log("Saved to", param || "novel_data.json");
} else if (command === "search") {
  const query = args.slice(1).join(" ") ?? "";
  const queries = query
    .trim()
    .split(/\s+/)
    .filter((q) => q.length > 0);

  function search(word: string) {
    const exactMatches = Object.entries(data)
      .filter(
        ([name, data]) =>
          name === word ||
          data.alias.includes(word) ||
          (data.invalid_translation || []).includes(word),
      )
      .map(([name, data]) => ({ name, ...data, score: 0 }));

    // For fuzzy search, search each query and combine results
    const fuzzyResults = fuse
      .search(word)
      .map((r) => ({ ...r.item, score: r.score ?? 1 }))
      .filter((r) => !exactMatches.some((e) => e.name === r.name))
      .sort((a, b) => a.score - b.score)
      .slice(0, 10);
    const result = [...exactMatches, ...fuzzyResults] as (
      | Persona
      | (Terminology & { name: string; score?: number })
    )[];

    console.log(`=== SEARCH_RESULT_START query="${word}" ===`);
    if (result.length === 0) {
      console.log("No results found.");
    } else {
      result.forEach((entry, index) => {
        const isPersona = "base_style" in entry;
        console.log(
          `\n[Result ${index + 1}] Type: ${isPersona ? "Persona" : "Terminology"}`,
        );
        if ("name" in entry) console.log(`  Name: ${entry.name}`);
        if ("gender" in entry && entry.gender)
          console.log(`  Gender: ${entry.gender}`);
        console.log(`  Description (Thai): ${entry.description}`);
        if (isPersona) {
          console.log(`  Base Style (Thai): ${entry.base_style}`);
          console.log(
            `  Negative Constraints (Thai): ${entry.negative_constraints}`,
          );
        }
        if (entry.alias?.length > 0) {
          console.log(
            `  Translation: ${entry.alias.filter(isThai).join(", ")}`,
          );
        }
        if (entry.invalid_translation?.length > 0) {
          console.log(
            `  Invalid Translations: ${entry.invalid_translation.join(", ")}`,
          );
        }
        if (isPersona && entry.example?.length > 0) {
          console.log(`  Examples:`);
          entry.example.forEach((ex: string) =>
            console.log(
              `    - ${typeof ex === "string" ? ex : JSON.stringify(ex)}`,
            ),
          );
        }
        if ("score" in entry) {
          console.log(`  Match Score: ${(entry as any).score.toFixed(4)}`);
        }
      });
    }
    console.log(`=== SEARCH_RESULT_END ===`);
  }
  queries.forEach(search);
} else {
  console.error(`Error: Invalid command '${command}'.`);
  console.error("Run 'bun database.ts help' for usage information.");
  process.exit(1);
}
process.exit(0);