import { execSync } from "child_process";
import { existsSync } from "fs";

const DEFAULT_AGENT = process.env.DEFAULT_AGENT as Pick<
  Parameters<typeof runWorkflow>[0],
  "agent"
>["agent"];

function runWorkflow({
  skillName,
  queueCmd,
  model,
  agent = DEFAULT_AGENT,
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
          `gemini --yolo --model ${model ?? "gemini-3.1-flash-lite-preview"} --prompt "${prompt}"`,
          {
            stdio: "inherit",
            timeout: 1000 * 60 * 10,
            killSignal: "SIGKILL",
          },
        );
      if (agent === "opencode")
        execSync(
          `opencode run "${prompt}" --model ${model ?? "google/gemini-3.1-flash-lite-preview"}`,
          {
            stdio: "inherit",
            timeout: 1000 * 60 * 10,
            killSignal: "SIGKILL",
          },
        );
      if (agent === "kilo")
        execSync(`kilo run "${prompt}" --model kilo/openrouter/hunter-alpha`, {
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
      execSync("git add consistency_progress.txt", {
        stdio: "inherit",
      });
      execSync("git add polish_progress.txt", {
        stdio: "inherit",
      });
      // execSync("git commit --amend --no-edit");
    }
  } catch (e) {
    console.error(`>>>>>>>>> Error executing ${skillName} workflow:`, e);
  }
}

for (let i = 0; i < 10; i++) {
  runWorkflow({
    skillName: "translator",
    queueCmd: "bun extract-non-thai.ts",
  });
  if (execSync("bun extract-leftover-japanese.ts").toString().trim())
    runWorkflow({
      skillName: "japanese-purifier",
    });
  runWorkflow({
    skillName: "consistency",
    queueCmd: "bun extract-thai.ts --progress consistency",
  });
  runWorkflow({
    skillName: "polish",
    queueCmd: "bun extract-thai.ts --progress polish",
  });
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
