import Fuse from "fuse.js";
import { writeFileSync } from "node:fs";

type Persona = {
  gender?: string;
  description: string;
  base_style: string;
  negative_constraints: string;
  example: string[];
  alias: string[];
};

type Terminology = {
  description: string;
  alias: string[];
};

const isJapanese = (text: string) =>
  /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(text);
const isThai = (text: string) => /\p{sc=Thai}/u.test(text);

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
    keys: ["name", "alias"],
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
    if (!isThai(body.description)) {
      console.error("Invalid arguments: description must be Thai");
      process.exit(1);
    }
    if (!body.alias || !body.alias.some(isThai)) {
      console.error(
        "Invalid arguments: alias must include at least one Thai translation",
      );
      process.exit(1);
    }
    if (body.alias.filter(isThai).length > 1) {
      console.error(
        "Invalid arguments: alias must include at most one Thai translation",
      );
      process.exit(1);
    }
    if ((data[body.word] as Terminology)?.description && !body.overwrite) {
      console.error(
        `Error: Key '${body.word}' already exists. Existing entry:`,
      );
      console.log(JSON.stringify({ [body.word]: data[body.word] }, null, 2));
      process.exit(1);
    } else if (
      !body.overwrite &&
      Array.from(
        new Set([...(data[body.word]?.alias || []), ...body.alias]),
      ).filter(isThai).length > 1
    ) {
      console.error(
        `Error: Key '${body.word}' already has a Thai alias, please use the same alias. Existing entry:`,
      );
      console.log(JSON.stringify({ [body.word]: data[body.word] }, null, 2));
      process.exit(1);
    } else {
      data[body.word] = {
        ...data[body.word],
        description: body.description,
        alias: Array.from(
          new Set([...(data[body.word]?.alias || []), ...body.alias]),
        ),
      };
    }
    fuse = new Fuse(
      Object.entries(data).map(([name, data]) => ({
        name,
        ...data,
      })),
      {
        keys: ["name", "alias"],
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
    if (body.description && !isThai(body.description)) {
      console.error("Invalid arguments: description must be Thai");
      process.exit(1);
    }
    // Validate examples if provided
    if (body.example) {
      console.error("Invalid arguments: terminology does not have examples");
      process.exit(1);
    }
    // Validate aliases - only NON-THAI allowed for update
    if (body.alias) {
      if (!body.alias.every((a: any) => typeof a === "string")) {
        console.error("Invalid arguments: alias must be strings");
        process.exit(1);
      }
      if (body.alias.some(isThai)) {
        console.error(
          "Invalid arguments: cannot add Thai alias via update. Thai alias can only be set during add.",
        );
        process.exit(1);
      }
    }
    // Update fields
    const updated: Terminology = {
      description: body.description || existing.description,
      alias: Array.from(new Set([...existing.alias, ...(body.alias || [])])),
    };
    data[body.word] = updated;
    fuse = new Fuse(
      Object.entries(data).map(([name, data]) => ({ name, ...data })),
      {
        keys: ["name", "alias"],
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
    if (!isThai(body.description)) {
      console.error("Invalid arguments: description must be Thai");
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
      console.error(
        "Invalid arguments: alias must include at least one Thai translation",
      );
      process.exit(1);
    }
    if (body.alias.filter(isThai).length > 1) {
      console.error(
        "Invalid arguments: alias must include at most one Thai translation",
      );
      process.exit(1);
    }
    if ((data[body.name] as Persona)?.base_style && !body.overwrite) {
      console.error(
        `Error: Key '${body.name}' already exists. Existing entry:`,
      );
      console.log(JSON.stringify({ [body.name]: data[body.name] }, null, 2));
      process.exit(1);
    } else if (
      !body.overwrite &&
      Array.from(
        new Set([...(data[body.name]?.alias || []), ...body.alias]),
      ).filter(isThai).length > 1
    ) {
      console.error(
        `Error: Key '${body.name}' already has a Thai alias, please use the same alias. Existing entry:`,
      );
      console.log(JSON.stringify({ [body.name]: data[body.name] }, null, 2));
      process.exit(1);
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
    };
    fuse = new Fuse(
      Object.entries(data).map(([name, data]) => ({ name, ...data })),
      {
        keys: ["name", "alias"],
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
    if (!existing?.description) {
      console.error(`Error: Persona '${body.name}' does not exist.`);
      process.exit(1);
    }
    // Validate description if provided
    if (!body.description || typeof body.description !== "string") {
      console.error("Invalid arguments: --description (string) is required");
      process.exit(1);
    }
    if (!isThai(body.description)) {
      console.error("Invalid arguments: description must be Thai");
      process.exit(1);
    }
    // Validate base_style if provided
    if (body.base_style && !isThai(body.base_style)) {
      console.error("Invalid arguments: base_style must be Thai");
      process.exit(1);
    }
    // Validate negative_constraints if provided
    if (body.negative_constraints && !isThai(body.negative_constraints)) {
      console.error("Invalid arguments: negative_constraints must be Thai");
      process.exit(1);
    }
    // Validate examples if provided - must all be Thai
    if (body.example && !body.example.every(isThai)) {
      console.error("Invalid arguments: example must be Thai");
      process.exit(1);
    }
    // Validate aliases - only NON-THAI allowed for update
    if (body.alias) {
      if (!body.alias.every((a: any) => typeof a === "string")) {
        console.error("Invalid arguments: alias must be strings");
        process.exit(1);
      }
      if (body.alias.some(isThai)) {
        console.error(
          "Invalid arguments: cannot add Thai alias via update. Thai alias can only be set during add.",
        );
        process.exit(1);
      }
    }
    // Update fields
    const updated: Persona = {
      ...existing,
      gender: body.gender || existing.gender,
      description: body.description,
      base_style: body.base_style || existing.base_style,
      negative_constraints:
        body.negative_constraints || existing.negative_constraints,
      example: Array.from(
        new Set([...(existing.example || []), ...(body.example || [])]),
      ),
      alias: Array.from(new Set([...(existing.alias || []), ...(body.alias || [])])),
    };
    data[body.name] = updated;
    fuse = new Fuse(
      Object.entries(data).map(([name, data]) => ({ name, ...data })),
      {
        keys: ["name", "alias"],
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

  // Search terminology
  const exactMatches = Object.entries(data)
    .filter(([name, data]) =>
      queries.some((q) => name === q || data.alias.includes(q)),
    )
    .map(([name, data]) => ({ name, ...data }));

  // For fuzzy search, search each query and combine results
  const fuzzyResults =
    exactMatches.length > 0
      ? []
      : queries.flatMap((q) => fuse.search(q)).map((r) => r.item);

  const result = [...exactMatches, ...fuzzyResults];

  console.log(JSON.stringify(result, null, 2));
} else {
  console.log("Usage:");
  console.log(
    'bun database.ts terminology add --word "日本語単語" --description "คำอธิบายภาษาไทย" --alias "คำแปลภาษาไทย"',
  );
  console.log(
    'bun database.ts terminology update --word "日本語単語" --description "คำอธิบายใหม่" --alias "EnglishAlias"',
  );
  console.log(
    'bun database.ts personas add --name "日本語名前" --gender "ชาย" --description "คำอธิบายบุคลิก" --base_style "สไตล์การพูด" --negative_constraints "ข้อจำกัด" --example "ตัวอย่างประโยค" --alias "ชื่อภาษาไทย"',
  );
  console.log(
    'bun database.ts personas update --name "日本語名前" --gender "ชาย" --description "คำอธิบายใหม่" --base_style "สไตล์ใหม่" --negative_constraints "ข้อจำกัดใหม่" --example "ตัวอย่างเพิ่มเติม" --alias "EnglishAlias"',
  );
  console.log("bun database.ts search 'query'");
  console.log("bun database.ts save [filename]");
}
