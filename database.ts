import Fuse from "fuse.js";
import { writeFileSync } from "node:fs";
import readline from "node:readline";
import { isJapanese } from "./utils";

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

const isEnglish = (text: string) => {
  const wordCount = text
    .replace(/[^\p{Script=Latin}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2).length;
  return wordCount > 0 && wordCount <= 3
    ? /\p{Script=Latin}{3,}/u.test(text)
    : wordCount >= 1;
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
          console.error(`Missing value for --${key}`);
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

const args = process.argv.slice(2);
const command = args[0];
const subcommand = args[1];
const param = args.slice(2).join(" ");

if (command === "terminology") {
  if (subcommand === "add") {
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
    if (!isEnglish(body.description)) {
      console.error("Invalid arguments: description must be English");
      process.exit(1);
    }
    if (!body.alias || !body.alias.some(isEnglish)) {
      console.error(
        "Invalid arguments: alias must include at least one English translation",
      );
      process.exit(1);
    }
    if (body.alias.filter(isEnglish).length > 1) {
      console.error(
        "Invalid arguments: alias must include at most one English translation",
      );
      process.exit(1);
    }
    if ((data[body.word] as Terminology)?.description) {
      if (!body.overwrite) {
        console.error(
          `Error: Key '${body.word}' already exists. Existing entry:`,
        );
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
      ).filter(isEnglish).length > 1
    ) {
      if (!body.overwrite) {
        console.error(
          `Error: Key '${body.word}' already has an English alias, please use the same alias. Existing entry:`,
        );
        console.log(JSON.stringify({ [body.word]: data[body.word] }, null, 2));
        process.exit(1);
      } else {
        // Confirm overwrite
        const confirmed = await confirm(
          `Warning: Key '${body.word}' already has an English alias. Overwriting may cause inconsistencies with previous chapter translations. Do you want to continue?`,
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
      console.error("Invalid arguments: --word (string) is required");
      process.exit(1);
    }
    if (!isJapanese(body.word)) {
      console.error("Invalid arguments: word must be Japanese");
      process.exit(1);
    }
    const existing = data[body.word] as Terminology;
    if (!existing?.description) {
      console.error(`Error: Terminology '${body.word}' does not exist.`);
      process.exit(1);
    }
    // Validate description if provided
    if (body.description && !isEnglish(body.description)) {
      console.error("Invalid arguments: description must be English");
      process.exit(1);
    }
    // Validate examples if provided
    if (body.example) {
      console.error("Invalid arguments: terminology does not have examples");
      process.exit(1);
    }
    // Validate aliases - only NON-ENGLISH allowed for update
    if (body.alias) {
      if (!body.alias.every((a: any) => typeof a === "string")) {
        console.error("Invalid arguments: alias must be strings");
        process.exit(1);
      }
      if (body.alias.some(isEnglish)) {
        console.error(
          "Invalid arguments: cannot add English alias via update. English alias can only be set during add.",
        );
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
    console.error("Unknown subcommand");
  }
} else if (command === "personas") {
  if (subcommand === "add") {
    const body = parseArgs(args.slice(2));
    const existed = !!data[body.name];
    if (
      !body.name ||
      typeof body.name !== "string" ||
      !body.description ||
      typeof body.description !== "string" ||
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
        "Invalid arguments: missing required fields or wrong types. Required: --name (string), --description (string), --base_style (string), --negative_constraints (string), --example (string array, required for new), --alias (optional string array)",
      );
      process.exit(1);
    }
    if (!isJapanese(body.name)) {
      console.error("Invalid arguments: name must be Japanese");
      process.exit(1);
    }
    if (!isEnglish(body.description)) {
      console.error("Invalid arguments: description must be English");
      process.exit(1);
    }
    if (!isEnglish(body.base_style)) {
      console.error("Invalid arguments: base_style must be English");
      process.exit(1);
    }
    if (!isEnglish(body.negative_constraints)) {
      console.error("Invalid arguments: negative_constraints must be English");
      process.exit(1);
    }
    if (body.example && !body.example.every(isEnglish)) {
      console.error("Invalid arguments: example must be English");
      process.exit(1);
    }
    if (!body.alias || !body.alias.some(isEnglish)) {
      console.error(
        "Invalid arguments: alias must include at least one English translation",
      );
      process.exit(1);
    }
    if (body.alias.filter(isEnglish).length > 1) {
      console.error(
        "Invalid arguments: alias must include at most one English translation",
      );
      process.exit(1);
    }
    if ((data[body.name] as Persona)?.base_style) {
      if (!body.overwrite) {
        console.error(
          `Error: Key '${body.name}' already exists. Existing entry:`,
        );
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
      ).filter(isEnglish).length > 1
    ) {
      if (!body.overwrite) {
        console.error(
          `Error: Key '${body.name}' already has an English alias, please use the same alias. Existing entry:`,
        );
        console.log(JSON.stringify({ [body.name]: data[body.name] }, null, 2));
        process.exit(1);
      } else {
        // Confirm overwrite
        const confirmed = await confirm(
          `Warning: Key '${body.name}' already has an English alias. Overwriting may cause inconsistencies with previous chapter translations. Do you want to continue?`,
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
      console.error("Invalid arguments: --name (string) is required");
      process.exit(1);
    }
    if (!isJapanese(body.name)) {
      console.error("Invalid arguments: name must be Japanese");
      process.exit(1);
    }
    const existing = data[body.name] as Persona;
    if (!existing) {
      console.error(`Error: Persona '${body.name}' does not exist.`);
      process.exit(1);
    }
    // Validate description if provided
    if (body.description) {
      if (
        typeof body.description !== "string" ||
        !isEnglish(body.description)
      ) {
        console.error("Invalid arguments: description must be English");
        process.exit(1);
      }
    }
    // Validate base_style if provided
    if (body.base_style && !isEnglish(body.base_style)) {
      console.error("Invalid arguments: base_style must be English");
      process.exit(1);
    }
    // Validate negative_constraints if provided
    if (body.negative_constraints && !isEnglish(body.negative_constraints)) {
      console.error("Invalid arguments: negative_constraints must be English");
      process.exit(1);
    }
    // Validate examples if provided - must all be English
    if (body.example && !body.example.every(isEnglish)) {
      console.error("Invalid arguments: example must be English");
      process.exit(1);
    }
    // Validate aliases - only NON-ENGLISH allowed for update
    if (body.alias) {
      if (!body.alias.every((a: any) => typeof a === "string")) {
        console.error("Invalid arguments: alias must be strings");
        process.exit(1);
      }
      if (body.alias.some(isEnglish)) {
        console.error(
          "Invalid arguments: cannot add English alias via update. English alias can only be set during add.",
        );
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
    console.error("Unknown subcommand");
  }
} else if (command === "save") {
  saveData();
  console.log("Saved to", param || "novel_data.json");
} else if (command === "search") {
  const query = subcommand ?? "";
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
      .map(([name, data]) => ({ name, ...data }));

    // For fuzzy search, search each query and combine results
    const fuzzyResults =
      exactMatches.length === 0
        ? fuse
            .search(word)
            .map((r) => ({ item: r.item, score: r.score ?? 1 }))
            .sort((a, b) => a.score - b.score)
        : [];

    const result = [...exactMatches, ...fuzzyResults];

    console.log(JSON.stringify({ query: word, result }, null, 2));
  }
  queries.forEach(search);
} else {
  console.log("Usage:");
  console.log(
    'bun database.ts terminology add --word "日本語単語" --description "English description" --alias "English translation" --invalid-translation "wrong_translation1" --invalid-translation "wrong_translation2"',
  );
  console.log(
    'bun database.ts terminology update --word "日本語単語" --description "New description" --alias "EnglishAlias"',
  );
  console.log(
    'bun database.ts personas add --name "日本語名前" --gender "male" --description "Character description" --base_style "Speaking style" --negative_constraints "Constraints" --example "Example sentence" --alias "EnglishName" --invalid-translation "wrong_translation"',
  );
  console.log(
    'bun database.ts personas update --name "日本語名前" --gender "male" --description "New description" --base_style "New style" --negative_constraints "New constraints" --example "Additional example" --alias "EnglishAlias"',
  );
  console.log("bun database.ts search 'query'");
  console.log("bun database.ts save [filename]");
}
process.exit(0);
