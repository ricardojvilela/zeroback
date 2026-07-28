import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [index, script, stats, admin] = await Promise.all([
  readFile(path.join(root, "index.html"), "utf8"),
  readFile(path.join(root, "script.js"), "utf8"),
  readFile(path.join(root, "api", "stats.js"), "utf8"),
  readFile(path.join(root, "admin.html"), "utf8"),
]);

test("measures the activation steps before a visitor selects files", () => {
  assert.match(script, /"tool_file_picker_opened"/);
  assert.match(script, /trackEvent\("tool_file_picker_opened", \{ source: "dropzone_click" \}\)/);
  assert.match(script, /trackEvent\("tool_file_picker_opened", \{ source: "dropzone_keyboard" \}\)/);
  assert.match(stats, /case "tool_file_picker_opened":/);
  assert.match(stats, /filePickerOpens \+= 1/);
  assert.match(admin, /id="liveToolPageViews"/);
  assert.match(admin, /id="liveFilePickerOpens"/);
});

test("the upload action starts with a touch-friendly instruction in every commercial locale", () => {
  assert.match(index, /data-i18n="selectPhotos">Selecione ou arraste fotos</);
  assert.match(script, /selectPhotos: "Selecione ou arraste fotos"/);
  assert.match(script, /selectPhotos: "Choose or drag photos here"/);
  assert.match(script, /selectPhotos: "Selecciona o arrastra fotos"/);
});
