import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readRepoFile = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("customer result pages show the real input, output, and recorded browser workflow", async () => {
  const [portuguese, english, sitemap, inputAsset, outputAsset, videoAsset, posterAsset] = await Promise.all([
    readRepoFile("customer-results/index.html"),
    readRepoFile("en/customer-results/index.html"),
    readRepoFile("sitemap.xml"),
    stat(path.join(root, "assets/demo/headphones-input.png")),
    stat(path.join(root, "assets/demo/headphones-output.png")),
    stat(path.join(root, "assets/video/batchcutout-real-flow-2026-08-07.mp4")),
    stat(path.join(root, "assets/video/batchcutout-real-flow-poster.png")),
  ]);

  for (const page of [portuguese, english]) {
    assert.match(page, /headphones-input\.png/);
    assert.match(page, /headphones-output\.png/);
    assert.match(page, /batchcutout-real-flow-2026-08-07\.mp4/);
    assert.match(page, /"@type": "VideoObject"/);
    assert.match(page, /uploadDate": "2026-08-07"/);
    assert.match(page, /"embedUrl": "https:\/\/www\.youtube\.com\/embed\/u-F4J-idMkY"/);
  }

  assert.match(sitemap, /xmlns:video="http:\/\/www\.google\.com\/schemas\/sitemap-video\/1\.1"/);
  assert.equal((sitemap.match(/<video:video>/g) ?? []).length, 2);
  assert.equal((sitemap.match(/<video:content_loc>https:\/\/batchcutout\.com\/assets\/video\/batchcutout-real-flow-2026-08-07\.mp4<\/video:content_loc>/g) ?? []).length, 2);
  assert.equal((sitemap.match(/<video:player_loc>https:\/\/www\.youtube\.com\/embed\/u-F4J-idMkY<\/video:player_loc>/g) ?? []).length, 2);

  for (const asset of [inputAsset, outputAsset, videoAsset, posterAsset]) {
    assert.ok(asset.size > 100_000, "proof assets must not be empty placeholders");
  }
});

test("partner pilot is available in Portuguese and English without an unsupported commission claim", async () => {
  const [portuguese, english, sitemap, admin, prospects] = await Promise.all([
    readRepoFile("partners/index.html"),
    readRepoFile("en/partners/index.html"),
    readRepoFile("sitemap.xml"),
    readRepoFile("admin.html"),
    readRepoFile("sales-outreach-prospects-2026-06-30.csv"),
  ]);

  assert.match(portuguese, /hreflang="en" href="https:\/\/batchcutout\.com\/en\/partners\/"/);
  assert.match(english, /hreflang="pt-PT" href="https:\/\/batchcutout\.com\/partners\/"/);
  assert.match(english, /No commission is promised during this pilot/);
  assert.match(english, /partner_page_view/);
  assert.match(english, /partner_referral_copy/);
  assert.match(sitemap, /<loc>https:\/\/batchcutout\.com\/en\/partners\/<\/loc>\s*<lastmod>2026-08-07<\/lastmod>/);
  assert.match(admin, /function outreachCampaignSlug/);
  assert.match(admin, /return partnerSlug \? `partner_\$\{partnerSlug\}` : "partner_outreach"/);
  assert.match(admin, /Would you be open to testing 2 representative images/);
  assert.match(prospects, /137,90,Product Photography UK,[^\n]+,sent_2026-08-07,email_partner,watch_replies/);
  assert.match(prospects, /142,92,27n,[^\n]+,sent_2026-08-07,email_partner,watch_replies/);
});

test("IndexNow submission uses the deployed ownership key and sitemap-only URLs", async () => {
  const [keyFile, script, packageJson] = await Promise.all([
    readRepoFile("2dd248b794e4c8e984f300dffebcaae1.txt"),
    readRepoFile("tools/submit-indexnow.mjs"),
    readRepoFile("package.json").then(JSON.parse),
  ]);

  assert.equal(keyFile.trim(), "2dd248b794e4c8e984f300dffebcaae1");
  assert.equal(packageJson.scripts.indexnow, "node tools/submit-indexnow.mjs");
  assert.match(script, /https:\/\/api\.indexnow\.org\/indexnow/);
  assert.match(script, /URL is not present in sitemap\.xml/);
  assert.match(script, /keyLocation/);
});
