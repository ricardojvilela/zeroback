import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const landingTrackSource = await readFile(path.join(repoRoot, "landing-track.js"), "utf8");
const statsSource = await readFile(path.join(repoRoot, "api", "stats.js"), "utf8");
const adminSource = await readFile(path.join(repoRoot, "admin.html"), "utf8");

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

function runLandingTracking(pageUrl, linkHref, options = {}) {
  const location = new URL(pageUrl);
  let redirectedTo = "";
  location.replace = (value) => {
    redirectedTo = String(value);
  };
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
    body: {
      dataset: options.paidDirectTool
        ? { paidDirectTool: options.paidDirectTool }
        : {},
    },
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
  return {
    href: attributes.get("href"),
    dataset: link.dataset,
    redirectedTo,
  };
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

test("paid English bulk landing sends search traffic directly to the upload tool", () => {
  const result = runLandingTracking(
    "https://batchcutout.com/en/bulk-background-remover/?utm_source=google_ads&utm_medium=cpc&utm_campaign=bulk_background_remover&utm_content=search&gclid=test-click",
    "/?lang=en&utm_source=seo&utm_medium=en_landing&utm_campaign=bulk_background_remover#tool",
    { paidDirectTool: "/?lang=en#tool" },
  );

  const target = new URL(result.redirectedTo);
  assert.equal(target.origin, "https://batchcutout.com");
  assert.equal(target.pathname, "/");
  assert.equal(target.searchParams.get("lang"), "en");
  assert.equal(target.searchParams.get("utm_source"), "google_ads");
  assert.equal(target.searchParams.get("utm_medium"), "cpc");
  assert.equal(target.searchParams.get("utm_campaign"), "bulk_background_remover");
  assert.equal(target.searchParams.get("utm_content"), "search");
  assert.equal(target.searchParams.get("gclid"), "test-click");
  assert.equal(target.hash, "#tool");
});

test("organic visitors remain on the English bulk landing", () => {
  const result = runLandingTracking(
    "https://batchcutout.com/en/bulk-background-remover/",
    "/?lang=en&utm_source=seo&utm_medium=en_landing&utm_campaign=bulk_background_remover#tool",
    { paidDirectTool: "/?lang=en#tool" },
  );

  assert.equal(result.redirectedTo, "");
});

test("reports direct paid landing handoffs in the admin dashboard", () => {
  assert.match(statsSource, /case "paid_landing_tool_redirect":/);
  assert.match(statsSource, /paidLandingToolRedirects \+= 1/);
  assert.match(adminSource, /id="livePaidLandingToolRedirects"/);
  assert.match(adminSource, /totals\.paidLandingToolRedirects/);
});
