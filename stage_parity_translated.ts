import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";

/**
 * Check modified files in books folder and reset those with unequal line changes
 * (additions != deletions = no parity)
 */
function resetInvalidTranslatedFiles() {
  try {
    // Get diff stats for all modified files in books folder
    // Format: <additions>\t<deletions>\t<filename>
    const diffOutput = execSync("git diff --numstat -- books/", {
      encoding: "utf-8",
    });

    if (!diffOutput.trim()) {
      console.log("No modified files in books folder");
      return;
    }

    const lines = diffOutput.trim().split("\n");
    let resetCount = 0;
    let skippedCount = 0;

    for (const line of lines) {
      const [additions, deletions, filename] = line.split("\t");

      if (!filename || !additions || !deletions) continue;

      const addNum = parseInt(additions, 10);
      const delNum = parseInt(deletions, 10);

      // Check if parity exists (additions == deletions)
      if (addNum !== delNum) {
        console.log(`\n${filename}:`);
        console.log(`  Additions: ${additions}, Deletions: ${deletions}`);
        console.log(`  ❌ No parity - resetting file`);
        try {
          execSync(`git checkout -- "${filename}"`, { encoding: "utf-8" });
          resetCount++;
        } catch (error) {
          console.error(`  Failed to reset ${filename}:`, error);
        }
        if (
          existsSync("consistency_progress.txt") &&
          execSync("git diff consistency_progress.txt", {
            encoding: "utf-8",
          }).trim()
        ) {
          const content = readFileSync("consistency_progress.txt", "utf-8");
          writeFileSync(
            "consistency_progress.txt",
            content.replaceAll(filename.replaceAll("/", "\\"), ""),
          );
        }
        if (
          existsSync("editor_progress.txt") &&
          execSync("git diff editor_progress.txt", { encoding: "utf-8" }).trim()
        ) {
          const content = readFileSync("editor_progress.txt", "utf-8");
          writeFileSync(
            "editor_progress.txt",
            content.replaceAll(filename.replaceAll("/", "\\"), ""),
          );
        }
      } else {
        console.log(`  ✓ Parity maintained - stage changes`);
        execSync(`git add "${filename}"`, { encoding: "utf-8" });
        skippedCount++;
      }
    }
    if (existsSync("consistency_progress.txt")) {
      const content = readFileSync("consistency_progress.txt", "utf-8");
      writeFileSync(
        "consistency_progress.txt",
        Array.from(
          new Set(
            content
              .replaceAll(".htmlbooks", ".html\nbooks")
              .replaceAll("\\", "/")
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          ),
        )
          .toSorted(
            (a, b) =>
              Number(a.replaceAll(/[^0-9]/g, "")) -
              Number(b.replaceAll(/[^0-9]/g, "")),
          )
          .join("\n"),
      );
    }
    if (existsSync("editor_progress.txt")) {
      const content = readFileSync("editor_progress.txt", "utf-8");
      writeFileSync(
        "editor_progress.txt",
        Array.from(
          new Set(
            content
              .replaceAll(".htmlbooks", ".html\nbooks")
              .replaceAll("\\", "/")
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          ),
        )
          .toSorted(
            (a, b) =>
              Number(a.replaceAll(/[^0-9]/g, "")) -
              Number(b.replaceAll(/[^0-9]/g, "")),
          )
          .join("\n"),
      );
    }
    console.log("\n" + "=".repeat(50));
    console.log(`Summary:`);
    console.log(`  Files reset: ${resetCount}`);
    console.log(`  Files kept: ${skippedCount}`);
    console.log("=".repeat(50));
  } catch (error: any) {
    if (
      error.status === 128 ||
      error.message.includes("not a git repository")
    ) {
      console.error("Error: Not a git repository");
    } else if (error.stdout && error.stdout.toString().trim() === "") {
      console.log("No modified files in books folder");
    } else {
      console.error("Error executing git command:", error.message);
    }
  }
}

// Run the function
resetInvalidTranslatedFiles();
