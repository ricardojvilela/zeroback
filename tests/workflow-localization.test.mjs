import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("localizes the workflow cards and routes English traffic to English pages", async () => {
  const [html, script] = await Promise.all([
    readFile(path.join(root, "index.html"), "utf8"),
    readFile(path.join(root, "script.js"), "utf8"),
  ]);

  const workflowKeys = [...html.matchAll(/data-workflow-key="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(workflowKeys.length, 14);
  assert.equal(new Set(workflowKeys).size, workflowKeys.length);

  assert.match(script, /const workflowContentByLanguage = \{/);
  assert.match(script, /title: "Ecommerce workflows"/);
  assert.match(script, /href: "\/en\/remove-background-for-shopify\/"/);
  assert.match(script, /href: "\/en\/etsy-product-photo-background-remover\/"/);
  assert.match(script, /href: "\/en\/woocommerce-product-background-remover\/"/);
  assert.match(script, /href: "\/en\/remove-bg-alternative-for-bulk-product-photos\/"/);
  assert.match(script, /const content = workflowContentByLanguage\[currentLanguage\]/);
  assert.match(script, /workflowLinksSection\.hidden = !content/);
  assert.match(script, /applyWorkflowLanguage\(\);/);
});

test("uses Spanish cards only where a Spanish destination exists", async () => {
  const script = await readFile(path.join(root, "script.js"), "utf8");
  const spanishStart = script.indexOf('  es: {\n    title: "Flujos para ecommerce"');
  const spanishEnd = script.indexOf("\n  },\n};", spanishStart);
  const spanishContent = script.slice(spanishStart, spanishEnd);

  assert.ok(spanishStart >= 0 && spanishEnd > spanishStart);
  assert.match(spanishContent, /href: "\/es\/quitar-fondo-fotos-shopify\/"/);
  assert.match(spanishContent, /href: "\/es\/alternativa-photoroom-ecommerce\/"/);
  assert.doesNotMatch(spanishContent, /\/en\//);
  assert.doesNotMatch(spanishContent, /\/partners\//);
});
