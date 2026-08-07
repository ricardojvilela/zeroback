import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const optimizedAsset = path.join(root, "assets", "product-before-after-v5.webp");

async function publicHtmlFiles(directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "emails") continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await publicHtmlFiles(fullPath));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(fullPath);
  }

  return files;
}

test("serves the shared commercial example as a lightweight WebP", async () => {
  const asset = await stat(optimizedAsset);
  const htmlFiles = await publicHtmlFiles();
  const pages = await Promise.all(htmlFiles.map(async (file) => ({
    file,
    source: await readFile(file, "utf8"),
  })));
  const optimizedReferences = pages.filter(({ source }) => source.includes("product-before-after-v5.webp"));
  const legacyReferences = pages.filter(({ source }) => source.includes("product-before-after-v5.png"));

  assert.ok(asset.size <= 200_000, `optimized example is ${asset.size} bytes`);
  assert.ok(optimizedReferences.length >= 40, "the optimized example should be shared across commercial pages");
  assert.deepEqual(legacyReferences.map(({ file }) => path.relative(root, file)), []);
});
