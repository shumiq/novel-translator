import { execSync } from "child_process";

/**
 * Check modified and staged files in books folder and output one file with no parity
 * Shows original and translated content for comparison with line numbers
 * Handles both staged (git add) and unstaged changes
 */

interface DiffLine {
  oldLine: number | null;
  newLine: number | null;
  content: string;
  type: "context" | "added" | "removed";
}

interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

function parseDiff(diffContent: string): DiffHunk[] {
  const hunks: DiffHunk[] = [];
  const lines = diffContent.split("\n");
  let currentHunk: DiffHunk | null = null;

  for (const line of lines) {
    // Check for hunk header (e.g., "@@ -1,5 +1,6 @@")
    const hunkMatch = line.match(
      /^@@\s+-(\d+)(?:,\d+)?\s+\+(\d+)(?:,\d+)?\s+@@/,
    );
    if (hunkMatch) {
      if (currentHunk) {
        hunks.push(currentHunk);
      }
      currentHunk = {
        oldStart: parseInt(hunkMatch[1]!, 10),
        oldLines: 0,
        newStart: parseInt(hunkMatch[2]!, 10),
        newLines: 0,
        lines: [],
      };
      continue;
    }

    if (currentHunk) {
      const diffLine: DiffLine = {
        oldLine: null,
        newLine: null,
        content: "",
        type: "context",
      };

      if (line.startsWith("+") && !line.startsWith("+++")) {
        diffLine.type = "added";
        diffLine.content = line.slice(1);
        diffLine.newLine = currentHunk.newStart + currentHunk.newLines;
        currentHunk.newLines++;
      } else if (line.startsWith("-") && !line.startsWith("---")) {
        diffLine.type = "removed";
        diffLine.content = line.slice(1);
        diffLine.oldLine = currentHunk.oldStart + currentHunk.oldLines;
        currentHunk.oldLines++;
      } else if (line.startsWith(" ") || line === "") {
        diffLine.type = "context";
        diffLine.content = line.slice(1);
        if (line.startsWith(" ")) {
          diffLine.oldLine = currentHunk.oldStart + currentHunk.oldLines;
          diffLine.newLine = currentHunk.newStart + currentHunk.newLines;
          currentHunk.oldLines++;
          currentHunk.newLines++;
        }
      }

      if (diffLine.type !== "context" || diffLine.content !== "") {
        currentHunk.lines.push(diffLine);
      }
    }
  }

  if (currentHunk) {
    hunks.push(currentHunk);
  }

  return hunks;
}

function formatDiffComparison(hunks: DiffHunk[]): string {
  let output = "";

  for (const hunk of hunks) {
    output += `\n--- Hunk (Original lines ${hunk.oldStart}-${hunk.oldStart + hunk.oldLines - 1}, Translated lines ${hunk.newStart}-${hunk.newStart + hunk.newLines - 1}) ---\n\n`;

    // Find max width for line numbers
    const maxOldLine = Math.max(
      ...hunk.lines.map((l) => l.oldLine || 0),
      hunk.oldStart + hunk.oldLines,
    );
    const maxNewLine = Math.max(
      ...hunk.lines.map((l) => l.newLine || 0),
      hunk.newStart + hunk.newLines,
    );
    const oldNumWidth = Math.max(maxOldLine.toString().length, 3);
    const newNumWidth = Math.max(maxNewLine.toString().length, 3);

    // Headers
    output +=
      " ".repeat(oldNumWidth) +
      " | " +
      " ".repeat(newNumWidth) +
      " | Original            | Translated\n";
    output +=
      "-".repeat(oldNumWidth) +
      "-+-" +
      "-".repeat(newNumWidth) +
      "-++" +
      "-".repeat(21) +
      "+" +
      "-".repeat(21) +
      "\n";

    // Group lines by their line numbers to show original and translated together
    const lineMap = new Map<number, { original: string; translated: string }>();

    for (const line of hunk.lines) {
      if (line.oldLine !== null) {
        const existing = lineMap.get(line.oldLine) || {
          original: "",
          translated: "",
        };
        existing.original = line.content;
        lineMap.set(line.oldLine, existing);
      }
      if (line.newLine !== null) {
        const existing = lineMap.get(line.newLine) || {
          original: "",
          translated: "",
        };
        existing.translated = line.content;
        lineMap.set(line.newLine, existing);
      }
    }

    // Get all line numbers and sort them
    const allLines = new Set<number>();
    for (const line of hunk.lines) {
      if (line.oldLine !== null) allLines.add(line.oldLine);
      if (line.newLine !== null) allLines.add(line.newLine);
    }
    const sortedLines = Array.from(allLines).sort((a, b) => a - b);

    for (const lineNum of sortedLines) {
      const data = lineMap.get(lineNum) || { original: "", translated: "" };
      const displayLineNum =
        lineNum >= hunk.oldStart && lineNum < hunk.oldStart + hunk.oldLines
          ? lineNum
          : null;
      const displayNewNum =
        lineNum >= hunk.newStart && lineNum < hunk.newStart + hunk.newLines
          ? lineNum
          : null;

      const oldNum =
        displayLineNum !== null
          ? displayLineNum.toString().padStart(oldNumWidth, " ")
          : " ".repeat(oldNumWidth);
      const newNum =
        displayNewNum !== null
          ? displayNewNum.toString().padStart(newNumWidth, " ")
          : " ".repeat(newNumWidth);

      output += `${oldNum} | ${newNum} | ${data.original} | ${data.translated}\n`;
    }
    output += "\n";
  }

  return output;
}

function isSpeech(line: string) {
  return (
    line.startsWith('<p>"') ||
    line.startsWith("<p>「") ||
    line.startsWith("<p>『") ||
    line.startsWith("<p>“")
  );
}

function getInparityTranslatedFile() {
  try {
    // Get diff stats for all modified and staged files in books folder
    // Using HEAD to get all changes (staged + unstaged)
    // Format: <additions>\t<deletions>\t<filename>
    const diffOutput = execSync("git diff --numstat HEAD -- books/", {
      encoding: "utf-8",
    });

    if (!diffOutput.trim()) {
      console.log("No modified or staged files in books folder");
      return;
    }

    const lines = diffOutput.trim().split("\n");

    for (const line of lines) {
      const [additions, deletions, filename] = line.split("\t");

      if (!filename || !additions || !deletions) continue;

      const addNum = parseInt(additions, 10);
      const delNum = parseInt(deletions, 10);

      // Check if parity exists (additions == deletions)
      if (addNum !== delNum) {
        console.log("\n" + "=".repeat(60));
        console.log(`FILE: ${filename}`);
        console.log(
          `Parity Mismatch: ${additions} additions, ${deletions} deletions`,
        );
        console.log("=".repeat(60));

        // Get the actual diff content to show original and translated
        try {
          const diffContent = execSync(`git diff HEAD "${filename}"`, {
            encoding: "utf-8",
          });
          const hunks = parseDiff(diffContent);

          if (hunks.length > 0) {
            const formattedOutput = formatDiffComparison(hunks);
            // console.log(formattedOutput);

            const lines = [] as { original: string; translated: string }[];
            for (const line of hunks[0]?.lines ?? []) {
              if (line.oldLine) {
                lines[line.oldLine] ??= {
                  original: "",
                  translated: "",
                };
                lines[line.oldLine] = {
                  ...lines[line.oldLine]!,
                  original: line.content,
                };
              }
              if (line.newLine) {
                lines[line.newLine] ??= {
                  original: "",
                  translated: "",
                };
                lines[line.newLine] = {
                  ...lines[line.newLine]!,
                  translated: line.content,
                };
              }
            }
            for (const lineNumber in lines) {
              if (!lines[lineNumber]) continue;
              const mismatchSpeech =
                isSpeech(lines[Number(lineNumber)]?.original ?? "") !==
                isSpeech(lines[Number(lineNumber)]?.translated ?? "");
              console.log(
                `Line: ${lineNumber}${mismatchSpeech || !lines[Number(lineNumber)]?.original || !lines[Number(lineNumber)]?.translated ? " <== DRIFT!" : ""}`,
              );
              console.log(`    original   => ${lines[lineNumber].original}`);
              console.log(`    translated => ${lines[lineNumber].translated}`);
            }
          } else {
            console.log("(No diff content available)");
          }
        } catch (error) {
          console.error(`Failed to get diff for ${filename}:`, error);
        }

        // Exit after finding first file with no parity
        process.exit(0);
      }
    }

    console.log("All modified and staged files have parity");
  } catch (error: any) {
    if (
      error.status === 128 ||
      error.message.includes("not a git repository")
    ) {
      console.error("Error: Not a git repository");
    } else if (error.stdout && error.stdout.toString().trim() === "") {
      console.log("No modified or staged files in books folder");
    } else {
      console.error("Error executing git command:", error.message);
    }
  }
}

// Run the function
getInparityTranslatedFile();
