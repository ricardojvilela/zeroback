import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [script, stats, admin] = await Promise.all([
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
