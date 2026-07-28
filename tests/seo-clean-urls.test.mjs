import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const legalPages = [
  "contacto.html",
  "termos.html",
  "privacidade.html",
  "reembolsos.html",
  "en/contact.html",
  "en/terms.html",
  "en/privacy.html",
  "en/refunds.html",
  "es/contacto.html",
  "es/terminos.html",
  "es/privacidad.html",
  "es/reembolsos.html",
];
const cleanLegalUrlPattern = /\/(?:contacto|contact|termos|terms|terminos|privacidade|privacy|privacidad|reembolsos|refunds)\.html\b/;

function readRepoFile(relativePath) {
  return readFile(path.join(repoRoot, relativePath), "utf8");
}

async function listHtmlFiles(relativeDir = "") {
  const entries = await readdir(path.join(repoRoot, relativeDir), { withFileTypes: true });
  const htmlFiles = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      if (![".git", ".vercel", "node_modules"].includes(entry.name)) {
        htmlFiles.push(...await listHtmlFiles(relativePath));
      }
    } else if (entry.name.endsWith(".html")) {
      htmlFiles.push(relativePath.replaceAll("\\", "/"));
    }
  }

  return htmlFiles;
}

test("sitemap submits only final URLs when Vercel clean URLs are enabled", async () => {
  const [vercelConfig, sitemap] = await Promise.all([
    readRepoFile("vercel.json").then(JSON.parse),
    readRepoFile("sitemap.xml"),
  ]);

  assert.equal(vercelConfig.cleanUrls, true);
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.ok(locations.length > 0);
  assert.deepEqual(
    locations.filter((location) => new URL(location).pathname.endsWith(".html")),
    [],
  );
});

test("internal API routes are excluded from search indexing", async () => {
  const [robots, vercelConfig] = await Promise.all([
    readRepoFile("robots.txt"),
    readRepoFile("vercel.json").then(JSON.parse),
  ]);

  assert.match(robots, /^Disallow: \/api\/$/m);

  const apiHeaders = vercelConfig.headers.find((rule) => rule.source === "/api/(.*)")?.headers;
  assert.ok(apiHeaders, "Vercel must define headers for API routes");
  assert.equal(
    apiHeaders.find((header) => header.key === "X-Robots-Tag")?.value,
    "noindex, nofollow",
  );
});

test("legal pages expose final canonical and hreflang URLs", async () => {
  for (const relativePath of legalPages) {
    const html = await readRepoFile(relativePath);
    const discoveryUrls = [...html.matchAll(/<link\s+rel="(?:canonical|alternate)"[^>]+href="([^"]+)"/g)]
      .map((match) => match[1]);

    assert.ok(discoveryUrls.length > 0, `${relativePath} must declare discovery URLs`);
    assert.deepEqual(
      discoveryUrls.filter((url) => new URL(url).pathname.endsWith(".html")),
      [],
      `${relativePath} must not declare redirected .html URLs`,
    );
  }
});

test("public navigation does not link to redirected legal HTML URLs", async () => {
  const checkedFiles = [
    ...legalPages,
    "index.html",
    "pricing/index.html",
    "script.js",
    "sitemap.xml",
    "llms.txt",
  ];

  for (const relativePath of checkedFiles) {
    assert.doesNotMatch(await readRepoFile(relativePath), cleanLegalUrlPattern, relativePath);
  }
});

test("pricing self-links select a plan without crawlable campaign parameters", async () => {
  const html = await readRepoFile("pricing/index.html");
  const selfLinkTags = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)]
    .filter(([, href]) => {
      const url = new URL(href, "https://batchcutout.com");
      return url.pathname.replace(/\/+$/, "") === "/pricing"
        && url.searchParams.has("checkout_plan");
    });

  assert.equal(selfLinkTags.length, 4);
  for (const [tag, href] of selfLinkTags) {
    const url = new URL(href, "https://batchcutout.com");
    assert.equal(url.searchParams.get("utm_source"), null, href);
    assert.equal(url.searchParams.get("utm_medium"), null, href);
    assert.equal(url.searchParams.get("utm_campaign"), null, href);
    assert.match(tag, /\bdata-pricing-cta-source="pricing"/);
    assert.match(tag, /\bdata-pricing-cta-medium="[^"]+"/);
    assert.match(tag, /\bdata-pricing-cta-campaign="[^"]+"/);
  }

  assert.match(html, /if \(isPricingSelfLink\(url\)\) return;/);
  assert.match(html, /persistPricingPageAttribution\(\);\s+preservePricingCampaignParams\(\);/);
  assert.match(html, /cta_campaign: cta\.dataset\.pricingCtaCampaign \|\| ""/);
});

test("product photo locale pages use the English page as the global default", async () => {
  const localePages = [
    "product-photo-background-remover/index.html",
    "en/product-photo-background-remover/index.html",
    "es/quitar-fondo-fotos-producto-lote/index.html",
  ];
  const expectedAlternates = {
    "pt-PT": "https://batchcutout.com/product-photo-background-remover/",
    en: "https://batchcutout.com/en/product-photo-background-remover/",
    es: "https://batchcutout.com/es/quitar-fondo-fotos-producto-lote/",
    "x-default": "https://batchcutout.com/en/product-photo-background-remover/",
  };

  for (const relativePath of localePages) {
    const html = await readRepoFile(relativePath);
    const alternates = Object.fromEntries(
      [...html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g)]
        .map((match) => [match[1], match[2]]),
    );

    assert.deepEqual(alternates, expectedAlternates, relativePath);
  }
});

test("bulk remover locale pages use the English page as the global default", async () => {
  const localePages = [
    "bulk-background-remover/index.html",
    "en/bulk-background-remover/index.html",
  ];
  const expectedAlternates = {
    "pt-PT": "https://batchcutout.com/bulk-background-remover/",
    en: "https://batchcutout.com/en/bulk-background-remover/",
    "x-default": "https://batchcutout.com/en/bulk-background-remover/",
  };

  for (const relativePath of localePages) {
    const html = await readRepoFile(relativePath);
    const alternates = Object.fromEntries(
      [...html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g)]
        .map((match) => [match[1], match[2]]),
    );

    assert.deepEqual(alternates, expectedAlternates, relativePath);
  }
});

test("transparent PNG locale pages use the English page as the global default", async () => {
  const localePages = [
    "transparent-png-batch/index.html",
    "en/transparent-png-batch-converter/index.html",
  ];
  const expectedAlternates = {
    "pt-PT": "https://batchcutout.com/transparent-png-batch/",
    en: "https://batchcutout.com/en/transparent-png-batch-converter/",
    "x-default": "https://batchcutout.com/en/transparent-png-batch-converter/",
  };

  for (const relativePath of localePages) {
    const html = await readRepoFile(relativePath);
    const alternates = Object.fromEntries(
      [...html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g)]
        .map((match) => [match[1], match[2]]),
    );

    assert.deepEqual(alternates, expectedAlternates, relativePath);
  }
});

test("translated pages use English as the global fallback", async () => {
  const htmlFiles = await listHtmlFiles();
  let localizedPages = 0;

  for (const relativePath of htmlFiles) {
    const html = await readRepoFile(relativePath);
    const englishAlternate = html.match(
      /<link\s+rel="alternate"\s+hreflang="en"\s+href="([^"]+)"/,
    );
    if (!englishAlternate) continue;

    localizedPages++;
    const defaultAlternate = html.match(
      /<link\s+rel="alternate"\s+hreflang="x-default"\s+href="([^"]+)"/,
    );
    assert.ok(defaultAlternate, `${relativePath} must declare x-default`);

    if (relativePath === "pricing/index.html") {
      assert.equal(defaultAlternate[1], "https://batchcutout.com/pricing/", relativePath);
    } else {
      assert.equal(defaultAlternate[1], englishAlternate[1], relativePath);
    }
  }

  assert.ok(localizedPages >= 56, "expected the complete localized page set");
});
