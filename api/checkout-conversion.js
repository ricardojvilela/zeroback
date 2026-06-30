import { readRequestBody, sendJson } from "./_pro.js";
import { getStripeClient } from "./_stripe.js";

function asText(value, maxLength = 500) {
  if (value === null || value === undefined) return "";
  return String(value).slice(0, maxLength);
}

function firstSubscriptionPrice(subscription) {
  return subscription?.items?.data?.[0]?.price || null;
}

function subscriptionAmountCents(subscription) {
  return (subscription?.items?.data || []).reduce((total, item) => {
    const quantity = Number(item.quantity || 1) || 1;
    const unitAmount = Number(item.price?.unit_amount || 0) || 0;
    return total + unitAmount * quantity;
  }, 0);
}

function checkoutAmountCents(session, subscription) {
  const sessionAmount = Number(session?.amount_total || 0) || 0;
  return sessionAmount || subscriptionAmountCents(subscription);
}

async function getSessionSubscription(stripe, sessionId) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  if (!session?.subscription) {
    return { session, subscription: null };
  }

  if (typeof session.subscription === "string") {
    return {
      session,
      subscription: await stripe.subscriptions.retrieve(session.subscription),
    };
  }

  return { session, subscription: session.subscription };
}

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    return sendJson(response, 200, { ok: true });
  }

  if (request.method !== "POST") {
    return sendJson(response, 405, { ok: false, error: "method_not_allowed" });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return sendJson(response, 503, { ok: false, error: "stripe_not_configured" });
  }

  try {
    const body = await readRequestBody(request);
    const sessionId = String(body?.sessionId || "").trim();
    if (!sessionId.startsWith("cs_")) {
      return sendJson(response, 400, { ok: false, error: "invalid_session_id" });
    }

    const { session, subscription } = await getSessionSubscription(stripe, sessionId);
    if (session.mode !== "subscription" || session.payment_status !== "paid" || !subscription) {
      return sendJson(response, 409, { ok: false, error: "checkout_not_paid" });
    }

    const metadata = {
      ...(session?.metadata || {}),
      ...(subscription?.metadata || {}),
    };
    const price = firstSubscriptionPrice(subscription);
    const amountCents = checkoutAmountCents(session, subscription);

    return sendJson(response, 200, {
      ok: true,
      paid: true,
      sessionId: session.id,
      subscriptionId: subscription.id,
      amountCents,
      amount: Math.round(amountCents) / 100,
      currency: asText(session.currency || price?.currency || subscription.currency || "eur", 20).toUpperCase(),
      checkoutPlan: asText(metadata.batchcutout_price_plan || "monthly", 80),
      priceId: asText(price?.id, 120),
    });
  } catch (error) {
    return sendJson(response, 500, {
      ok: false,
      error: "checkout_conversion_lookup_failed",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }
}
