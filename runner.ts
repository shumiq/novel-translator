import { execSync } from "child_process";
import { existsSync } from "fs";
import { config } from "./config";

function runWorkflow({
  skillName,
  queueCmd,
  model,
  agent = (config.agent || "gemini") as "gemini" | "opencode" | "kilo",
}: {
  skillName: string;
  queueCmd?: string;
  model?: string;
  agent?: "gemini" | "opencode" | "kilo";
}) {
  console.log(`>>>>>>>>> Running ${skillName} with ${agent}`);
  console.log(`>>>>>>>>> ${new Date().toLocaleString()}`);

  const queue = queueCmd
    ? execSync(queueCmd)
        .toString()
        .replaceAll("\\", "/")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && existsSync(line))
    : [];

  if (queueCmd && queue.length === 0) {
    console.log(`>>>>>>>>> Queue is empty. Skipping ${skillName}.`);
    return;
  }

  // 💡 NEW: Tell the agent to use the skill by name, rather than reading a file path
  const prompt =
    queueCmd && queue.length > 0
      ? `Use the '${skillName}' skill to process these files: ${queue.join(", ")}`
      : `Use the '${skillName}' skill in auto mode`;

  console.log(`>>>>>>>>> ${skillName}: ${prompt}`);
  try {
    execSync("bun list_characters.ts", {
      stdio: "inherit",
    });
    try {
      if (agent === "gemini")
        execSync(
          `gemini --yolo --model ${model ?? config.model.gemini} --prompt "${prompt}"`,
          {
            stdio: "inherit",
            timeout: 1000 * 60 * 10,
            killSignal: "SIGKILL",
          },
        );
      if (agent === "opencode")
        execSync(
          `opencode run "${prompt}" --model ${model ?? config.model.opencode} --agent translate --thinking true -- --variant med`,
          {
            stdio: "inherit",
            timeout: 1000 * 60 * 10,
            killSignal: "SIGKILL",
          },
        );
      if (agent === "kilo")
        execSync(`kilo run "${prompt}" --model ${model ?? config.model.kilo}`, {
          stdio: "inherit",
          timeout: 1000 * 60 * 10,
          killSignal: "SIGKILL",
        });
    } finally {
      execSync("bun stage_parity_translated.ts", {
        stdio: "inherit",
      });
      execSync("git add .gemini/CHARACTERS.md", {
        stdio: "inherit",
      });
      execSync("git add novel_data.json", {
        stdio: "inherit",
      });
      if (existsSync("consistency_progress.txt"))
        execSync("git add consistency_progress.txt", {
          stdio: "inherit",
        });
      if (existsSync("humanize_progress.txt"))
        execSync("git add humanize_progress.txt", {
          stdio: "inherit",
        });
      // execSync("git commit --amend --no-edit");
    }
  } catch (e) {
    console.error(`>>>>>>>>> Error executing ${skillName} workflow:`, e);
  }
}

for (let i = 0; i < 10; i++) {
  if (execSync("bun extract-non-thai.ts").toString().trim()) {
    runWorkflow({
      skillName: "translator",
      queueCmd: "bun extract-non-thai.ts",
    });
  } else {
    runWorkflow({
      skillName: "consistency",
      queueCmd: "bun extract-thai.ts --progress consistency",
    });
    runWorkflow({
      skillName: "humanize",
      queueCmd: "bun extract-thai.ts --progress humanize",
    });
  }
}

execSync("bun sanitize_all.ts", {
  stdio: "inherit",
});
execSync("bun html_to_json.ts", {
  stdio: "inherit",
});
execSync("git add json", {
  stdio: "inherit",
});
execSync("bun copy_to_destination.ts", {
  stdio: "inherit",
});
