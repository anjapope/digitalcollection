import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const read = relativePath => fs.readFile(path.join(ROOT, relativePath), "utf8");
export async function loadConfig() { return JSON.parse(await read("config/inquiry-config.json")); }
export async function loadSystemPrompt() {
  const files = ["prompts/identity.md","prompts/behavioral-constitution.md","prompts/historical-method.md","prompts/questioning-strategy.md","prompts/tone.md","prompts/grounding.md"];
  return (await Promise.all(files.map(read))).join("\n\n---\n\n");
}
export async function loadKnowledgeFile(fileName) { return read(path.join("knowledge", fileName)); }
