import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("keeps every result-ready Pack action on the email-only checkout path", async () => {
  const script = await readFile(path.join(root, "script.js"), "utf8");
  const helperStart = script.indexOf("async function continueResultReadyPackCheckout");
  const helperEnd = script.indexOf("function showPostDownloadFeedback", helperStart);
  const helper = script.slice(helperStart, helperEnd);

  assert.ok(helperStart >= 0 && helperEnd > helperStart);
  assert.match(helper, /startEmailPackCheckout\("pack100", email, triggerButton/);
  assert.match(helper, /pro_checkout_email_required/);
  assert.match(helper, /const emailInput = fields\.emailInput \|\| resultReadyEmail/);
  assert.match(helper, /emailForm\.scrollIntoView/);

  const actionsHandler = script.slice(
    script.indexOf('actionsPackCta?.addEventListener("click"'),
    script.indexOf("clearButton.addEventListener", script.indexOf('actionsPackCta?.addEventListener("click"')),
  );
  const stickyHandler = script.slice(
    script.indexOf('resultReadyStickyPro?.addEventListener("click"'),
    script.indexOf('postDownloadPackCta?.addEventListener("click"', script.indexOf('resultReadyStickyPro?.addEventListener("click"')),
  );
  const postDownloadHandler = script.slice(
    script.indexOf('postDownloadPackCta?.addEventListener("click"'),
    script.indexOf('resultReadySaveLinkCta?.addEventListener("click"', script.indexOf('postDownloadPackCta?.addEventListener("click"')),
  );

  assert.match(actionsHandler, /continueResultReadyPackCheckout\("actions_result_ready_pack"/);
  assert.match(stickyHandler, /continueResultReadyPackCheckout\("result_ready_sticky"/);
  assert.match(postDownloadHandler, /continueResultReadyPackCheckout\(/);
  assert.match(postDownloadHandler, /emailInput: postDownloadEmail/);
  assert.match(postDownloadHandler, /emailForm: postDownloadEmailForm/);
  assert.match(postDownloadHandler, /emailMessage: postDownloadEmailMessage/);
  assert.doesNotMatch(actionsHandler, /startCheckout\(/);
  assert.doesNotMatch(stickyHandler, /startCheckout\(/);
  assert.doesNotMatch(postDownloadHandler, /startCheckout\(/);
});

test("replaces the pre-download offers with one post-download Pack action", async () => {
  const [index, script, apiTrack, stats, admin] = await Promise.all([
    readFile(path.join(root, "index.html"), "utf8"),
    readFile(path.join(root, "script.js"), "utf8"),
    readFile(path.join(root, "api", "track.js"), "utf8"),
    readFile(path.join(root, "api", "stats.js"), "utf8"),
    readFile(path.join(root, "admin.html"), "utf8"),
  ]);
  const showStart = script.indexOf("function showPostDownloadNext");
  const showEnd = script.indexOf("function focusPostDownloadLeadCapture", showStart);
  const showPostDownloadNext = script.slice(showStart, showEnd);
  const feedbackStart = script.indexOf("function showPostDownloadFeedback");
  const feedbackEnd = script.indexOf("function shouldShowLeadCapture", feedbackStart);
  const showPostDownloadFeedback = script.slice(feedbackStart, feedbackEnd);

  assert.ok(showStart >= 0 && showEnd > showStart);
  assert.match(showPostDownloadNext, /downloadReadyHint\?\.classList\.add\("hidden"\)/);
  assert.match(showPostDownloadNext, /actionsPackCta\?\.classList\.add\("hidden"\)/);
  assert.match(showPostDownloadNext, /resultReadyStickyCta\?\.classList\.add\("hidden"\)/);
  assert.match(showPostDownloadNext, /postDownloadEmail\.value = normalizeEmail/);
  assert.match(showPostDownloadFeedback, /proInterestPanel\?\.classList\.add\("hidden"\)/);

  const postDownloadPanel = index.slice(
    index.indexOf('id="postDownloadNextPanel"'),
    index.indexOf('class="status-panel"'),
  );
  assert.match(postDownloadPanel, /id="postDownloadFeedback"/);
  assert.match(script, /trackEvent\("post_download_feedback_shown"/);
  assert.match(apiTrack, /"post_download_feedback_shown"/);
  assert.match(stats, /case "post_download_feedback_shown":/);
  assert.match(admin, /id="livePostDownloadFeedbackViews"/);
  assert.match(admin, /id="livePostDownloadFeedbackRate"/);
});
