import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  applyPackPurchaseFromSession,
  isPaidCheckoutSession,
  packCreditEntitlementFromEvents,
  packProfilePatchForEntitlement,
} from "../api/_stripe.js";
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

test("deduplicates the paid-session ledger before calculating Pack entitlement", () => {
  const entitlement = packCreditEntitlementFromEvents([
    { event_label: "cs_pack_100", detail: { price_plan: "pack100" } },
    { event_label: "cs_pack_100", detail: { price_plan: "pack100" } },
    { event_label: "cs_pack_250", detail: { plan: "pack250" } },
    { event_label: "cs_unknown", detail: { plan: "monthly" } },
  ]);

  assert.equal(entitlement.credits, 350);
  assert.deepEqual(entitlement.sessionIds.sort(), ["cs_pack_100", "cs_pack_250"]);
});

test("reconciles Pack limits to entitlement without duplicating a retried purchase", () => {
  const baseProfile = {
    plan: "pack",
    plan_status: "active",
    batch_limit: 100,
    monthly_image_limit: 500,
    monthly_images_used: 20,
    current_period_start: "2026-07-01T00:00:00.000Z",
    current_period_end: "2099-12-31T23:59:59.000Z",
    stripe_customer_id: "cus_Existing",
    stripe_subscription_id: null,
  };
  const session = { customer: "cus_MixedCase" };
  const patch = packProfilePatchForEntitlement(baseProfile, session, 250);

  assert.equal(patch.monthly_image_limit, 250);
  assert.equal(patch.monthly_images_used, 20);
  assert.equal(patch.stripe_customer_id, "cus_MixedCase");
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

test("records a paid Pack before reconciling its deterministic credit limit", async () => {
  const source = await readFile(path.join(root, "api", "_stripe.js"), "utf8");
  const start = source.indexOf("export async function applyPackPurchaseFromSession");
  const handler = source.slice(start);

  assert.ok(start >= 0);
  assert.ok(handler.indexOf("recordPackPurchaseEvent") < handler.indexOf("getPackCreditEntitlement"));
  assert.ok(handler.indexOf("getPackCreditEntitlement") < handler.indexOf("reconcilePackProfileToEntitlement"));
  assert.ok(handler.indexOf("reconcilePackProfileToEntitlement") < handler.indexOf("recordPackCreditsAppliedEvent"));
  assert.match(handler, /if \(!entitlement\.sessionIds\.includes\(sessionId\)\)/);
  assert.match(handler, /if \(!creditsAlreadyApplied\) \{\s+await recordPackCreditsAppliedEvent/);
  assert.doesNotMatch(handler, /if \(creditsAlreadyApplied\) \{\s+return/);
});
