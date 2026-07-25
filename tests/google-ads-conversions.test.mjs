import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("sends one zero-value secondary conversion when the free test is completed", async () => {
  const script = await readFile(path.join(root, "script.js"), "utf8");
  const helperStart = script.indexOf("function recordFreeTestSuccess");
  const helperEnd = script.indexOf("function getAccountBatchLimit", helperStart);
  const helper = script.slice(helperStart, helperEnd);
  const events = [];
  const conversions = [];
  const item = {
    freeUsageCounted: false,
    outputBlob: {},
  };
  const context = {
    canUsePaidAccess: () => false,
    freeTestImagesUsed: 1,
    freeTestImageLimit: 2,
    storeFreeTestImagesUsed: () => {},
    trackEvent: (name, detail) => events.push({ name, detail }),
    trackGoogleAdsConversion: (sendTo, options) => conversions.push({ sendTo, options }),
    freeTestCompletedConversionId: "AW-18177126609/ZdXVCLmckNYcENHhw9tD",
    item,
  };

  assert.ok(helperStart >= 0 && helperEnd > helperStart);
  runInNewContext(`${helper}; recordFreeTestSuccess(item);`, context);

  assert.equal(context.freeTestImagesUsed, 2);
  assert.equal(item.freeUsageCounted, true);
  assert.deepEqual(JSON.parse(JSON.stringify(events)), [{
    name: "free_test_completed",
    detail: {
      count: 2,
      free_limit: 2,
      free_remaining: 0,
    },
  }]);
  assert.deepEqual(JSON.parse(JSON.stringify(conversions)), [{
    sendTo: "AW-18177126609/ZdXVCLmckNYcENHhw9tD",
    options: {
      value: 0,
    },
  }]);
});
