import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
