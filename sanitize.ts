import { execSync } from "child_process";
import { sanitize } from "./utils";

const file = process.argv[2];

if (!file) {
  console.log("No file provided. Sanitizing all non-staged changes in books folder...");
  try {
    const changedFiles = execSync("git diff --name-only", { encoding: "utf-8" })
      .split("\n")
      .filter((f) => f.startsWith("books/") && f.endsWith(".html"));
    
    if (changedFiles.length === 0) {
      console.log("No non-staged changes found in books folder.");
      process.exit(0);
    }
    
    console.log(`Found ${changedFiles.length} file(s) to sanitize:`);
    changedFiles.forEach((f) => console.log(`  - ${f}`));
    
    changedFiles.forEach(sanitize);
    console.log(`\nSanitized ${changedFiles.length} file(s) successfully.`);
  } catch (error) {
    console.error("Error getting git diff:", error);
    process.exit(1);
  }
} else {
  sanitize(file);
}
