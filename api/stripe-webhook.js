import { getSupabaseSettings } from "./_pro.js";
import { getStripeClient, updateProfileFromSubscription } from "./_stripe.js";

const attributionKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "gbraid",
  "wbraid",
  "source",
  "medium",
  "campaign",
  "first_source",
  "first_campaign",
  "first_landing_page",
  "last_source",
  "last_campaign",
  "last_landing_page",
  "page_path",
  "page_location",
  "language",
  "visitor_id",
  "session_id",
  "limit_variant",
  "free_limit",
];

function webhookJson(status, data) {
  return Response.json(data, { status });
}

function asText(value, maxLength = 1000) {
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

function attributionFromMetadata(metadata = {}) {
  const attribution = {};
  for (const key of attributionKeys) {
    const value = metadata[key];
    if (value === null || value === undefined || value === "") continue;
    attribution[key] = asText(value, 1000);
  }
  return attribution;
}

async function paidEventAlreadyStored(settings, tableName, sessionId) {
  if (!sessionId) return false;

  const query = new URLSearchParams({
    event_name: "eq.pro_subscription_paid",
    event_label: `eq.${sessionId}`,
    select: "id",
    limit: "1",
  });

  const response = await fetch(`${settings.supabaseUrl}/rest/v1/${tableName}?${query}`, {
    headers: {
      apikey: settings.serviceRoleKey,
      Authorization: `Bearer ${settings.serviceRoleKey}`,
    },
  });

  if (!response.ok) return false;
  const rows = await response.json().catch(() => []);
  return rows.length > 0;
}

async function storePaidSubscriptionEvent(settings, event, session, subscription) {
  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";
  const sessionId = asText(session?.id, 120);
  if (await paidEventAlreadyStored(settings, tableName, sessionId)) return;

  const metadata = {
    ...(session?.metadata || {}),
    ...(subscription?.metadata || {}),
  };
  const attribution = attributionFromMetadata(metadata);
  const amountCents = checkoutAmountCents(session, subscription);
  const currency = asText(session?.currency || firstSubscriptionPrice(subscription)?.currency || subscription?.currency || "eur", 20);
  const value = Math.round(amountCents) / 100;
  const detail = {
    ...attribution,
    stripe_event_id: asText(event?.id, 120),
    stripe_session_id: sessionId,
    stripe_customer_id: asText(typeof session?.customer === "string" ? session.customer : session?.customer?.id, 120),
    stripe_subscription_id: asText(subscription?.id, 120),
    stripe_price_id: asText(firstSubscriptionPrice(subscription)?.id, 120),
    plan: asText(metadata.batchcutout_price_plan || "monthly", 80),
    plan_label: asText(metadata.batchcutout_price_plan || "monthly", 80),
    subscription_status: asText(subscription?.status, 80),
    amount_cents: amountCents,
    amount: value,
    currency: currency.toUpperCase(),
  };
  const row = {
    event_name: "pro_subscription_paid",
    event_category: "revenue",
    event_label: sessionId,
    page_path: asText(attribution.page_path, 500),
    page_location: asText(attribution.page_location, 1000),
    language: asText(attribution.language, 20),
    session_id: asText(attribution.session_id, 80),
    visitor_id: asText(attribution.visitor_id, 80),
    source: asText(attribution.utm_source || attribution.source || attribution.last_source || attribution.first_source, 160),
    campaign: asText(attribution.utm_campaign || attribution.campaign || attribution.last_campaign || attribution.first_campaign, 160),
    free_limit: Number(attribution.free_limit || 0) || null,
    value,
    detail,
    occurred_at: new Date(Number(event?.created || Date.now() / 1000) * 1000).toISOString(),
  };

  const response = await fetch(`${settings.supabaseUrl}/rest/v1/${tableName}`, {
    method: "POST",
    headers: {
      apikey: settings.serviceRoleKey,
      Authorization: `Bearer ${settings.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });

  if (!response.ok) {
    const detailText = await response.text();
    throw new Error(`paid_event_insert_failed:${response.status}:${detailText.slice(0, 300)}`);
  }
}

async function getSubscriptionFromCheckout(stripe, session) {
  if (!session?.subscription) return null;
  if (typeof session.subscription === "string") {
    return stripe.subscriptions.retrieve(session.subscription);
  }
  return session.subscription;
}

async function handleStripeEvent(event) {
  const settings = getSupabaseSettings();
  if (!settings.supabaseUrl || !settings.serviceRoleKey) {
    return webhookJson(503, { ok: false, error: "supabase_not_configured" });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return webhookJson(503, { ok: false, error: "stripe_not_configured" });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const subscription = await getSubscriptionFromCheckout(stripe, session);
      if (subscription) {
        await updateProfileFromSubscription(settings, subscription, session.client_reference_id);
        try {
          await storePaidSubscriptionEvent(settings, event, session, subscription);
        } catch (error) {
          console.error("BatchCutout paid subscription event failed", error);
        }
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await updateProfileFromSubscription(settings, event.data.object);
    }

    return webhookJson(200, { ok: true, received: true });
  } catch (error) {
    return webhookJson(500, {
      ok: false,
      error: "stripe_webhook_failed",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }
}

export async function POST(request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  if (!stripe || !webhookSecret) {
    return webhookJson(503, { ok: false, error: "stripe_webhook_not_configured" });
  }

  const signature = request.headers.get("stripe-signature") || "";
  if (!signature) {
    return webhookJson(400, { ok: false, error: "missing_stripe_signature" });
  }

  let event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return webhookJson(400, {
      ok: false,
      error: "invalid_stripe_signature",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }

  return handleStripeEvent(event);
}

export function GET() {
  return webhookJson(405, { ok: false, error: "method_not_allowed" });
}
