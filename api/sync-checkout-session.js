import {
  getAccessToken,
  getSupabaseSettings,
  getSupabaseUser,
  readRequestBody,
  sendJson,
} from "./_pro.js";
import { getStripeClient, updateProfileFromSubscription } from "./_stripe.js";

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

function asText(value, maxLength = 500) {
  if (value === null || value === undefined) return "";
  return String(value).slice(0, maxLength);
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

  const settings = getSupabaseSettings();
  if (!settings.supabaseUrl || !settings.serviceRoleKey) {
    return sendJson(response, 503, { ok: false, error: "supabase_not_configured" });
  }

  const accessToken = getAccessToken(request);
  if (!accessToken) {
    return sendJson(response, 401, { ok: false, error: "missing_access_token" });
  }

  try {
    const user = await getSupabaseUser(settings, accessToken);
    if (!user?.id) {
      return sendJson(response, 401, { ok: false, error: "invalid_access_token" });
    }

    const body = await readRequestBody(request);
    const sessionId = String(body?.sessionId || "").trim();
    if (!sessionId.startsWith("cs_")) {
      return sendJson(response, 400, { ok: false, error: "invalid_session_id" });
    }

    const { session, subscription } = await getSessionSubscription(stripe, sessionId);
    if (session.client_reference_id !== user.id) {
      return sendJson(response, 403, { ok: false, error: "checkout_session_user_mismatch" });
    }

    if (!subscription) {
      return sendJson(response, 409, { ok: false, error: "checkout_subscription_missing" });
    }

    const profile = await updateProfileFromSubscription(settings, subscription, user.id);
    const amountCents = checkoutAmountCents(session, subscription);
    const price = firstSubscriptionPrice(subscription);
    const metadata = {
      ...(session?.metadata || {}),
      ...(subscription?.metadata || {}),
    };

    return sendJson(response, 200, {
      ok: true,
      synced: true,
      sessionId: session.id,
      subscriptionId: subscription.id,
      customerId: typeof session.customer === "string" ? session.customer : session.customer?.id || "",
      customerEmail: asText(session.customer_details?.email || user.email || ""),
      amountCents,
      amount: Math.round(amountCents) / 100,
      currency: asText(session.currency || price?.currency || subscription.currency || "eur", 20).toUpperCase(),
      checkoutPlan: asText(metadata.batchcutout_price_plan || profile.plan || "monthly", 80),
      priceId: asText(price?.id, 120),
      plan: profile.plan,
      planStatus: profile.plan_status,
      batchLimit: profile.batch_limit,
      monthlyLimit: profile.monthly_image_limit,
    });
  } catch (error) {
    return sendJson(response, 500, {
      ok: false,
      error: "checkout_session_sync_failed",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }
}
