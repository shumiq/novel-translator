import { execSync } from "child_process";

function runWorkflow(workflow: string, queueCmd: string) {
  console.log(`>>>>>>>>> Running ${workflow}`);
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
      // execSync(`gemini --yolo --prompt "${prompt}"`, { stdio: "inherit" });
      execSync(`opencode run "${prompt} "`, { stdio: "inherit" });
      // execSync(`kilo run "${prompt} " --model kilo/minimax/minimax-m2.5:free`, { stdio: "inherit" });
    } catch {}
    execSync("bun sanitize.ts");
    execSync("bun stage_parity_translated.ts");
    execSync("git add consistency_progress.txt");
    execSync("git add editor_progress.txt");
    execSync("git add novel_data.json");
    // execSync("git commit --amend --no-edit");
  }
}

runWorkflow("agents/01_translator_agent.md", "bun extract-non-thai.ts");
runWorkflow(
  "agents/02_consistency_agent.md",
  "bun extract-thai.ts --progress consistency",
);
runWorkflow(
  "agents/03_editor_agent.md",
  "bun extract-thai.ts --progress editor",
);
