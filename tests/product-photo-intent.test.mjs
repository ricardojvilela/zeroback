import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("targets the highest-impression qualified product photo query", async () => {
  const [page, sitemap, bulkPage, ecommercePage, shopifyPage, transparentPage, wooPage] = await Promise.all([
    readFile(path.join(root, "en", "product-photo-background-remover", "index.html"), "utf8"),
    readFile(path.join(root, "sitemap.xml"), "utf8"),
    readFile(path.join(root, "en", "bulk-background-remover", "index.html"), "utf8"),
    readFile(path.join(root, "en", "background-remover-for-ecommerce", "index.html"), "utf8"),
    readFile(path.join(root, "en", "remove-background-for-shopify", "index.html"), "utf8"),
    readFile(path.join(root, "en", "transparent-png-batch-converter", "index.html"), "utf8"),
    readFile(path.join(root, "en", "woocommerce-product-background-remover", "index.html"), "utf8"),
  ]);

  assert.match(page, /<title>Product Photo Background Remover in Bulk \| BatchCutout<\/title>/);
  assert.match(page, /<h1>Product photo background remover for bulk ecommerce images<\/h1>/);
  assert.match(page, /<h2 id="product-image-background-steps">How do I remove the background from a product image\?<\/h2>/);
  assert.match(page, /"@type": "FAQPage"/);
  assert.match(page, /Can I remove backgrounds from multiple product photos at once\?/);
  assert.match(page, /<h2 id="product-photo-remover-faq">/);
  assert.match(page, /Test 2 images free/);
  assert.match(page, /utm_campaign=product_photo_background_remover#tool/);
  assert.match(
    sitemap,
    /<loc>https:\/\/batchcutout\.com\/en\/product-photo-background-remover\/<\/loc>\s*<lastmod>2026-07-31<\/lastmod>/,
  );

  for (const sourcePage of [bulkPage, ecommercePage, shopifyPage, transparentPage, wooPage]) {
    assert.match(sourcePage, /href="\/en\/product-photo-background-remover\/"/);
  }
});
