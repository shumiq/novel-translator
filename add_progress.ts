import fs from "fs";

const progressName = process.argv[2];
const appendedFile = process.argv[3];

if (!progressName) {
  console.error(
    "Error: Progress name is required. Usage: add_progress.ts <progress_name> <appended_file>",
  );
  process.exit(1);
}

const progressFile = `${progressName}_progress.txt`;

if (!appendedFile) {
  console.error(
    "Error: Appended file name is required. Usage: add_progress.ts <progress_file> <appended_file>",
  );
  process.exit(1);
}

if (!fs.existsSync(appendedFile)) {
  console.error(`Error: Appended file does not exist: ${appendedFile}`);
  process.exit(1);
}

if (!fs.existsSync(progressFile)) {
  fs.writeFileSync(progressFile, "");
}

fs.appendFileSync(progressFile, "\n" + appendedFile);
process.exit(0);
