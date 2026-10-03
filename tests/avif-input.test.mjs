import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("normalizes AVIF inputs to PNG before background removal", async () => {
  const script = await readFile(path.join(root, "script.js"), "utf8");
  const helperStart = script.indexOf("function isAvifFile");
  const helperEnd = script.indexOf("async function ensureMinimumPngResolution", helperStart);
  const helper = script.slice(helperStart, helperEnd);

  assert.ok(helperStart >= 0 && helperEnd > helperStart);
  assert.match(helper, /image\/avif/);
  assert.match(helper, /createImageBitmap\(file\)/);
  assert.match(helper, /canvasToPngBlob\(canvas\)/);
  assert.match(helper, /type: "image\/png"/);

  const processStart = script.indexOf("async function processImages");
  const processEnd = script.indexOf("function downloadSinglePng", processStart);
  const processHandler = script.slice(processStart, processEnd);
  assert.match(processHandler, /normalizeInputForProcessing\(item\.file\)/);
});
