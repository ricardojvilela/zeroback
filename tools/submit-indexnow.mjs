import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultKey = "2dd248b794e4c8e984f300dffebcaae1";
const key = String(process.env.INDEXNOW_KEY || defaultKey).trim();
const endpoint = String(process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow").trim();
const host = "batchcutout.com";
const keyLocation = `https://${host}/${key}.txt`;
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const submitAll = args.includes("--all");
const requestedUrls = args.filter((argument) => !argument.startsWith("--"));

function sitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
}

function normalizeUrl(value) {
  const url = new URL(value, `https://${host}`);
  if (url.protocol !== "https:" || url.hostname !== host) {
    throw new Error(`IndexNow only accepts BatchCutout HTTPS URLs: ${value}`);
  }
  url.hash = "";
  return url.toString();
}

const sitemap = await readFile(path.join(repoRoot, "sitemap.xml"), "utf8");
const knownUrls = new Set(sitemapUrls(sitemap).map(normalizeUrl));
const urlList = submitAll
  ? [...knownUrls]
  : [...new Set(requestedUrls.map(normalizeUrl))];

if (!urlList.length) {
  throw new Error("Pass one or more BatchCutout URLs, or use --all.");
}

for (const url of urlList) {
  if (!knownUrls.has(url)) {
    throw new Error(`URL is not present in sitemap.xml: ${url}`);
  }
}

const payload = { host, key, keyLocation, urlList };

if (dryRun) {
  console.log(JSON.stringify({ ok: true, dryRun: true, endpoint, ...payload }, null, 2));
  process.exit(0);
}

const response = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

const responseText = await response.text();
if (!response.ok) {
  throw new Error(`IndexNow submission failed (${response.status}): ${responseText.slice(0, 500)}`);
}

console.log(JSON.stringify({
  ok: true,
  status: response.status,
  submitted: urlList.length,
  urls: urlList,
  response: responseText || null,
}, null, 2));
