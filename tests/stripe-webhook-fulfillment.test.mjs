import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { applyPackPurchaseFromSession, isPaidCheckoutSession } from "../api/_stripe.js";
import { isCheckoutFulfillmentEvent } from "../api/stripe-webhook.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("recognizes immediate and delayed successful Checkout events", () => {
  assert.equal(isCheckoutFulfillmentEvent("checkout.session.completed"), true);
  assert.equal(isCheckoutFulfillmentEvent("checkout.session.async_payment_succeeded"), true);
  assert.equal(isCheckoutFulfillmentEvent("checkout.session.async_payment_failed"), false);
  assert.equal(isCheckoutFulfillmentEvent("checkout.session.expired"), false);
});

test("requires Stripe to report a paid Checkout session", () => {
  assert.equal(isPaidCheckoutSession({ payment_status: "paid" }), true);
  assert.equal(isPaidCheckoutSession({ payment_status: "unpaid" }), false);
  assert.equal(isPaidCheckoutSession({ payment_status: "no_payment_required" }), false);
  assert.equal(isPaidCheckoutSession(null), false);
});

test("never applies Pack credits for an unpaid Checkout session", async () => {
  const session = {
    id: "cs_test_unpaid",
    mode: "payment",
    payment_status: "unpaid",
    metadata: {
      batchcutout_purchase_type: "pack",
      batchcutout_price_plan: "pack100",
    },
  };

  await assert.rejects(
    applyPackPurchaseFromSession({}, session),
    /stripe_checkout_not_paid/,
  );
});

test("reports delayed-payment failures and expired Checkout sessions", async () => {
  const [webhook, stats, admin] = await Promise.all([
    readFile(path.join(root, "api", "stripe-webhook.js"), "utf8"),
    readFile(path.join(root, "api", "stats.js"), "utf8"),
    readFile(path.join(root, "admin.html"), "utf8"),
  ]);

  assert.match(webhook, /event\.type === "checkout\.session\.async_payment_failed"/);
  assert.match(webhook, /recordCheckoutLifecycleEvent\(settings, event, "checkout_payment_failed"\)/);
  assert.match(webhook, /event\.type === "checkout\.session\.expired"/);
  assert.match(webhook, /recordCheckoutLifecycleEvent\(settings, event, "checkout_session_expired"\)/);
  assert.match(stats, /case "checkout_payment_failed":/);
  assert.match(stats, /case "checkout_session_expired":/);
  assert.match(admin, /id="liveCheckoutSessionsExpired"/);
});
