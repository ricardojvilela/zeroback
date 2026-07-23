import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("sends authenticated paid customers to the working upload area", async () => {
  const script = await readFile(path.join(root, "script.js"), "utf8");
  const helperStart = script.indexOf("function focusPaidWorkspaceAfterAuthentication");
  const helperEnd = script.indexOf("function completeMagicLinkAuthentication", helperStart);
  const helper = script.slice(helperStart, helperEnd);

  assert.ok(helperStart >= 0 && helperEnd > helperStart);
  assert.match(helper, /access\.canUsePro/);
  assert.match(helper, /checkoutPlanWaitingForAuth\(\)/);
  assert.match(helper, /trackEvent\("paid_workspace_ready"/);
  assert.match(helper, /cleanUrl\.searchParams\.delete\("checkout"\)/);
  assert.match(helper, /cleanUrl\.searchParams\.delete\("session_id"\)/);
  assert.match(helper, /cleanUrl\.hash = "tool"/);
  assert.match(helper, /dropzone\?\.focus/);

  const magicLinkStart = script.indexOf("function completeMagicLinkAuthentication");
  const magicLinkEnd = script.indexOf("function completePasswordRecoveryAuthentication", magicLinkStart);
  const magicLinkHandler = script.slice(magicLinkStart, magicLinkEnd);
  assert.match(magicLinkHandler, /focusPaidWorkspaceAfterAuthentication/);
  assert.match(magicLinkHandler, /pack_activation_link/);

  const loginStart = script.indexOf("async function handleAccountLogin");
  const loginEnd = script.indexOf("async function handleAccountCreate", loginStart);
  const loginHandler = script.slice(loginStart, loginEnd);
  assert.match(loginHandler, /focusPaidWorkspaceAfterAuthentication/);
  assert.match(loginHandler, /pack_activation_password/);
  assert.match(loginHandler, /password_login/);
});

test("cleans a paid activation URL and focuses the upload control", async () => {
  const script = await readFile(path.join(root, "script.js"), "utf8");
  const helperStart = script.indexOf("function focusPaidWorkspaceAfterAuthentication");
  const helperEnd = script.indexOf("function completeMagicLinkAuthentication", helperStart);
  const helper = script.slice(helperStart, helperEnd);
  const events = [];
  let replacedUrl = "";
  let scrolled = false;
  let focused = false;
  const context = {
    currentAccount: {
      access: {
        canUsePro: true,
        isCreditPack: true,
        batchLimit: 100,
        monthlyLimit: 250,
        monthlyRemaining: 250,
      },
    },
    checkoutPlanWaitingForAuth: () => "",
    hasTrackedPaidWorkspaceReady: false,
    trackEvent: (name, detail) => events.push({ name, detail }),
    defaultProBatchLimit: 100,
    isCheckoutActivationReturn: true,
    window: {
      location: {
        href: "https://batchcutout.com/?checkout=success&session_id=cs_test&auth=magiclink&checkout_plan=pack250#accountTitle",
      },
      history: {
        replaceState: (_state, _title, url) => {
          replacedUrl = url;
        },
      },
      setTimeout: (callback) => callback(),
    },
    dropzone: {
      scrollIntoView: () => {
        scrolled = true;
      },
      focus: () => {
        focused = true;
      },
    },
    URL,
  };

  const result = runInNewContext(`${helper}; focusPaidWorkspaceAfterAuthentication("pack_activation_link");`, context);

  assert.equal(result, true);
  assert.equal(replacedUrl, "/#tool");
  assert.equal(scrolled, true);
  assert.equal(focused, true);
  assert.deepEqual(JSON.parse(JSON.stringify(events)), [{
    name: "paid_workspace_ready",
    detail: {
      source: "pack_activation_link",
      access_type: "pack",
      batch_limit: 100,
      credits_remaining: 250,
      monthly_remaining: 0,
    },
  }]);
});

test("tracks the first real Pack batch from processing start to completion", async () => {
  const script = await readFile(path.join(root, "script.js"), "utf8");
  const processStart = script.indexOf("async function processImages");
  const processEnd = script.indexOf("function downloadSinglePng", processStart);
  const processHandler = script.slice(processStart, processEnd);

  assert.match(processHandler, /accessBeforeProcessing\.isCreditPack/);
  assert.match(processHandler, /accessBeforeProcessing\.monthlyUsed/);
  assert.match(processHandler, /trackEvent\("pack_first_batch_started"/);
  assert.match(processHandler, /trackEvent\("pack_first_batch_completed"/);
  assert.match(processHandler, /isFirstPackBatch && completed > 0/);
});

test("accepts and reports paid activation events in the admin dashboard", async () => {
  const [trackApi, statsApi, admin] = await Promise.all([
    readFile(path.join(root, "api", "track.js"), "utf8"),
    readFile(path.join(root, "api", "stats.js"), "utf8"),
    readFile(path.join(root, "admin.html"), "utf8"),
  ]);

  for (const eventName of [
    "paid_workspace_ready",
    "pack_first_batch_started",
    "pack_first_batch_completed",
  ]) {
    assert.match(trackApi, new RegExp(`"${eventName}"`));
    assert.match(statsApi, new RegExp(`case "${eventName}"`));
  }

  assert.match(admin, /id="livePaidWorkspaceReady"/);
  assert.match(admin, /id="livePackFirstBatchesStarted"/);
  assert.match(admin, /id="livePackFirstBatchesCompleted"/);
});
