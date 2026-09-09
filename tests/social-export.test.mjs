import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("offers a persistent white-background export for social media", async () => {
  const [html, script] = await Promise.all([
    readFile(path.join(root, "index.html"), "utf8"),
    readFile(path.join(root, "script.js"), "utf8"),
  ]);

  const exportControls = html.slice(
    html.indexOf('id="exportBackground"'),
    html.indexOf('class="actions"', html.indexOf('id="exportBackground"')),
  );

  assert.match(exportControls, /name="exportBackground" value="transparent" checked/);
  assert.match(exportControls, /name="exportBackground" value="white"/);
  assert.match(exportControls, /data-i18n="exportBackgroundHint"/);
  assert.match(script, /const exportBackgroundStorageKey = "batchcutout_export_background"/);
  assert.match(script, /safeLocalStorageSet\(exportBackgroundStorageKey, exportBackground\)/);
});

test("flattens transparent pixels onto opaque white before social export", async () => {
  const script = await readFile(path.join(root, "script.js"), "utf8");
  const helperStart = script.indexOf("async function preparePngForExport");
  const helperEnd = script.indexOf("function triggerBlobDownload", helperStart);
  const helper = script.slice(helperStart, helperEnd);

  assert.ok(helperStart >= 0 && helperEnd > helperStart);
  assert.match(helper, /if \(!isWhiteBackgroundExport\(background\)\) return blob/);
  assert.match(helper, /context\.fillStyle = "#ffffff"/);
  assert.ok(helper.indexOf("context.fillRect") < helper.indexOf("context.drawImage"));
  assert.match(helper, /canvas\.toBlob[\s\S]*"image\/png"/);
});

test("applies the selected background to individual and ZIP downloads", async () => {
  const script = await readFile(path.join(root, "script.js"), "utf8");
  const zipStart = script.indexOf("async function downloadZip");
  const singleStart = script.indexOf("async function downloadSinglePng", zipStart);
  const clearStart = script.indexOf("function clearAll", singleStart);
  const zipDownload = script.slice(zipStart, singleStart);
  const singleDownload = script.slice(singleStart, clearStart);

  assert.match(zipDownload, /const activeBackground = exportBackground/);
  assert.match(zipDownload, /await preparePngForExport\(item\.outputBlob, activeBackground\)/);
  assert.match(zipDownload, /exportPngName\(item\.file\.name, `imagem-\$\{index \+ 1\}`, activeBackground\)/);
  assert.match(singleDownload, /await preparePngForExport\(item\.outputBlob, activeBackground\)/);
  assert.match(singleDownload, /statusWhitePngReady/);
  assert.match(singleDownload, /background: activeBackground/);
});
