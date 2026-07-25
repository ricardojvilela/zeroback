import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("answers the strongest near-page-one product photo query", async () => {
  const [page, sitemap] = await Promise.all([
    readFile(path.join(root, "en", "product-photo-background-remover", "index.html"), "utf8"),
    readFile(path.join(root, "sitemap.xml"), "utf8"),
  ]);

  assert.match(page, /<title>Product Photo Background Remover \| BatchCutout<\/title>/);
  assert.match(page, /<h1>Remove backgrounds from product photos in batches<\/h1>/);
  assert.match(page, /<h2 id="product-image-background-steps">How do I remove the background from a product image\?<\/h2>/);
  assert.match(page, /Test 2 images free/);
  assert.match(page, /utm_campaign=product_photo_background_remover#tool/);
  assert.match(
    sitemap,
    /<loc>https:\/\/batchcutout\.com\/en\/product-photo-background-remover\/<\/loc>\s*<lastmod>2026-07-25<\/lastmod>/,
  );
});
