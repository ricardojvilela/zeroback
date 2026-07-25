import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function languageOptions(html, selectId) {
  const selectStart = html.indexOf(`id="${selectId}"`);
  const selectEnd = html.indexOf("</select>", selectStart);
  const select = html.slice(selectStart, selectEnd);
  return [...select.matchAll(/<option value="([^"]+)"/g)].map((match) => match[1]);
}

test("offers only the three fully localized commercial languages", async () => {
  const [toolHtml, pricingHtml, script] = await Promise.all([
    readFile(path.join(root, "index.html"), "utf8"),
    readFile(path.join(root, "pricing", "index.html"), "utf8"),
    readFile(path.join(root, "script.js"), "utf8"),
  ]);

  assert.deepEqual(languageOptions(toolHtml, "languageSelect"), ["pt", "en", "es"]);
  assert.deepEqual(languageOptions(pricingHtml, "pricingLanguage"), ["pt", "en", "es"]);
  assert.match(script, /const supportedUiLanguages = new Set\(\["pt", "en", "es"\]\)/);
  assert.match(script, /normalizeUiLanguage\(safeLocalStorageGet\("language"\)\)/);
});

test("normalizes unsupported requested languages to a coherent English interface", async () => {
  const script = await readFile(path.join(root, "script.js"), "utf8");
  const requestedLanguageStart = script.indexOf("function getRequestedLanguage");
  const requestedLanguageEnd = script.indexOf("function setStatus", requestedLanguageStart);
  const languageHelpers = script.slice(requestedLanguageStart, requestedLanguageEnd);

  assert.ok(requestedLanguageStart >= 0 && requestedLanguageEnd > requestedLanguageStart);
  assert.match(languageHelpers, /return pageParams\.has\("lang"\) \? "en" : ""/);
  assert.match(languageHelpers, /normalizedUrl\.searchParams\.set\("lang", "en"\)/);
  assert.match(languageHelpers, /window\.history\.replaceState/);
});
