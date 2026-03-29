import { cpSync, existsSync, mkdirSync, readdirSync } from "fs";
import { join } from "path";
import { config } from "./config";

const sourceDir = "./json";
const destination = config.path;

if (!destination || !existsSync(sourceDir)) process.exit(1);

console.log(`Copy JSON to ${destination}`);

// Ensure destination directory exists
if (!existsSync(destination)) {
  mkdirSync(destination, { recursive: true });
}

// Get all .json files from source directory
const files = readdirSync(sourceDir).filter((file) => file.endsWith(".json"));

console.log(`Found ${files.length} JSON files to copy`);

// Copy each file to destination
await Promise.all(
  files.map(async (file) => {
    const srcPath = join(sourceDir, file);
    const destPath = join(destination, file);
    cpSync(srcPath, destPath);
    console.log(`Copied: ${file}`);
  }),
);

console.log(`Successfully copied ${files.length} files to ${destination}`);
