import { execSync } from "child_process";

function runWorkflow(
  workflow: string,
  queueCmd: string,
  agent: "gemini" | "opencode" | "kilo" = "gemini",
) {
  console.log(`>>>>>>>>> Running ${workflow}`);
  console.log(`>>>>>>>>> ${new Date().toLocaleString()}`);
  const queue = execSync(queueCmd)
    .toString()
    .replaceAll("\\", "/")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (queue.length > 0) {
    const prompt = `execute ${workflow} to these files: ${queue.map((file) => `${file}`).join(" , ")}`;
    console.log(`>>>>>>>>> ${workflow}: ${prompt}`);
    try {
      if (agent === "gemini")
        execSync(`gemini --yolo --prompt "${prompt}"`, { stdio: "inherit" });
      if (agent === "opencode")
        execSync(`opencode run "${prompt} "`, { stdio: "inherit" });
      if (agent === "kilo")
        execSync(
          `kilo run "${prompt} " --model kilo/openrouter/hunter-alpha`,
          { stdio: "inherit" },
        );
      execSync("bun sanitize.ts");
      execSync("bun stage_parity_translated.ts");
      execSync("git add consistency_progress.txt");
      execSync("git add editor_progress.txt");
      execSync("git add novel_data.json");
      // execSync("git commit --amend --no-edit");
    } catch {}
  }
}

console.clear()
runWorkflow(
  "agents/01_translator_agent.md",
  "bun extract-non-thai.ts",
  "gemini",
);
runWorkflow(
  "agents/02_consistency_agent.md",
  "bun extract-thai.ts --progress consistency",
  "kilo",
);
runWorkflow(
  "agents/03_editor_agent.md",
  "bun extract-thai.ts --progress editor",
  "kilo",
);
execSync("bun html_to_json.ts");
execSync("git add json");
execSync("bun copy_to_destination.ts");
