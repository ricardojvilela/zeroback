import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const landingTrackSource = await readFile(path.join(repoRoot, "landing-track.js"), "utf8");

function storage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  };
}

function runLandingTracking(pageUrl, linkHref) {
  const location = new URL(pageUrl);
  const attributes = new Map([["href", linkHref]]);
  const link = {
    dataset: {},
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    setAttribute(name, value) {
      attributes.set(name, value);
    },
    get href() {
      return new URL(attributes.get("href"), location.origin).toString();
    },
  };
  const document = {
    title: "BatchCutout landing",
    referrer: "",
    documentElement: { lang: "pt-PT" },
    querySelectorAll() {
      return [link];
    },
    addEventListener() {},
  };
  const context = {
    Blob,
    URL,
    URLSearchParams,
    crypto: { randomUUID: () => "visitor-id" },
    document,
    fetch: async () => ({ ok: true }),
    localStorage: storage(),
    navigator: { sendBeacon: () => true },
    sessionStorage: storage(),
    window: { location },
  };

  vm.runInNewContext(landingTrackSource, context);
  return { href: attributes.get("href"), dataset: link.dataset };
}

test("paid landing links keep the incoming campaign instead of the page default", () => {
  const result = runLandingTracking(
    "https://batchcutout.com/bulk-background-remover/?utm_source=google&utm_medium=cpc&utm_campaign=pro_launch&utm_content=ad_a&utm_term=batch+background&gclid=test-click",
    "/?utm_source=seo&utm_medium=landing&utm_campaign=bulk_background_remover#tool",
  );

  const target = new URL(result.href, "https://batchcutout.com");
  assert.equal(target.searchParams.get("utm_source"), "google");
  assert.equal(target.searchParams.get("utm_medium"), "cpc");
  assert.equal(target.searchParams.get("utm_campaign"), "pro_launch");
  assert.equal(target.searchParams.get("utm_content"), "ad_a");
  assert.equal(target.searchParams.get("utm_term"), "batch background");
  assert.equal(target.searchParams.get("gclid"), "test-click");
  assert.equal(target.hash, "#tool");
  assert.equal(result.dataset.batchcutoutCtaCampaign, "bulk_background_remover");
});

test("organic landing links retain their own CTA campaign", () => {
  const result = runLandingTracking(
    "https://batchcutout.com/bulk-background-remover/",
    "/pricing/?checkout_plan=pack100&utm_source=seo&utm_medium=landing&utm_campaign=bulk_background_remover_intent_pack100#pricing-account-title",
  );

  const target = new URL(result.href, "https://batchcutout.com");
  assert.equal(target.searchParams.get("utm_source"), "seo");
  assert.equal(target.searchParams.get("utm_campaign"), "bulk_background_remover_intent_pack100");
  assert.equal(target.searchParams.get("checkout_plan"), "pack100");
  assert.equal(result.dataset.batchcutoutCtaCampaign, undefined);
});
