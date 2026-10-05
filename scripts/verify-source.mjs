import { readFile, writeFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const omitted = new Set(["node_modules", ".git", "dist", "build", ".expo", "__pycache__"]);
async function walk(dir = "") {
  const files = [];
  for (const entry of await readdir(path.join(root, dir), { withFileTypes: true })) {
    if (omitted.has(entry.name) || entry.name.startsWith(".env") ||
        /(?:tsbuildinfo|\.pyc|\.log)$/.test(entry.name) || entry.name === ".tsbuildinfo" ||
        entry.name === "SOURCE_HASHES.json") continue;
    const name = dir ? dir + "/" + entry.name : entry.name;
    if (entry.isDirectory()) files.push(...await walk(name));
    else if (entry.isFile()) files.push(name);
  }
  return files.sort();
}
const actual = {};
for (const name of await walk()) actual[name] = createHash("sha256").update(await readFile(path.join(root, name))).digest("hex");
// Track example variable names, but never real environment files.
for (const name of ["apps/api/.env.example", "apps/mobile/.env.example"])
  actual[name] = createHash("sha256").update(await readFile(path.join(root, name))).digest("hex");
if (process.argv.includes("--update")) {
  await writeFile(path.join(root, "SOURCE_HASHES.json"), JSON.stringify(actual, null, 2) + "\n");
  console.log("Updated source manifest.");
} else {
  const expected = JSON.parse(await readFile(path.join(root, "SOURCE_HASHES.json"), "utf8"));
  const failures = [...new Set([...Object.keys(expected), ...Object.keys(actual)])].filter(name => actual[name] !== expected[name]);
  if (failures.length) throw new Error("Source hash mismatch: " + failures.join(", "));
  console.log("Verified " + Object.keys(actual).length + " source hashes.");
}
for (const name of ["bundle", "chips", "devices", "discovery_queue", "news", "seen"]) {
  const canonical = await readFile(path.join(root, "data/" + name + ".json"));
  const mobile = await readFile(path.join(root, "apps/mobile/data/" + name + ".json"));
  if (!canonical.equals(mobile)) console.log("Offline bootstrap differs from canonical dataset: " + name + " (refresh deliberately for release).");
}
