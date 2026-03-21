import { Glob } from "bun";
import { sanitize } from "./utils";

const glob = new Glob("books/**/*html");
const files = Array.from(glob.scanSync(".")) as string[];

files.toSorted().forEach((file) => {
  sanitize(file);
});
