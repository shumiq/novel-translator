import { execSync } from "child_process";

function runWorkflow(
  skillName: string,
  queueCmd: string,
  agent: "gemini" | "opencode" | "kilo" = "gemini",
) {
  console.log(`>>>>>>>>> Running ${skillName}`);
  console.log(`>>>>>>>>> ${new Date().toLocaleString()}`);
  
  const queue = execSync(queueCmd)
    .toString()
    .replaceAll("\\", "/")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
    
  if (queue.length > 0) {
    // 💡 NEW: Tell the agent to use the skill by name, rather than reading a file path
    const prompt = `Use the '${skillName}' skill to process these files: ${queue.join(", ")}`;
    
    console.log(`>>>>>>>>> ${skillName}: ${prompt}`);
    try {
      if (agent === "gemini")
        execSync(`gemini --yolo --prompt "${prompt}"`, { stdio: "inherit" });
      if (agent === "opencode")
        execSync(`opencode run "${prompt}"`, { stdio: "inherit" });
      if (agent === "kilo")
        execSync(`kilo run "${prompt}" --model kilo/openrouter/hunter-alpha`, {
          stdio: "inherit",
        });
        
      execSync("bun sanitize.ts");
      execSync("bun stage_parity_translated.ts");
      execSync("git add consistency_progress.txt");
      execSync("git add editor_progress.txt");
      execSync("git add novel_data.json");
      // execSync("git commit --amend --no-edit");
    } catch (e) {
      console.error(`>>>>>>>>> Error executing ${skillName} workflow:`, e);
    }
  } else {
    console.log(`>>>>>>>>> Queue is empty. Skipping ${skillName}.`);
  }
}

console.clear();

// 💡 NEW: Use the actual Skill Names (must match the `name:` in your SKILL.md YAML frontmatter)
runWorkflow(
  "translator",
  "bun extract-non-thai.ts",
  "gemini",
);

runWorkflow(
  "consistency",
  "bun extract-thai.ts --progress consistency",
  "opencode",
);

runWorkflow(
  "editor",
  "bun extract-thai.ts --progress editor",
  "opencode",
);

execSync("bun html_to_json.ts");
execSync("git add json");
execSync("bun copy_to_destination.ts");