import {
  getAccessToken,
  getSupabaseSettings,
  getSupabaseUser,
  loadOrCreateProfile,
  readRequestBody,
  sendJson,
} from "./_pro.js";
import {
  attachStripeCustomerToProfile,
  getPlanLabel,
  getSiteUrl,
  getStripeClient,
  getStripePriceId,
} from "./_stripe.js";

const attributionMetadataKeys = [
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

function metadataString(value, maxLength = 450) {
  if (value === null || value === undefined) return "";
  return String(value).slice(0, maxLength);
}

function sanitizeAttribution(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};

  const attribution = {};
  for (const key of attributionMetadataKeys) {
    const value = input[key];
    if (value === null || value === undefined || value === "") continue;
    if (!["string", "number", "boolean"].includes(typeof value)) continue;
    attribution[key] = metadataString(value);
  }

  return attribution;
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
    const { plan, priceId } = getStripePriceId(body?.plan);
    const attribution = sanitizeAttribution(body?.attribution);
    if (!priceId) {
      return sendJson(response, 503, { ok: false, error: "stripe_price_not_configured", plan });
    }

    let profile = await loadOrCreateProfile(settings, user);
    let customerId = profile.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          supabase_user_id: user.id,
          batchcutout_plan: "pro",
        },
      });
      customerId = customer.id;
      profile = await attachStripeCustomerToProfile(settings, profile, customerId);
    }

    const siteUrl = getSiteUrl();
    const metadata = {
      supabase_user_id: user.id,
      batchcutout_plan: "pro",
      batchcutout_price_plan: plan,
      ...attribution,
    };
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${siteUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}#accountTitle`,
      cancel_url: `${siteUrl}/pricing/?checkout=cancelled`,
      subscription_data: {
        metadata,
      },
      metadata,
      customer_update: {
        name: "auto",
        address: "auto",
      },
    });

    return sendJson(response, 200, {
      ok: true,
      url: session.url,
      plan,
      label: getPlanLabel(plan),
      customerId: profile.stripe_customer_id || customerId,
    });
  } catch (error) {
    return sendJson(response, 500, {
      ok: false,
      error: "checkout_session_failed",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }
}
